import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { BloodGroup } from "@/types"
import { Flame, ShieldCheck, Heart, ArrowRight, Building2, PhoneCall } from "lucide-react"

interface HeroSectionProps {
  onPostRequest: () => void
  onRegisterDonor: () => void
  onSelectGroup: (group: BloodGroup | "All") => void
  selectedGroup: BloodGroup | "All"
  activeCount: number
}

const BLOOD_GROUPS: BloodGroup[] = ["O-", "O+", "B+", "B-", "A+", "A-", "AB+", "AB-"]

export function HeroSection({
  onPostRequest,
  onRegisterDonor,
  onSelectGroup,
  selectedGroup,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 md:pt-16 md:pb-24 border-b border-border/60 bg-gradient-to-b from-secondary/40 via-background to-background">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-72 bg-gradient-to-r from-primary/5 via-rose-500/10 to-primary/5 blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Subtext, CTAs */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            {/* Urgency Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-950/40 border border-destructive/20 text-xs font-semibold text-destructive">
              <span className="size-2 rounded-full bg-destructive animate-ping" />
              <Flame className="size-3.5" />
              <span>Emergency Blood Coordination · Hyderabad, Sindh</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold tracking-tight text-foreground leading-[1.15]">
              When Every Minute Counts,{" "}
              <span className="text-primary underline decoration-primary/30 decoration-wavy underline-offset-6">
                Bridge the Gap
              </span>{" "}
              for Life-Saving Blood.
            </h1>

            {/* Realistic copy reflecting: Donors register once; families get emergency support */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              In an emergency in Hyderabad, families can post requests instantly to reach verified standby donors. Donors register once — you don't need to check feeds daily; our coordination team calls you directly when a matching emergency occurs nearby.
            </p>

            {/* The 2 Main Hero Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
              <Button
                size="lg"
                onClick={onPostRequest}
                className="h-12 px-6 rounded-xl text-base font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all"
              >
                Need Blood Urgently
                <ArrowRight className="size-4 ml-2" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={onRegisterDonor}
                className="h-12 px-6 rounded-xl text-base font-bold border-2 border-primary/50 text-primary hover:bg-primary/5 transition-all"
              >
                <Heart className="size-4 mr-2 text-primary" />
                Register as a Donor
              </Button>
            </div>

            {/* Trust and safety micro-pills */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-success" />
                <span>100% Free Community Service</span>
              </div>
              <span className="hidden sm:inline text-border">•</span>
              <div className="flex items-center gap-1.5">
                <Building2 className="size-4 text-primary" />
                <span>Direct Hospital Cross-Matching</span>
              </div>
              <span className="hidden sm:inline text-border">•</span>
              <div className="flex items-center gap-1.5">
                <PhoneCall className="size-4 text-muted-foreground" />
                <span>Direct Standby Calling</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Quick Blood Type Availability Card */}
          <div className="lg:col-span-5 w-full">
            <Card className="border-border shadow-lg bg-card/95 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      Check Blood Group Demands
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Select your blood type to see urgent requests in Hyderabad
                    </p>
                  </div>
                  <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Heart className="size-4" />
                  </div>
                </div>

                {/* 8 Blood Type Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_GROUPS.map((group) => {
                    const isSelected = selectedGroup === group
                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => onSelectGroup(isSelected ? "All" : group)}
                        className={`h-11 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-sm transition-all border ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs scale-102"
                            : "bg-secondary text-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {group}
                      </button>
                    )
                  })}
                </div>

                {/* Information banner depending on selection */}
                <div className="rounded-xl bg-secondary/80 p-3.5 space-y-1.5 border border-border/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      {selectedGroup === "All"
                        ? "All Blood Types"
                        : `Blood Group: ${selectedGroup}`}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Hyderabad District
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedGroup === "O-" &&
                      "O-Negative is universal donor blood. Extremely critical for emergency trauma OT at LUH City Branch."}
                    {selectedGroup === "O+" &&
                      "O-Positive is the most requested blood group in Hyderabad for scheduled surgeries and post-partum care."}
                    {selectedGroup === "B+" &&
                      "High recurring demand for pediatric Thalassemia patients at Rajputana Hospital and Red Crescent."}
                    {selectedGroup === "B-" &&
                      "Rare blood type. Voluntary donors are urged to register standby availability for emergency calls."}
                    {selectedGroup === "A+" &&
                      "Regular demand across Latifabad maternity wards and general surgical units."}
                    {selectedGroup === "A-" &&
                      "Limited availability in local blood banks. Direct replacement donors actively requested."}
                    {selectedGroup === "AB+" &&
                      "Universal plasma donor. High utility for burn and dengue platelet support."}
                    {selectedGroup === "AB-" &&
                      "Rarest blood type in Sindh. Immediate coordination priority."}
                    {selectedGroup === "All" &&
                      "Tap any blood type above to check compatibility, or register as a donor so we can call you when a patient needs your blood."}
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={onRegisterDonor}
                  className="w-full h-11 text-xs font-semibold rounded-xl border-border hover:bg-secondary"
                >
                  <Heart className="size-3.5 mr-1.5 text-primary" />
                  Register Standby for {selectedGroup === "All" ? "Your Blood Type" : selectedGroup}
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </section>
  )
}
