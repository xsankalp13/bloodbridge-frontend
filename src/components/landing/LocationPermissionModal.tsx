import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, ShieldCheck } from "lucide-react"
import { PAKISTAN_CITIES, type PakistaniCity } from "@/types"

interface LocationPermissionModalProps {
  isOpen: boolean
  onClose: () => void
  onRequestGeo: () => void
  onManualSelectCity: (city: PakistaniCity) => void
  isRequesting: boolean
  permissionDenied: boolean
}

export function LocationPermissionModal({
  isOpen,
  onClose,
  onRequestGeo,
  onManualSelectCity,
  isRequesting,
  permissionDenied,
}: LocationPermissionModalProps) {
  const [selectedCity, setSelectedCity] = React.useState<PakistaniCity>("Karachi")

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[420px] p-6 rounded-2xl bg-card">
        <DialogHeader className="text-left space-y-2">
          <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto sm:mx-0">
            <Navigation className="size-6 text-primary animate-pulse" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            Location Access Required for Donors
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            BloodBridge coordinates life-saving cases across Pakistan. To ensure you are only called when a patient in your immediate neighborhood or city needs your blood, we need your location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {permissionDenied ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-foreground space-y-1">
              <p className="font-semibold text-destructive">GPS Permission Blocked by Browser</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your browser settings are blocking location access. You can select your Pakistani city manually below, or enable location in your browser site settings.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-secondary/70 p-3 text-xs text-muted-foreground space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldCheck className="size-4 text-success" />
                <span>Privacy Protected</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Your coordinates are only used to match nearby hospital emergency requests. We never share your live GPS coordinates publicly.
              </p>
            </div>
          )}

          {/* Action: Enable GPS */}
          <Button
            onClick={onRequestGeo}
            disabled={isRequesting}
            className="w-full h-12 text-sm font-bold rounded-xl shadow-xs gap-2"
          >
            <MapPin className="size-4" />
            {isRequesting ? "Detecting Location..." : "Allow Exact GPS Location"}
          </Button>

          {/* Fallback: Manual City Selector */}
          <div className="pt-2 border-t border-border/60 space-y-2">
            <label className="text-xs font-semibold text-foreground block">
              Or Select Your City in Pakistan:
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value as PakistaniCity)}
                className="flex-1 h-11 px-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                {PAKISTAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                className="h-11 px-4 text-xs font-semibold rounded-xl"
                onClick={() => {
                  onManualSelectCity(selectedCity)
                  onClose()
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
