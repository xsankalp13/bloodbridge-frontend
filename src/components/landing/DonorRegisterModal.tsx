import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PakPhoneInput } from "@/components/common/PakPhoneInput"
import { PAKISTAN_CITIES, type BloodGroup, type GeoCoordinates } from "@/types"
import { Heart, MapPin, ShieldCheck, CheckCircle2 } from "lucide-react"

interface DonorRegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  detectedCity?: string
  userCoords?: GeoCoordinates | null
}

const BLOOD_GROUPS: BloodGroup[] = ["O-", "O+", "B+", "B-", "A+", "A-", "AB+", "AB-"]

export function DonorRegisterModal({
  isOpen,
  onClose,
  onSuccess,
  detectedCity = "Karachi",
  userCoords,
}: DonorRegisterModalProps) {
  const [name, setName] = React.useState("")
  const [bloodGroup, setBloodGroup] = React.useState<BloodGroup>("O+")
  const [city, setCity] = React.useState<string>(detectedCity)
  const [areaDetail, setAreaDetail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (detectedCity) {
      setCity(detectedCity)
    }
  }, [detectedCity])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || phone.length < 10) {
      alert("Please enter your name and a valid 10-digit mobile number.")
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      onSuccess()
      onClose()
    }, 600)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[440px] p-6 rounded-2xl bg-card max-h-[92vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Heart className="size-4" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Register as Standby Donor
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Register once across Pakistan. You do not need to check requests daily — our community coordination team will call you directly when an emergency case matches your blood type nearby.
          </DialogDescription>
        </DialogHeader>

        {/* Location Status Chip */}
        <div className="rounded-xl bg-secondary/80 border border-border p-3 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <MapPin className="size-4 text-primary shrink-0" />
            <span>
              {userCoords
                ? `GPS Attached: ${userCoords.lat.toFixed(3)}°N, ${userCoords.lng.toFixed(3)}°E`
                : `Assigned Region: ${city}`}
            </span>
          </div>
          {userCoords && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success">
              <CheckCircle2 className="size-3" />
              Accurate
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Full Name</Label>
            <Input
              placeholder="e.g. Daniyal Shaikh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl text-sm"
              required
            />
          </div>

          {/* Blood Group */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Your Blood Group <span className="text-primary">*</span>
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map((g) => {
                const isSelected = bloodGroup === g
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setBloodGroup(g)}
                    className={`h-10 rounded-xl text-xs font-bold font-mono transition-all border ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-secondary text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          </div>

          {/* City Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">City in Pakistan</Label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-input bg-background text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                {PAKISTAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Area / Sector</Label>
              <Input
                placeholder="e.g. Gulshan, DHA, Saddar"
                value={areaDetail}
                onChange={(e) => setAreaDetail(e.target.value)}
                className="h-11 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Phone Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Mobile Number (Call/WhatsApp) <span className="text-primary">*</span>
            </Label>
            <PakPhoneInput
              value={phone}
              onChange={setPhone}
              placeholder="300 1234567"
            />
          </div>

          <div className="rounded-xl bg-secondary/70 p-3 text-[11px] text-muted-foreground flex items-start gap-2 border border-border/50">
            <ShieldCheck className="size-4 text-success shrink-0 mt-0.5" />
            <span>
              Your phone number is kept confidential and only called when an urgent hospital case matches your blood group in your city.
            </span>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full h-11 text-sm font-bold rounded-xl shadow-xs"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register Standby Availability"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs text-muted-foreground rounded-xl"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
