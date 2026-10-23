import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle, PhoneIncoming, ShieldCheck, HeartPulse } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Post or Search Request",
      desc: "Specify the required blood group, hospital in Hyderabad (LUH, Rajputana, etc.), and patient attendant contact.",
      icon: PlusCircle,
    },
    {
      step: "02",
      title: "Direct Attendant Contact",
      desc: "Eligible donors in Hyderabad connect immediately with the attendant via phone to confirm hospital OT readiness.",
      icon: PhoneIncoming,
    },
    {
      step: "03",
      title: "Hospital Blood Bank Transfusion",
      desc: "Donation occurs inside the certified hospital blood bank under full professional medical screening & cross-matching.",
      icon: HeartPulse,
    },
  ]

  return (
    <section id="how-it-works" className="py-12 md:py-20 bg-secondary/50 border-y border-border/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="size-3.5" />
            Transparent & Safe
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            How BloodBridge Coordinates in Hyderabad
          </h2>
          <p className="text-sm text-muted-foreground">
            A fast, direct loop connecting families with willing voluntary donors without red tape or delays.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.step} className="border-border bg-card rounded-2xl shadow-xs relative overflow-hidden">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-mono text-2xl font-black text-muted-foreground/30">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Ethical commitment banner */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-sm font-bold text-foreground">
              Strict Non-Commercial Voluntary Policy
            </p>
            <p className="text-xs text-muted-foreground max-w-2xl">
              BloodBridge strictly prohibits buying or selling blood. All screening, infectious disease testing (HBsAg, HCV, HIV), and cross-matching are exclusively handled by licensed hospital laboratories.
            </p>
          </div>
          <span className="shrink-0 px-3 py-1.5 rounded-full bg-white dark:bg-card border border-border text-xs font-bold text-foreground">
            100% Free
          </span>
        </div>

      </div>
    </section>
  )
}
