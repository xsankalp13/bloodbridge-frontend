import { BrandLogo } from "@/components/common/BrandLogo"
import { Heart, MapPin, Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand info */}
          <div className="md:col-span-5 space-y-3">
            <BrandLogo size="md" showTagline />
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm pt-1">
              A community-driven blood donation coordination web application for Pakistan. Connecting families directly with eligible voluntary standby donors in real-time medical emergencies.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <MapPin className="size-3.5 text-primary" />
              <span>Coverage: Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Multan, Hyderabad & Nationwide</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Coordination
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>
                <a href="#live-requests" className="hover:text-primary transition-colors">
                  Live Emergency Requests
                </a>
              </li>
              <li>
                <a href="#blood-centers" className="hover:text-primary transition-colors">
                  Registered Blood Banks
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-primary transition-colors">
                  Coordination Workflow
                </a>
              </li>
              <li>
                <a href="#eligibility" className="hover:text-primary transition-colors">
                  Donor Health Checklist
                </a>
              </li>
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Hyderabad Blood Center Helplines
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                <strong className="text-foreground">Red Crescent Regional Center:</strong>{" "}
                <a href="tel:0229260100" className="font-mono text-primary hover:underline">
                  022-9260100
                </a>
              </p>
              <p>
                <strong className="text-foreground">LUH Civil Hospital Blood Bank:</strong>{" "}
                <a href="tel:0229210206" className="font-mono text-primary hover:underline">
                  022-9210206
                </a>
              </p>
              <p>
                <strong className="text-foreground">Rajputana Hospital Transfusion:</strong>{" "}
                <a href="tel:0222782101" className="font-mono text-primary hover:underline">
                  022-2782101
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <Shield className="size-3.5 text-primary shrink-0" />
            <span>
              Non-commercial community initiative. Testing & transfusion conducted strictly by hospital blood banks.
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span>Built with care for Hyderabad</span>
            <Heart className="size-3 text-primary fill-primary" />
          </div>
        </div>

      </div>
    </footer>
  )
}
