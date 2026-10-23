import * as React from "react"
import { Navbar } from "@/components/landing/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { UrgentRequestsFeed } from "@/components/landing/UrgentRequestsFeed"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { BloodCentersSection } from "@/components/landing/BloodCentersSection"
import { DonorEligibilityCheck } from "@/components/landing/DonorEligibilityCheck"
import { Footer } from "@/components/landing/Footer"
import { CoordinateModal } from "@/components/landing/CoordinateModal"
import { DonorRegisterModal } from "@/components/landing/DonorRegisterModal"
import { LocationPermissionModal } from "@/components/landing/LocationPermissionModal"
import { AuthPage } from "@/components/auth/AuthPage"
import { RequesterDashboard } from "@/components/dashboard/RequesterDashboard"
import { SearchBloodWizard } from "@/components/request-flow/SearchBloodWizard"
import { SearchBloodResults } from "@/components/request-flow/SearchBloodResults"
import constantCases from "@/data/constant.json"
import type { BloodGroup, BloodRequest, GeoCoordinates, PakistaniCity } from "@/types"
import {
  getNearestPakistaniCity,
  populateAndSortRequestsByLocation,
} from "@/lib/geoUtils"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Plus, Heart, CheckCircle2 } from "lucide-react"
import { BloodBridgeChatbot } from "@/components/chat/BloodBridgeChatbot"

