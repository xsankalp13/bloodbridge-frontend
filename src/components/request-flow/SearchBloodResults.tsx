import * as React from "react"
import { BrandLogo } from "@/components/common/BrandLogo"
import { BloodGroupBadge } from "@/components/common/BloodGroupBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { BloodRequest, GeoCoordinates } from "@/types"
import { PAKISTAN_BLOOD_BANKS, type BloodBankFacility } from "@/data/bloodBanksData"
import { calculateDistanceKm, formatDistance } from "@/lib/geoUtils"
import {
  ArrowLeft,
  Building2,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Zap,
  FastForward,
  UserCheck,
  PhoneCall,
  Navigation,
} from "lucide-react"
import { BloodBanksMap } from "./BloodBanksMap"
import { api } from "@/lib/api"

interface SearchBloodResultsProps {
  request: BloodRequest
  userCoords: GeoCoordinates | null
  userCity: string
  onBack: () => void
  onDone: () => void
}

export function SearchBloodResults({
  request,
  userCoords,
  userCity,
  onBack,
  onDone,
}: SearchBloodResultsProps) {
  const [activeTab, setActiveTab] = React.useState<"blood-banks" | "donors">("blood-banks")
  const [selectedBankId, setSelectedBankId] = React.useState<string | null>(null)

  // ==========================================
  // SIMULATION STATE (1-minute timer & donor pop)
  // ==========================================
  const [secondsRemaining, setSecondsRemaining] = React.useState(60)
  const [isSearching, setIsSearching] = React.useState(true)
  const [matchedDonor, setMatchedDonor] = React.useState<{
    name: string
    bloodGroup: string
    phone: string
    location: string
    distanceKm: number
    etaMins: number
    donationsCount: number
  } | null>(null)

  // Simulation step messages
  const [currentStepLog, setCurrentStepLog] = React.useState(
    "Scanning registered standby donors in your vicinity..."
  )

  // Simulated donor details based on the requested blood group & city
  const donorTemplate = React.useMemo(() => {
    const names = [
      "Hamza Tariq Shaikh",
      "Daniyal Ali Memon",
      "Zeeshan Ahmed Khan",
      "Bilal Soomro",
      "Usman Farooq",
    ]
    const chosenName = names[Math.floor(Math.random() * names.length)]

    return {
      name: chosenName,
      bloodGroup: request.bloodGroup,
      phone: "3019827140",
      location: `${request.hospital.area || userCity}`,
      distanceKm: 2.8,
      etaMins: 20,
      donationsCount: 7,
    }
  }, [request.bloodGroup, request.hospital.area, userCity])

  // Timer countdown effect (60 seconds)
  React.useEffect(() => {
    if (!isSearching) return

    if (secondsRemaining <= 0) {
      setIsSearching(false)
      setMatchedDonor(donorTemplate)
      return
    }

    // Step-by-step log updates during the 1-minute search
    if (secondsRemaining === 55) {
      setCurrentStepLog(
        `Identified 8 matching ${request.bloodGroup} standby donors within 8 km of ${request.hospital.name}.`
      )
    } else if (secondsRemaining === 45) {
      setCurrentStepLog(
        `Dispatched emergency WhatsApp request alerts with Case #${request.referenceCode} to 4 active donors.`
      )
    } else if (secondsRemaining === 30) {
      setCurrentStepLog(
        "Awaiting donor acknowledgment and hospital transit confirmation..."
      )
    } else if (secondsRemaining === 15) {
      setCurrentStepLog(
        "Donor received alert and is confirming current transit readiness..."
      )
    } else if (secondsRemaining === 5) {
      setCurrentStepLog("Donor confirmed! Finalizing contact details...")
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsRemaining, isSearching, donorTemplate, request])

  // Fast-forward simulation handler
  const handleFastForward = () => {
    setIsSearching(false)
    setSecondsRemaining(0)
    setMatchedDonor(donorTemplate)

    // Notify backend
    api.whatsapp
      .simulateAccept({
        request_id: request.id,
        blood_group: request.bloodGroup,
        location: `${request.hospital.area || userCity}`,
      })
      .catch((err) => console.warn("Simulate accept notice:", err))
  }

  // ==========================================
  // NEAREST BLOOD BANKS CALCULATION & FETCH
  // ==========================================
  const [nearbyBloodBanks, setNearbyBloodBanks] = React.useState<BloodBankFacility[]>(() => {
    const list = PAKISTAN_BLOOD_BANKS.map((bb) => {
      let distanceKm: number | undefined
      if (userCoords) {
        distanceKm = calculateDistanceKm(
          userCoords.lat,
          userCoords.lng,
          bb.coordinates.lat,
          bb.coordinates.lng
        )
      } else if (bb.city.toLowerCase() === userCity.toLowerCase()) {
        distanceKm = 3.5
      }
      return { ...bb, distanceKm }
    })
    return list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
  })

  // Fetch verified facilities from live backend Supabase
  React.useEffect(() => {
    api.bloodBanks
      .getNearest({
        lat: userCoords?.lat,
        lng: userCoords?.lng,
        city: userCity,
      })
      .then((data) => {
        if (data && data.length > 0) {
          const formatted: BloodBankFacility[] = data.map((d) => ({
            id: d.id,
            name: d.name,
            city: d.city,
            area: d.area,
            province: d.province,
            phone: d.phone,
            hours: d.hours,
            coordinates: { lat: d.latitude, lng: d.longitude },
            services: d.services,
            distanceKm: d.distance_km,
          }))
          setNearbyBloodBanks(formatted)
        }
      })
      .catch((err) => {
        console.warn("Using fallback local blood banks:", err)
      })
  }, [userCoords, userCity])

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/40 via-background to-background flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg active:scale-95"
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </button>
            <BrandLogo size="sm" />
          </div>

          {/* Active Case Pill */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs">
            <span className="font-mono font-bold text-foreground">
              #{request.referenceCode}
            </span>
            <BloodGroupBadge group={request.bloodGroup} size="sm" variant="solid" />
            <span className="text-muted-foreground">
              {request.unitsNeeded} unit{request.unitsNeeded > 1 ? "s" : ""}
            </span>
          </div>

          <Button
            size="sm"
            onClick={onDone}
            className="h-9 px-4 rounded-xl text-xs font-bold"
          >
            Finish Search
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Case Context Header Card */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Active Emergency Search
              </span>
              <span className="size-1.5 rounded-full bg-destructive animate-ping" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">
              {request.hospital.name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="size-3.5 text-primary shrink-0" />
              <span>
                {request.hospital.area}, {request.hospital.city}
              </span>
              <span>•</span>
              <strong className="text-foreground font-semibold">
                Attendant: {request.contactPerson} (+92 {request.contactPhone})
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <BloodGroupBadge group={request.bloodGroup} size="lg" variant="solid" />
            <div className="text-right">
              <span className="text-sm font-extrabold text-foreground block">
                {request.unitsNeeded} Unit{request.unitsNeeded > 1 ? "s" : ""}
              </span>
              <span className="text-[11px] font-bold text-destructive uppercase">
                {request.urgency}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Controls: Blood Banks vs Donors */}
        <div className="p-1 rounded-2xl bg-secondary border border-border grid grid-cols-2 gap-1 select-none">
          <button
            type="button"
            onClick={() => setActiveTab("blood-banks")}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "blood-banks"
                ? "bg-card text-primary shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building2 className="size-4 text-primary" />
            <span>Nearest Blood Banks</span>
            <span className="px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground text-[10px] font-bold border border-border">
              {nearbyBloodBanks.length} Facilities
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("donors")}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "donors"
                ? "bg-card text-primary shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="size-4 text-primary" />
            <span>Voluntary Donors</span>
            {isSearching ? (
              <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold animate-pulse">
                {formatTimer(secondsRemaining)}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                1 Matched
              </span>
            )}
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 2: VOLUNTARY DONORS (1-MIN SEARCH SIMULATION + MATCH) */}
        {/* ========================================================= */}
        {activeTab === "donors" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            
            {/* Searching Phase (0 - 60s) */}
            {isSearching && (
              <Card className="border-border rounded-3xl bg-card overflow-hidden shadow-sm">
                <CardContent className="p-8 text-center space-y-6">
                  {/* Radar Wave Pulse Animation */}
                  <div className="relative size-36 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping duration-1000" />
                    <div className="absolute inset-3 rounded-full bg-primary/15 animate-pulse duration-700" />
                    <div className="relative size-20 rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center shadow-lg shadow-primary/30">
                      <span className="text-xl font-mono font-black tracking-tight">
                        {formatTimer(secondsRemaining)}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-bold opacity-80">
                        Scanning
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                      Searching & Dispatching to Nearby Standby Donors
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      BloodBridge is automatically contacting registered standby donors in{" "}
                      <strong className="text-foreground">{request.hospital.city}</strong> via WhatsApp with Case #{request.referenceCode}.
                    </p>
                  </div>

                  {/* Live Progress Ticker */}
                  <div className="rounded-2xl bg-secondary/80 border border-border p-3.5 max-w-lg mx-auto text-xs text-foreground flex items-center justify-center gap-2">
                    <div className="size-2 rounded-full bg-primary animate-ping shrink-0" />
                    <span className="font-medium">{currentStepLog}</span>
                  </div>

                  {/* Fast-Forward Simulation Button */}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFastForward}
                      className="text-xs font-semibold rounded-xl gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <FastForward className="size-3.5 text-primary" />
                      Simulate Instant WhatsApp Acceptance (Skip Timer)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Matched Donor Accepted Phase (Popped up after search!) */}
            {!isSearching && matchedDonor && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                {/* Celebratory Banner */}
                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold">
                        Donor Accepted Emergency Request via WhatsApp!
                      </p>
                      <p className="text-[11px] opacity-80">
                        Donor is heading directly to {request.hospital.name} blood bank.
                      </p>
                    </div>
                  </div>

                  <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 shrink-0">
                    ETA ~{matchedDonor.etaMins} mins
                  </span>
                </div>

                {/* Popped Matched Donor Card */}
                <Card className="border-2 border-emerald-500/40 bg-card rounded-3xl shadow-lg overflow-hidden">
                  <CardContent className="p-6 sm:p-7 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
                      <div className="flex items-center gap-3.5">
                        <div className="size-13 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">
                          <UserCheck className="size-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black text-foreground">
                              {matchedDonor.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full border border-green-200">
                              <CheckCircle2 className="size-3" />
                              Confirmed
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5">
                            Verified Standby Donor · {matchedDonor.donationsCount} previous life-saving donations
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <BloodGroupBadge
                          group={matchedDonor.bloodGroup as any}
                          size="lg"
                          variant="solid"
                        />
                      </div>
                    </div>

                    {/* Proximity & Transit Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-secondary/80 border border-border/60 space-y-1">
                        <span className="text-muted-foreground block text-[11px] font-semibold uppercase">
                          Location & Distance
                        </span>
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <MapPin className="size-3.5 text-primary" />
                          <span>{matchedDonor.location}</span>
                          <span className="text-primary font-mono ml-auto">
                            ~{matchedDonor.distanceKm} km away
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-secondary/80 border border-border/60 space-y-1">
                        <span className="text-muted-foreground block text-[11px] font-semibold uppercase">
                          Estimated Arrival (ETA)
                        </span>
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <Clock className="size-3.5 text-emerald-600" />
                          <span>Arriving within ~{matchedDonor.etaMins} minutes</span>
                        </div>
                      </div>
                    </div>

                    {/* Attendant Next Steps Instructions */}
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs space-y-1 text-foreground">
                      <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                        <ShieldCheck className="size-4 shrink-0" />
                        <span>Action Required by Patient Attendant</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Please take the patient's cross-match sample slip to the {request.hospital.name} Blood Bank reception counter so laboratory staff can begin screening the moment the donor arrives.
                      </p>
                    </div>

                    {/* Direct Contact Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <a
                        href={`tel:+92${matchedDonor.phone}`}
                        className="w-full sm:flex-1"
                      >
                        <Button className="w-full h-12 text-sm font-bold rounded-xl shadow-xs gap-2">
                          <PhoneCall className="size-4" />
                          Call Donor Now (+92 {matchedDonor.phone})
                        </Button>
                      </a>

                      <a
                        href={`https://wa.me/92${matchedDonor.phone}?text=Assalam-o-Alaikum%20${encodeURIComponent(matchedDonor.name)},%20this%20is%20${encodeURIComponent(request.contactPerson)}%20from%20${encodeURIComponent(request.hospital.name)}%20regarding%20BloodBridge%20Case%20#${request.referenceCode}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:flex-1"
                      >
                        <Button
                          variant="outline"
                          className="w-full h-12 text-sm font-bold rounded-xl gap-2 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50"
                        >
                          <MessageSquare className="size-4" />
                          Message on WhatsApp
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: NEAREST BLOOD BANKS IN USER'S CITY & VICINITY      */}
        {/* ========================================================= */}
        {activeTab === "blood-banks" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Live Parallel Donor Scan Banner */}
            {isSearching ? (
              <div
                onClick={() => setActiveTab("donors")}
                className="rounded-2xl bg-primary/10 border border-primary/20 p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-primary/15 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-primary animate-ping shrink-0" />
                  <p className="text-foreground">
                    <strong className="text-primary font-bold">Parallel WhatsApp Dispatch Active:</strong>{" "}
                    Scanning standby donors in {request.hospital.city} ({formatTimer(secondsRemaining)} remaining)
                  </p>
                </div>
                <span className="text-primary font-bold shrink-0 underline text-[11px]">
                  View Radar &rarr;
                </span>
              </div>
            ) : matchedDonor ? (
              <div
                onClick={() => setActiveTab("donors")}
                className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-emerald-500/15 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <p className="text-emerald-950 dark:text-emerald-200">
                    <strong className="text-emerald-700 dark:text-emerald-400 font-bold">Donor Accepted!</strong>{" "}
                    {matchedDonor.name} accepted your request and is en route (~{matchedDonor.etaMins}m ETA).
                  </p>
                </div>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold shrink-0 underline text-[11px]">
                  View Contact & Call &rarr;
                </span>
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Hospital Blood Banks Near {request.hospital.city}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Interactive radar map with direct official contact numbers for 24/7 blood screening & cross-matching desks.
                </p>
              </div>
            </div>

            {/* Interactive Leaflet Map Component */}
            <BloodBanksMap
              bloodBanks={nearbyBloodBanks.slice(0, 10)}
              userCoords={userCoords || request.hospital.coordinates || null}
              hospitalName={request.hospital.name}
              selectedBankId={selectedBankId}
              onSelectBank={(bank) => setSelectedBankId(bank.id)}
            />

            {/* Blood Banks Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {nearbyBloodBanks.slice(0, 8).map((bb) => {
                const isSelected = selectedBankId === bb.id
                return (
                  <Card
                    key={bb.id}
                    onClick={() => setSelectedBankId(bb.id)}
                    className={`rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? "border-2 border-primary ring-2 ring-primary/20 shadow-md bg-primary/[0.02] scale-[1.01]"
                        : "border-border bg-card shadow-xs hover:border-primary/50 hover:shadow-sm"
                    }`}
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              {bb.city}
                            </span>
                            {bb.distanceKm !== undefined && (
                              <span className="text-[10px] font-mono font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">
                                {formatDistance(bb.distanceKm)}
                              </span>
                            )}
                            {isSelected && (
                              <span className="text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                                Selected on Map
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-foreground pt-1">
                            {bb.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="size-3 text-primary shrink-0" />
                            <span className="truncate">{bb.area}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs bg-secondary/80 p-3 rounded-xl border border-border/50">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Clock className="size-3.5 text-muted-foreground shrink-0" />
                          <span>{bb.hours}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground pl-5.5">
                          Services: {bb.services.join(", ")}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/60">
                        <a
                          href={`tel:${bb.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-primary hover:underline"
                        >
                          <Phone className="size-3" />
                          {bb.phone}
                        </a>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedBankId(bb.id)
                            }}
                            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
                          >
                            <MapPin className="size-3 text-primary" />
                            Locate
                          </button>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${bb.coordinates.lat},${bb.coordinates.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                          >
                            <Navigation className="size-3" />
                            Directions
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
