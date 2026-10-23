import * as React from "react"
import { BrandLogo } from "@/components/common/BrandLogo"
import { BloodGroupBadge } from "@/components/common/BloodGroupBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { BloodGroup, BloodRequest } from "@/types"
import {
  Search,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  LogOut,
  ArrowLeft,
  Calendar,
  Share2,
  Flame,
} from "lucide-react"

export interface UserRequestHistoryItem {
  id: string
  referenceCode: string
  bloodGroup: BloodGroup
  unitsNeeded: number
  unitsReceived: number
  hospital: {
    name: string
    area: string
    city: string
  }
  status: "broadcasting" | "fulfilled" | "cancelled"
  date: string
  contactPhone: string
  contactPerson: string
  condition: string
}

interface RequesterDashboardProps {
  user: { name: string; phone: string }
  userCity: string
  onSignOut: () => void
  onBackToHome: () => void
  onSearchBlood: () => void
  onViewCaseDetails: (req: BloodRequest) => void
}

export function RequesterDashboard({
  user,
  userCity,
  onSignOut,
  onBackToHome,
  onSearchBlood,
}: RequesterDashboardProps) {
  // Pre-populated mock user history
  const [history, setHistory] = React.useState<UserRequestHistoryItem[]>([
    {
      id: "hist-1",
      referenceCode: "KHI-9104",
      bloodGroup: "O-",
      unitsNeeded: 2,
      unitsReceived: 1,
      hospital: {
        name: "Jinnah Postgraduate Medical Centre (JPMC)",
        area: "Rafiqui Shaheed Road, Cantt",
        city: "Karachi",
      },
      status: "broadcasting",
      date: "Today at 12:40 PM",
      contactPhone: user.phone || "3002819402",
      contactPerson: user.name || "Attendant",
      condition: "Emergency trauma surgery replacement units",
    },
    {
      id: "hist-2",
      referenceCode: "HYD-8421",
      bloodGroup: "O-",
      unitsNeeded: 1,
      unitsReceived: 1,
      hospital: {
        name: "Liaquat University Hospital (LUH)",
        area: "Latifabad Unit 4",
        city: "Hyderabad",
      },
      status: "fulfilled",
      date: "2 weeks ago · Completed",
      contactPhone: user.phone || "3013829104",
      contactPerson: user.name || "Attendant",
      condition: "Routine surgery support (Fulfilled by Red Crescent donor)",
    },
  ])

  const toggleStatus = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "broadcasting" ? "fulfilled" : "broadcasting"
          return {
            ...item,
            status: nextStatus,
            unitsReceived: nextStatus === "fulfilled" ? item.unitsNeeded : 0,
          }
        }
        return item
      })
    )
  }

  const activeCount = history.filter((h) => h.status === "broadcasting").length

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/40 via-background to-background flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg active:scale-95"
              title="Return to Public Feed"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Public Feed</span>
            </button>
            <BrandLogo size="md" />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs font-medium text-foreground border border-border">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Location: {userCity}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="h-9 px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
        
        {/* User Welcome Banner */}
        <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-secondary/60 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <span>Requester Portal · Pakistan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Welcome, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Phone: <strong className="text-foreground font-mono">+92 {user.phone}</strong> · Coordinate blood replacement requests, track volunteer responses, and broadcast emergency cases.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-secondary/80 border border-border text-center min-w-24">
              <span className="text-2xl font-black text-primary block leading-none">
                {activeCount}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground mt-1 block">
                Active Requests
              </span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-secondary/80 border border-border text-center min-w-24">
              <span className="text-2xl font-black text-success block leading-none">
                {history.filter((h) => h.status === "fulfilled").length}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground mt-1 block">
                Fulfilled Cases
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Button: "SEARCH FOR BLOOD" */}
        <div className="rounded-3xl bg-gradient-to-r from-primary via-primary/95 to-red-700 text-primary-foreground p-6 sm:p-8 shadow-lg shadow-primary/20 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs">
              <Flame className="size-3.5 text-amber-300" />
              <span>Need Blood Replacement Urgently?</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black leading-tight">
              Broadcast or Search for Compatible Blood
            </h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              Instantly broadcast a case to nearby registered standby donors and hospital blood banks across {userCity} and Pakistan.
            </p>
          </div>

          {/* Big Thumb-Friendly CTA Button */}
          <Button
            size="lg"
            onClick={onSearchBlood}
            className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-white text-primary hover:bg-white/90 font-black text-base shadow-md transition-all active:scale-95 shrink-0 relative z-10"
          >
            <Search className="size-5 mr-2 stroke-[2.5]" />
            Search for Blood
          </Button>
        </div>

        {/* Previous Blood Requests History Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                History of Previous Blood Requests
              </h3>
              <p className="text-xs text-muted-foreground">
                Your posted cases, coordinator calls, and fulfillment status.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onSearchBlood}
              className="self-start sm:self-auto h-9 text-xs font-semibold rounded-xl"
            >
              <Plus className="size-3.5 mr-1.5" />
              New Blood Request
            </Button>
          </div>

          {/* History Cards List */}
          {history.length === 0 ? (
            <Card className="border-dashed border-border rounded-2xl bg-secondary/20 p-12 text-center space-y-3">
              <AlertCircle className="size-10 text-muted-foreground mx-auto stroke-1" />
              <h4 className="text-base font-bold text-foreground">No Previous Blood Requests</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                You haven't posted any blood requests yet. Click the "Search for Blood" button above whenever you need urgent transfusion support.
              </p>
              <Button onClick={onSearchBlood} className="h-10 text-xs font-bold rounded-xl">
                <Search className="size-3.5 mr-1.5" />
                Search for Blood Now
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const isBroadcasting = item.status === "broadcasting"
                return (
                  <Card
                    key={item.id}
                    className={`border transition-all duration-200 rounded-2xl shadow-2xs hover:shadow-md overflow-hidden ${
                      isBroadcasting
                        ? "border-primary/40 bg-card hover:border-primary/60"
                        : "border-border bg-card/60"
                    }`}
                  >
                    <CardContent className="p-5 space-y-3.5">
                      {/* Top Header: Badge, Code, Status, Date */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <BloodGroupBadge
                            group={item.bloodGroup}
                            size="lg"
                            variant={isBroadcasting ? "solid" : "subtle"}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-foreground">
                                #{item.referenceCode}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  isBroadcasting
                                    ? "bg-red-50 text-destructive border border-destructive/20 dark:bg-destructive/15"
                                    : "bg-green-50 text-success border border-green-200 dark:bg-green-950/30"
                                }`}
                              >
                                {isBroadcasting ? (
                                  <>
                                    <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
                                    Broadcasting Live
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="size-3" />
                                    Fulfilled
                                  </>
                                )}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">
                              Required: <strong className="text-foreground">{item.unitsNeeded} unit{item.unitsNeeded > 1 ? "s" : ""}</strong> · Coordinated: {item.unitsReceived} of {item.unitsNeeded}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="size-3.5" />
                          <span>{item.date}</span>
                        </div>
                      </div>

                      {/* Hospital & Location */}
                      <div className="rounded-xl bg-secondary/80 p-3 space-y-1 text-xs border border-border/50">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <MapPin className="size-3.5 text-primary shrink-0" />
                          <span>{item.hospital.name}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground pl-5">
                          {item.hospital.area}, <strong className="text-foreground">{item.hospital.city}</strong>
                        </p>
                      </div>

                      {/* Condition Note */}
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        <strong className="text-foreground font-semibold">Details:</strong> {item.condition}
                      </p>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={isBroadcasting ? "outline" : "secondary"}
                            onClick={() => toggleStatus(item.id)}
                            className="h-9 text-xs font-semibold rounded-xl"
                          >
                            {isBroadcasting ? (
                              <>
                                <CheckCircle2 className="size-3.5 mr-1.5 text-success" />
                                Mark as Fulfilled
                              </>
                            ) : (
                              "Re-open Broadcasting"
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({
                                  title: `Case #${item.referenceCode} (${item.bloodGroup})`,
                                  text: `Blood needed for Case #${item.referenceCode} at ${item.hospital.name}, ${item.hospital.city}. Contact: +92 ${item.contactPhone}`,
                                }).catch(() => {})
                              } else {
                                alert(`Request details for #${item.referenceCode} copied!`)
                              }
                            }}
                            className="h-9 text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground"
                          >
                            <Share2 className="size-3.5 mr-1.5" />
                            Share
                          </Button>
                        </div>

                        <a href={`tel:${item.contactPhone}`} className="inline-block">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 text-xs font-semibold rounded-xl text-primary border-primary/30 hover:bg-primary/5"
                          >
                            <PhoneCall className="size-3.5 mr-1.5" />
                            +92 {item.contactPhone}
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
