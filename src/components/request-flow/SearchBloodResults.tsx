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
  MessageSquare,
  Navigation,
} from "lucide-react"
import { BloodBanksMap } from "./BloodBanksMap"
import { WhatsAppChatSimulation } from "./WhatsAppChatSimulation"
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
  const [activeTab, setActiveTab] = React.useState<"blood-banks" | "donors">("donors")
  const [selectedBankId, setSelectedBankId] = React.useState<string | null>(null)

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

        {/* Tab Controls: WhatsApp Live Dispatch vs Blood Banks */}
        <div className="p-1 rounded-2xl bg-secondary border border-border grid grid-cols-2 gap-1 select-none">
          <button
            type="button"
            onClick={() => setActiveTab("donors")}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "donors"
                ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="size-4 text-emerald-600" />
            <span>Live WhatsApp Dispatch</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
              Live Simulation
            </span>
          </button>

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
        </div>

        {/* ========================================================= */}
        {/* TAB 1: WHATSAPP LIVE DISPATCH SIMULATION                  */}
        {/* ========================================================= */}
        {activeTab === "donors" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <WhatsAppChatSimulation
              request={request}
              userCity={userCity}
              onSwitchToBloodBanks={() => setActiveTab("blood-banks")}
              onDone={onDone}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: NEAREST BLOOD BANKS IN USER'S CITY & VICINITY      */}
        {/* ========================================================= */}
        {activeTab === "blood-banks" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Live Parallel Donor Scan Banner */}
            <div
              onClick={() => setActiveTab("donors")}
              className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-emerald-500/15 transition-all text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <p className="text-foreground">
                  <strong className="text-emerald-700 dark:text-emerald-400 font-bold">Parallel WhatsApp Dispatch Active:</strong>{" "}
                  Connecting voluntary standby donors in {request.hospital.city} for Case #{request.referenceCode}.
                </p>
              </div>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold shrink-0 underline text-[11px]">
                View Live WhatsApp Chat &rarr;
              </span>
            </div>

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
