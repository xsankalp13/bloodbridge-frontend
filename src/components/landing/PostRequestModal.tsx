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
import { PAKISTAN_CITIES, type BloodGroup, type BloodRequest, type UrgencyLevel, type PakistaniCity } from "@/types"
import { PAKISTAN_CITY_COORDINATES } from "@/lib/geoUtils"
import { AlertCircle, ShieldAlert } from "lucide-react"

interface PostRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (request: BloodRequest) => void
  detectedCity?: string
}

const BLOOD_GROUPS: BloodGroup[] = ["O-", "O+", "B+", "B-", "A+", "A-", "AB+", "AB-"]

export function PostRequestModal({
  isOpen,
  onClose,
  onSubmit,
  detectedCity = "Karachi",
}: PostRequestModalProps) {
  const [bloodGroup, setBloodGroup] = React.useState<BloodGroup>("O+")
  const [units, setUnits] = React.useState<number>(1)
  const [urgency, setUrgency] = React.useState<UrgencyLevel>("urgent")
  const [hospitalName, setHospitalName] = React.useState("")
  const [city, setCity] = React.useState<PakistaniCity>((detectedCity as PakistaniCity) || "Karachi")
  const [areaDetail, setAreaDetail] = React.useState("")
  const [contactName, setContactName] = React.useState("")
  const [contactPhone, setContactPhone] = React.useState("")
  const [condition, setCondition] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (detectedCity && PAKISTAN_CITIES.includes(detectedCity as PakistaniCity)) {
      setCity(detectedCity as PakistaniCity)
    }
  }, [detectedCity])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hospitalName.trim() || !contactName.trim() || contactPhone.length < 10) {
      alert("Please enter the hospital name, contact person, and a valid 10-digit mobile number.")
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      const coords = PAKISTAN_CITY_COORDINATES[city] || { lat: 24.8607, lng: 67.0011 }
      const cityPrefix = city.slice(0, 3).toUpperCase()

      const newReq: BloodRequest = {
        id: `req-${Date.now()}`,
        referenceCode: `${cityPrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
        bloodGroup,
        unitsNeeded: units,
        hospital: {
          name: hospitalName,
          area: areaDetail.trim() || `${city} Central`,
          city,
          province: "Pakistan",
          coordinates: coords,
        },
        urgency,
        requiredBy: urgency === "critical" ? "Within 2 Hours" : "Today",
        timeRemaining: urgency === "critical" ? "2h remaining" : "Today",
        condition: condition.trim() || "Urgent replacement blood support requested",
        contactPerson: contactName,
        contactPhone,
        verified: false,
      }

      onSubmit(newReq)
      setIsSubmitting(false)
      onClose()
    }, 600)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[460px] p-6 rounded-2xl bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-xl font-bold text-foreground">
            Post Urgent Blood Request
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Broadcast request to voluntary replacement donors across Pakistan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Blood Group Picker */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Required Blood Group <span className="text-primary">*</span>
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

          {/* Units & Urgency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Units Needed</Label>
              <div className="flex items-center rounded-xl border border-input bg-background p-1 justify-between">
                <button
                  type="button"
                  disabled={units <= 1}
                  onClick={() => setUnits((u) => Math.max(1, u - 1))}
                  className="size-8 rounded-lg bg-secondary text-foreground flex items-center justify-center font-bold disabled:opacity-40"
                >
                  -
                </button>
                <span className="font-bold text-sm text-foreground">{units}</span>
                <button
                  type="button"
                  disabled={units >= 8}
                  onClick={() => setUnits((u) => Math.min(8, u + 1))}
                  className="size-8 rounded-lg bg-secondary text-foreground flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Urgency Level</Label>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setUrgency("critical")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${
                    urgency === "critical"
                      ? "bg-red-50 text-destructive border-destructive"
                      : "bg-secondary text-muted-foreground border-border"
                  }`}
                >
                  <ShieldAlert className="size-3 text-destructive shrink-0" />
                  <span>Immediate (&lt; 2h)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgency("urgent")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${
                    urgency === "urgent"
                      ? "bg-amber-50 text-amber-700 border-amber-500"
                      : "bg-secondary text-muted-foreground border-border"
                  }`}
                >
                  <AlertCircle className="size-3 text-amber-500 shrink-0" />
                  <span>Today</span>
                </button>
              </div>
            </div>
          </div>

          {/* City & Hospital */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">City in Pakistan</Label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as PakistaniCity)}
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
                placeholder="e.g. Saddar, G-8, Anarkali"
                value={areaDetail}
                onChange={(e) => setAreaDetail(e.target.value)}
                className="h-11 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Hospital Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Hospital / Medical Center Name <span className="text-primary">*</span>
            </Label>
            <Input
              placeholder="e.g. JPMC, Mayo Hospital, PIMS, LRH, LUH"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              className="h-11 rounded-xl text-sm"
              required
            />
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Attendant / Contact Person <span className="text-primary">*</span>
              </Label>
              <Input
                placeholder="e.g. Tariq Memon (Brother / Attending Doctor)"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="h-11 rounded-xl text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Attendant Mobile Number <span className="text-primary">*</span>
              </Label>
              <PakPhoneInput
                value={contactPhone}
                onChange={setContactPhone}
                placeholder="300 1234567"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Medical Reason / Ward Details (Optional)
              </Label>
              <Input
                placeholder="e.g. Emergency surgery trauma or pediatric thalassemia"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="h-11 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full h-12 text-sm font-bold rounded-xl shadow-xs"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Broadcasting to Pakistan..." : "Broadcast Blood Request"}
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
