import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, XCircle, HeartHandshake, AlertCircle } from "lucide-react"

export function DonorEligibilityCheck() {
  const criteria = [
    { text: "Age between 18 and 60 years old", eligible: true },
    { text: "Body weight of at least 50 kg (110 lbs)", eligible: true },
    { text: "Minimum 90 days (3 months) since your last whole blood donation", eligible: true },
    { text: "Hemoglobin level ≥ 12.5 g/dL (tested quickly on-site for free)", eligible: true },
    { text: "Feeling well and free of fever, flu, or active infection for 7 days", eligible: true },
    { text: "Major surgery or dental extraction within the last 6 months", eligible: false, note: "Temporary 6-month deferral" },
    { text: "Currently pregnant or actively breastfeeding", eligible: false, note: "Deferral until 6 months post-lactation" },
  ]

  return (
    <section id="eligibility" className="py-12 md:py-20 bg-secondary/40 border-t border-border/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <HeartHandshake className="size-3.5" />
            Safe & Healthy Giving
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Can You Donate Blood Today?
          </h2>
          <p className="text-sm text-muted-foreground">
            A quick pre-screening guide before heading to any blood bank in Hyderabad.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="border-border bg-card rounded-2xl shadow-xs overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Standard Medical Eligibility Checklist
                </h3>

                <ul className="divide-y divide-border/60">
                  {criteria.map((item, idx) => (
                    <li key={idx} className="py-3 flex items-start gap-3 text-xs sm:text-sm text-foreground">
                      {item.eligible ? (
                        <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="size-5 text-destructive/80 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5">
                        <span className="leading-snug">{item.text}</span>
                        {item.note && (
                          <span className="block text-[11px] text-muted-foreground font-medium">
                            {item.note}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips Box */}
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs space-y-1.5 text-foreground">
                <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>Preparation on Donation Day</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Drink 2–3 glasses of water before donating. Eat a light meal 2–3 hours prior. Avoid fatty foods or heavy lifting right after donating.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </section>
  )
}
