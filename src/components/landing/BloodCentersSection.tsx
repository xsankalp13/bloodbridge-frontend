import { Card, CardContent } from "@/components/ui/card"
import { Building2, Phone, Clock, MapPin } from "lucide-react"

export function BloodCentersSection() {
  const bloodCenters = [
    {
      name: "JPMC Blood Bank & Transfusion Center",
      city: "Karachi",
      area: "Rafiqui Shaheed Road, Karachi Cantt",
      phone: "021-99201300",
      hours: "24/7 Government Emergency Transfusion",
      services: "Emergency Trauma OT, Platelets, Component Separation",
    },
    {
      name: "Sundas Foundation & Blood Transfusion Centre",
      city: "Lahore",
      area: "Shadman / Ferozepur Road, Lahore",
      phone: "042-111786327",
      hours: "24/7 Screening & Transfusion",
      services: "Thalassemia Major & Hemophilia Specialized Support",
    },
    {
      name: "Pakistan Red Crescent National Blood Center",
      city: "Islamabad",
      area: "Sector H-8, Islamabad",
      phone: "051-9250404",
      hours: "24/7 National Transfusion & Donor Center",
      services: "NAT-Tested Blood Units, Platelet Apheresis",
    },
    {
      name: "Lady Reading Hospital Regional Blood Bank",
      city: "Peshawar",
      area: "GT Road, Soekarno Square, Peshawar",
      phone: "091-9211430",
      hours: "24/7 Emergency Transfusion Services",
      services: "Trauma Care, Whole Blood & Plasma Units",
    },
    {
      name: "Red Crescent Regional Blood Center",
      city: "Hyderabad",
      area: "Latifabad Unit 6, Hyderabad",
      phone: "022-9260100",
      hours: "24/7 Screening & Emergency Transfusion",
      services: "Platelet Apheresis, Free Thalassemia Support",
    },
    {
      name: "Fatimid Foundation Transfusion Centre",
      city: "Quetta",
      area: "Patel Road, Quetta",
      phone: "081-2821946",
      hours: "8:00 AM - 10:00 PM Daily",
      services: "Thalassemia & Bleeding Disorders Care",
    },
  ]

  return (
    <section id="blood-centers" className="py-12 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Building2 className="size-3.5" />
              Verified Infrastructure Across Pakistan
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Major Hospital Blood Banks in Pakistan
            </h2>
            <p className="text-sm text-muted-foreground">
              Direct official contact details for certified 24/7 blood transfusion facilities nationwide.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bloodCenters.map((center, idx) => (
            <Card key={idx} className="border-border bg-card rounded-2xl shadow-xs hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {center.city}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-foreground mt-1">
                      {center.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3 text-primary shrink-0" />
                      <span className="truncate">{center.area}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs bg-secondary/70 p-3 rounded-xl border border-border/40">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Clock className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{center.hours}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-5.5">
                    {center.services}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground">Helpline:</span>
                  <a
                    href={`tel:${center.phone}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-primary hover:underline"
                  >
                    <Phone className="size-3" />
                    {center.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  )
}
