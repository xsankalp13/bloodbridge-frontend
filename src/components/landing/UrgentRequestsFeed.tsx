import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BloodGroupBadge } from "@/components/common/BloodGroupBadge"
import { UrgencyPill } from "@/components/common/UrgencyPill"
import type { BloodGroup, BloodRequest } from "@/types"
import { formatDistance } from "@/lib/geoUtils"
import { MapPin, PhoneCall, CheckCircle2, Share2, Filter, AlertCircle, Navigation } from "lucide-react"

interface UrgentRequestsFeedProps {
  requests: BloodRequest[]
  selectedGroup: BloodGroup | "All"
  onSelectGroup: (group: BloodGroup | "All") => void
  selectedCity: string
  onSelectCity: (city: string) => void
  userDetectedCity?: string
  isLocationLive?: boolean
  onCoordinate: (request: BloodRequest) => void
  onShare: (request: BloodRequest) => void
  onPostRequest: () => void
}

const BLOOD_GROUPS: Array<"All" | BloodGroup> = [
  "All",
  "O-",
  "O+",
  "B+",
  "B-",
  "A+",
  "A-",
  "AB+",
]

const POPULAR_CITIES = [
  "All Pakistan",
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Multan",
  "Faisalabad",
]

export function UrgentRequestsFeed({
  requests,
  selectedGroup,
  onSelectGroup,
  selectedCity,
  onSelectCity,
  userDetectedCity,
  isLocationLive,
  onCoordinate,
  onShare,
  onPostRequest,
}: UrgentRequestsFeedProps) {
  const filtered = requests.filter((r) => {
    const matchesGroup = selectedGroup === "All" || r.bloodGroup === selectedGroup
    const matchesCity =
      selectedCity === "All Pakistan" || r.hospital.city.toLowerCase() === selectedCity.toLowerCase()
    return matchesGroup && matchesCity
  })

  return (
    <section id="live-requests" className="py-12 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="size-2 rounded-full bg-primary" />
              Live Hospital Coordination · Pakistan Nationwide
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Urgent Blood Requests Near You
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLocationLive ? (
                <span className="inline-flex items-center gap-1 text-foreground font-medium">
                  <Navigation className="size-3.5 text-emerald-600" />
                  Sorted by closest distance to your detected GPS location ({userDetectedCity || "Pakistan"}).
                </span>
              ) : (
                "Verified hospital replacement requests across major medical facilities in Pakistan."
              )}
            </p>
          </div>

          <Button
            onClick={onPostRequest}
            className="self-start md:self-auto h-10 px-4 rounded-xl font-semibold shadow-xs text-xs sm:text-sm"
          >
            + Post New Blood Request
          </Button>
        </div>

        {/* Filter Controls: City + Blood Group */}
        <div className="space-y-3">
          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mr-1 shrink-0">
              <MapPin className="size-3.5 text-primary" />
              <span>City:</span>
            </div>

            {POPULAR_CITIES.map((city) => {
              const isSelected = selectedCity === city
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => onSelectCity(city)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-secondary text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {city}
                  {city === userDetectedCity && (
                    <span className="ml-1 text-[10px] opacity-80">(You)</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Blood Group Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mr-1 shrink-0">
              <Filter className="size-3.5" />
              <span>Blood Group:</span>
            </div>

            {BLOOD_GROUPS.map((group) => {
              const isSelected = selectedGroup === group
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => onSelectGroup(group)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 transition-all border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-secondary text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {group}
                </button>
              )
            })}
          </div>
        </div>

        {/* Request Cards Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3 bg-secondary/30">
            <AlertCircle className="size-10 text-muted-foreground mx-auto stroke-1" />
            <h3 className="text-base font-bold text-foreground">
              No open requests found for {selectedGroup} in {selectedCity}
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              There are currently no matching emergency cases. You can view all cases across Pakistan or select another city.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onSelectCity("All Pakistan")
                  onSelectGroup("All")
                }}
                className="text-xs rounded-xl"
              >
                Show All Cases in Pakistan
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {filtered.map((req) => {
              const isCritical = req.urgency === "critical"
              return (
                <Card
                  key={req.id}
                  className={`border transition-all duration-200 shadow-xs hover:shadow-md rounded-2xl overflow-hidden ${
                    isCritical
                      ? "border-destructive/30 bg-card hover:border-destructive/50"
                      : "border-border bg-card"
                  }`}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Top row: Blood Group + Urgency */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <BloodGroupBadge
                          group={req.bloodGroup}
                          size="lg"
                          variant={isCritical ? "solid" : "subtle"}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-foreground">
                              #{req.referenceCode}
                            </span>
                            {req.verified && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                                <CheckCircle2 className="size-3" />
                                Verified Case
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5">
                            <strong className="text-foreground">{req.unitsNeeded} unit{req.unitsNeeded > 1 ? "s" : ""}</strong> needed
                          </p>
                        </div>
                      </div>

                      <UrgencyPill urgency={req.urgency} timeRemaining={req.timeRemaining} />
                    </div>

                    {/* Hospital & Area Box with Distance badge */}
                    <div className="rounded-xl bg-secondary/80 p-3 space-y-1 border border-border/50">
                      <div className="flex items-center justify-between gap-2 text-xs font-bold text-foreground">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="size-3.5 text-primary shrink-0" />
                          <span className="truncate">{req.hospital.name}</span>
                        </div>
                        {req.distanceKm !== undefined && (
                          <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                            {formatDistance(req.distanceKm)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground pl-5">
                        {req.hospital.area}, <strong className="text-foreground">{req.hospital.city}</strong> ({req.hospital.province})
                      </p>
                    </div>

                    {/* Clinical Note / Condition */}
                    <p className="text-xs text-foreground/85 leading-relaxed">
                      <strong className="text-foreground font-semibold">Reason:</strong> {req.condition}
                      {req.notes && (
                        <span className="block text-[11px] text-muted-foreground mt-1">
                          Note: {req.notes}
                        </span>
                      )}
                    </p>

                    {/* Action Bar */}
                    <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                      <Button
                        className="flex-1 h-11 text-xs sm:text-sm font-semibold rounded-xl shadow-xs"
                        variant={isCritical ? "default" : "outline"}
                        onClick={() => onCoordinate(req)}
                      >
                        <PhoneCall className="size-4 mr-2" />
                        Coordinate Donation
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        className="h-11 w-11 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
                        onClick={() => onShare(req)}
                        title="Share request"
                      >
                        <Share2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

      </div>
    </section>
  )
}