export default function App() {
  const [currentView, setCurrentView] = React.useState<
    "landing" | "auth" | "dashboard" | "search-blood" | "search-results"
  >("landing")
  const [authMode, setAuthMode] = React.useState<"signin" | "signup">("signin")
  const [user, setUser] = React.useState<{ name: string; phone: string } | null>(null)

  // Geolocation state
  const [userCoords, setUserCoords] = React.useState<GeoCoordinates | null>(null)
  const [userDetectedCity, setUserDetectedCity] = React.useState<string>("Pakistan")
  const [locationLabel, setLocationLabel] = React.useState<string>("Detecting location...")
  const [isLocationLive, setIsLocationLive] = React.useState<boolean>(false)
  const [isGeoRequesting, setIsGeoRequesting] = React.useState<boolean>(false)
  const [permissionDenied, setPermissionDenied] = React.useState<boolean>(false)
  const [showLocationToast, setShowLocationToast] = React.useState(false)

  // Modals & search case states
  const [activeRequest, setActiveRequest] = React.useState<BloodRequest | null>(null)
  const [activeSearchCase, setActiveSearchCase] = React.useState<BloodRequest | null>(null)
  const [isCoordinateOpen, setIsCoordinateOpen] = React.useState(false)
  const [isRegisterDonorOpen, setIsRegisterDonorOpen] = React.useState(false)
  const [isLocationPermissionModalOpen, setIsLocationPermissionModalOpen] = React.useState(false)

  // Filter states
  const [selectedCity, setSelectedCity] = React.useState<string>("All Pakistan")
  const [selectedGroup, setSelectedGroup] = React.useState<BloodGroup | "All">("All")

  // Initialize requests from constant.json
  const [requests, setRequests] = React.useState<BloodRequest[]>(() => {
    return constantCases as unknown as BloodRequest[]
  })

  // Fetch live requests from Supabase Backend API
  React.useEffect(() => {
    api.requests
      .list({ limit: 50 })
      .then((data) => {
        if (data && data.length > 0) {
          const liveCases: BloodRequest[] = data.map((d) => ({
            id: d.id,
            referenceCode: d.reference_code,
            bloodGroup: d.blood_group,
            unitsNeeded: d.units_needed,
            hospital: {
              name: d.hospital.name,
              area: d.hospital.area || "",
              city: d.hospital.city,
              province: "Pakistan",
              coordinates: {
                lat: d.hospital.latitude,
                lng: d.hospital.longitude,
              },
            },
            urgency: (d.urgency as any) === "emergency" ? "critical" : d.urgency,
            requiredBy: (d.urgency as any) === "emergency" || d.urgency === "critical" ? "Within 2 Hours" : "Today",
            timeRemaining: (d.urgency as any) === "emergency" || d.urgency === "critical" ? "2h remaining" : "6h remaining",
            condition: d.notes || `${d.blood_component} needed immediately`,
            contactPerson: d.contact_person,
            contactPhone: d.contact_phone,
            verified: true,
            notes: d.notes,
          }))

          // Merge live Supabase cases on top of existing cases
          setRequests((prev) => {
            const existingIds = new Set(liveCases.map((c) => c.id))
            const remainingLocal = prev.filter((p) => !existingIds.has(p.id))
            const combined = [...liveCases, ...remainingLocal]
            return populateAndSortRequestsByLocation(combined, userCoords)
          })
        }
      })
      .catch((err) => {
        console.warn("Backend request fetch notice, using local cases:", err)
      })
  }, [userCoords])

  // Function to process coordinates
  const handleLocationSuccess = React.useCallback(
    (lat: number, lng: number) => {
      const coords: GeoCoordinates = { lat, lng }
      setUserCoords(coords)
      setIsLocationLive(true)
      setIsGeoRequesting(false)
      setPermissionDenied(false)

      const nearest = getNearestPakistaniCity(lat, lng)
      setUserDetectedCity(nearest.city)
      setLocationLabel(`${nearest.city} (${lat.toFixed(2)}°N)`)
      setSelectedCity(nearest.city)

      // Re-sort requests based on distance from user's location
      setRequests((prev) => populateAndSortRequestsByLocation(prev, coords))

      setShowLocationToast(true)
      setTimeout(() => setShowLocationToast(false), 5000)
    },
    []
  )

  // Geolocation request handler
  const fetchGeolocation = React.useCallback(
    (onComplete?: (success: boolean) => void) => {
      if (!navigator.geolocation) {
        setLocationLabel("Pakistan Nationwide")
        setPermissionDenied(true)
        onComplete?.(false)
        return
      }

      setIsGeoRequesting(true)

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleLocationSuccess(pos.coords.latitude, pos.coords.longitude)
          onComplete?.(true)
        },
        () => {
          setIsGeoRequesting(false)
          setPermissionDenied(true)
          setLocationLabel("Pakistan Nationwide")
          onComplete?.(false)
        },
        { enableHighAccuracy: true, timeout: 8000 }
      )
    },
    [handleLocationSuccess]
  )

  // Request location on first mount
  React.useEffect(() => {
    fetchGeolocation()
  }, [fetchGeolocation])

  /**
   * Flow for "Join as a Donor":
   * Must have location. If not given yet, prompt for permission.
   */
  const handleJoinAsDonorClick = () => {
    if (isLocationLive && userCoords) {
      setIsRegisterDonorOpen(true)
    } else {
      fetchGeolocation((success) => {
        if (success) {
          setIsRegisterDonorOpen(true)
        } else {
          setIsLocationPermissionModalOpen(true)
        }
      })
    }
  }

  const handleManualSelectCityFromModal = (city: PakistaniCity) => {
    setUserDetectedCity(city)
    setSelectedCity(city)
    setLocationLabel(`${city}, Pakistan`)
    setIsRegisterDonorOpen(true)
  }

  const handleCoordinate = (req: BloodRequest) => {
    setActiveRequest(req)
    setIsCoordinateOpen(true)
  }

  const handleShare = (req: BloodRequest) => {
    const text = `URGENT Blood Needed (${req.bloodGroup}): ${req.unitsNeeded} unit(s) for Case #${req.referenceCode} at ${req.hospital.name}, ${req.hospital.city}. Contact: +92 ${req.contactPhone}`
    
    if (navigator.share) {
      navigator.share({
        title: `Blood Needed: ${req.bloodGroup} at ${req.hospital.name}`,
        text,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text)
      alert("Request details copied to clipboard!")
    }
  }

  const handleAddNewRequest = (newReq: BloodRequest) => {
    setRequests((prev) => {
      const updated = [newReq, ...prev]
      return populateAndSortRequestsByLocation(updated, userCoords)
    })
  }

  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode)
    setCurrentView("auth")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const openSearchBloodWizard = () => {
    setCurrentView("search-blood")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // 1. Render Interactive Search for Blood Wizard (Step-by-step form)
  if (currentView === "search-blood") {
    return (
      <>
        <SearchBloodWizard
          userCoords={userCoords}
          userDetectedCity={userDetectedCity}
          isLocationLive={isLocationLive}
          onRequestLocation={fetchGeolocation}
          user={user}
          onBack={() => {
            if (user) {
              setCurrentView("dashboard")
            } else {
              setCurrentView("landing")
            }
          }}
          onSubmitRequest={(newReq) => {
            handleAddNewRequest(newReq)
            setActiveSearchCase(newReq)
            setCurrentView("search-results")
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
        />
        <BloodBridgeChatbot />
      </>
    )
  }

  // 2. Render Live Search Results Screen (Blood Banks & 1-min WhatsApp Donor Simulation)
  if (currentView === "search-results" && activeSearchCase) {
    return (
      <>
        <SearchBloodResults
          request={activeSearchCase}
          userCoords={userCoords}
          userCity={userDetectedCity}
          onBack={() => setCurrentView("search-blood")}
          onDone={() => {
            if (user) {
              setCurrentView("dashboard")
            } else {
              setCurrentView("landing")
            }
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
        />
        <BloodBridgeChatbot />
      </>
    )
  }

  // 3. Render Auth Page when selected
  if (currentView === "auth") {
    return (
      <>
        <AuthPage
          initialMode={authMode}
          onBack={() => setCurrentView("landing")}
          onAuthSuccess={(userData) => {
            setUser(userData)
            setCurrentView("dashboard")
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
        />
        <BloodBridgeChatbot />
      </>
    )
  }

  // 4. Render Requester Dashboard when user is on dashboard view
  if (currentView === "dashboard" && user) {
    return (
      <>
        <RequesterDashboard
          user={user}
          userCity={userDetectedCity}
          onSignOut={() => {
            setUser(null)
            setCurrentView("landing")
          }}
          onBackToHome={() => setCurrentView("landing")}
          onSearchBlood={openSearchBloodWizard}
          onViewCaseDetails={handleCoordinate}
        />

        <CoordinateModal
          request={activeRequest}
          isOpen={isCoordinateOpen}
          onClose={() => setIsCoordinateOpen(false)}
        />

        <BloodBridgeChatbot />
      </>
    )
  }

  // 5. Render Public Landing Page
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header Navigation */}
      <Navbar
        onPostRequest={openSearchBloodWizard}
        onRegisterDonor={handleJoinAsDonorClick}
        onNavigateAuth={() => openAuth("signin")}
        onNavigateDashboard={() => setCurrentView("dashboard")}
        currentUser={user}
        locationLabel={locationLabel}
        isLocationLive={isLocationLive}
        onRequestLocation={() => fetchGeolocation()}
      />

      {/* Geolocation Granted Banner */}
      {showLocationToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>
            Location verified near <strong className="font-bold">{userDetectedCity}</strong>. Populating closest blood requests from closest hospitals first.
          </span>
          <button
            onClick={() => setShowLocationToast(false)}
            className="text-[11px] underline ml-2 opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* User Login Status Banner (when viewing public feed while logged in) */}
      {user && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-xs text-center text-foreground flex items-center justify-center gap-3">
          <span>Signed in as <strong className="text-primary">{user.name}</strong></span>
          <button
            onClick={() => setCurrentView("dashboard")}
            className="text-xs font-bold text-primary underline hover:opacity-80"
          >
            Open My Dashboard →
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-16 md:pb-0">
        {/* Hero Section */}
        <HeroSection
          onPostRequest={openSearchBloodWizard}
          onRegisterDonor={handleJoinAsDonorClick}
          onSelectGroup={setSelectedGroup}
          selectedGroup={selectedGroup}
          activeCount={requests.length}
        />

        {/* Live Requests Feed */}
        <UrgentRequestsFeed
          requests={requests}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          userDetectedCity={userDetectedCity}
          isLocationLive={isLocationLive}
          onCoordinate={handleCoordinate}
          onShare={handleShare}
          onPostRequest={openSearchBloodWizard}
        />

        {/* How It Works */}
        <HowItWorks />

        {/* Major Hospital Blood Banks across Pakistan */}
        <BloodCentersSection />

        {/* Donor Eligibility Self-Check */}
        <DonorEligibilityCheck />
      </main>

      {/* Footer */}
      <Footer />

      {/* Coordinate Modal */}
      <CoordinateModal
        request={activeRequest}
        isOpen={isCoordinateOpen}
        onClose={() => setIsCoordinateOpen(false)}
      />

      {/* Location Permission Prompt Modal */}
      <LocationPermissionModal
        isOpen={isLocationPermissionModalOpen}
        onClose={() => setIsLocationPermissionModalOpen(false)}
        onRequestGeo={() => {
          fetchGeolocation((success) => {
            if (success) {
              setIsLocationPermissionModalOpen(false)
              setIsRegisterDonorOpen(true)
            }
          })
        }}
        onManualSelectCity={handleManualSelectCityFromModal}
        isRequesting={isGeoRequesting}
        permissionDenied={permissionDenied}
      />

      {/* Standby Donor Registration Modal */}
      <DonorRegisterModal
        isOpen={isRegisterDonorOpen}
        onClose={() => setIsRegisterDonorOpen(false)}
        detectedCity={userDetectedCity}
        userCoords={userCoords}
        onSuccess={() => alert("Thank you for registering as a standby donor! You don't need to check requests — our community team will call you directly when a patient in your vicinity needs your blood type.")}
      />

      {/* Mobile Floating Action Bar */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-2xl p-2 flex items-center gap-2">
        <Button
          onClick={openSearchBloodWizard}
          className="flex-1 h-11 text-xs font-bold rounded-xl shadow-xs"
        >
          <Plus className="size-4 mr-1.5" />
          Need Blood Urgently
        </Button>

        <Button
          variant="outline"
          onClick={handleJoinAsDonorClick}
          className="flex-1 h-11 text-xs font-bold rounded-xl border-primary/40 text-primary bg-background"
        >
          <Heart className="size-3.5 mr-1.5 text-primary" />
          Register as Donor
        </Button>
      </div>

      {/* AI Assistant Chatbot */}
      <BloodBridgeChatbot />
    </div>
  )
}