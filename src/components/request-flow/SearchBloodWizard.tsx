import * as React from "react"
import { BrandLogo } from "@/components/common/BrandLogo"
import { BloodGroupBadge } from "@/components/common/BloodGroupBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { PakPhoneInput } from "@/components/common/PakPhoneInput"
import {
  PAKISTAN_CITIES,
  type BloodGroup,
  type BloodRequest,
  type GeoCoordinates,
  type PakistaniCity,
  type UrgencyLevel,
} from "@/types"
import { PAKISTAN_CITY_COORDINATES } from "@/lib/geoUtils"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Navigation,
  ShieldAlert,
  AlertCircle,
  Clock,
  Heart,
  Droplet,
  Layers,
  Activity,
  FileText,
  ShieldCheck,
  Building2,
  Sparkles,
} from "lucide-react"

export type BloodComponentType =
  | "Whole Blood (WB)"
  | "Packed Red Cells (PRBC)"
  | "Platelets / Megaunit"
  | "Fresh Frozen Plasma (FFP)"
  | "Cryoprecipitate"

interface SearchBloodWizardProps {
  userCoords: GeoCoordinates | null
  userDetectedCity: string
  isLocationLive: boolean
  onRequestLocation: (callback?: (success: boolean) => void) => void
  user?: { name: string; phone: string } | null
  onBack: () => void
  onSubmitRequest: (req: BloodRequest) => void
}

const BLOOD_GROUPS: BloodGroup[] = ["O-", "O+", "B+", "B-", "A+", "A-", "AB+", "AB-"]

const BLOOD_COMPONENTS: Array<{
  id: BloodComponentType
  name: string
  description: string
  icon: typeof Droplet
}> = [
  {
    id: "Whole Blood (WB)",
    name: "Whole Blood (WB)",
    description: "Standard complete blood unit for active hemorrhage and emergency trauma.",
    icon: Droplet,
  },
  {
    id: "Packed Red Cells (PRBC)",
    name: "Packed Red Cells (PRBC)",
    description: "Concentrated red cells for severe anemia, surgery, and thalassemia exchange.",
    icon: Layers,
  },
  {
    id: "Platelets / Megaunit",
    name: "Platelets / Megaunit",
    description: "Vital for dengue bleeding, leukemia, and acute platelet deficiency.",
    icon: Activity,
  },
  {
    id: "Fresh Frozen Plasma (FFP)",
    name: "Fresh Frozen Plasma (FFP)",
    description: "Rich in clotting factors for liver disorders, massive transfusions, and burns.",
    icon: Sparkles,
  },
  {
    id: "Cryoprecipitate",
    name: "Cryoprecipitate",
    description: "Concentrated fibrinogen and Factor VIII for hemophilia and critical clotting.",
    icon: Heart,
  },
]

const URGENCY_OPTIONS: Array<{
  id: UrgencyLevel
  label: string
  timeline: string
  description: string
  icon: typeof ShieldAlert
  classes: string
}> = [
  {
    id: "critical",
    label: "Emergency (< 2 Hours)",
    timeline: "Immediate attention",
    description: "Life-threatening OT surgery, acute trauma, or ICU instability.",
    icon: ShieldAlert,
    classes: "border-destructive text-destructive bg-red-50 dark:bg-destructive/15",
  },
  {
    id: "urgent",
    label: "Urgent (Today)",
    timeline: "Needed within 6–12 hours",
    description: "Scheduled pediatric transfusion, post-partum recovery, or urgent stabilization.",
    icon: AlertCircle,
    classes: "border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300",
  },
  {
    id: "routine",
    label: "Routine (24–48 Hours)",
    timeline: "Advance elective care",
    description: "Elective orthopedic surgery or routine scheduled medical procedure.",
    icon: Clock,
    classes: "border-slate-300 text-slate-700 bg-slate-50 dark:bg-slate-800/40 dark:text-slate-300",
  },
]

export function SearchBloodWizard({
  userCoords,
  userDetectedCity,
  isLocationLive,
  onRequestLocation,
  user,
  onBack,
  onSubmitRequest,
}: SearchBloodWizardProps) {
  // Step state: 1 to 5
  const [currentStep, setCurrentStep] = React.useState<number>(1)

  // Step 1: Blood Type
  const [bloodGroup, setBloodGroup] = React.useState<BloodGroup>("O+")

  // Step 2: Blood Component
  const [bloodComponent, setBloodComponent] = React.useState<BloodComponentType>("Whole Blood (WB)")

  // Step 3: Units (Slider)
  const [unitsNeeded, setUnitsNeeded] = React.useState<number>(2)

  // Step 4: Urgency Level
  const [urgency, setUrgency] = React.useState<UrgencyLevel>("urgent")

  // Step 5: Message & Hospital details
  const [hospitalName, setHospitalName] = React.useState("")
  const [city, setCity] = React.useState<PakistaniCity>(
    (userDetectedCity as PakistaniCity) || "Karachi"
  )
  const [areaDetail, setAreaDetail] = React.useState("")
  const [customMessage, setCustomMessage] = React.useState("")
  const [attendantName, setAttendantName] = React.useState(user?.name || "")
  const [attendantPhone, setAttendantPhone] = React.useState(user?.phone || "")

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isRequestingLocation, setIsRequestingLocation] = React.useState(false)
  const [locationDeniedError, setLocationDeniedError] = React.useState(false)

  // Sync city when user location resolves
  React.useEffect(() => {
    if (userDetectedCity && PAKISTAN_CITIES.includes(userDetectedCity as PakistaniCity)) {
      setCity(userDetectedCity as PakistaniCity)
    }
  }, [userDetectedCity])

  // Trigger browser location prompt
  const handleEnableLocation = () => {
    setIsRequestingLocation(true)
    setLocationDeniedError(false)

    onRequestLocation((success) => {
      setIsRequestingLocation(false)
      if (!success) {
        setLocationDeniedError(true)
      }
    })
  }

  // Final submit handler
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hospitalName.trim() || !attendantName.trim() || attendantPhone.length < 10) {
      alert("Please provide the hospital name, contact person, and a valid 10-digit mobile number.")
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      const coords = userCoords || PAKISTAN_CITY_COORDINATES[city] || { lat: 24.8607, lng: 67.0011 }
      const cityPrefix = city.slice(0, 3).toUpperCase()

      const newReq: BloodRequest = {
        id: `req-${Date.now()}`,
        referenceCode: `${cityPrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
        bloodGroup,
        unitsNeeded,
        hospital: {
          name: hospitalName.trim(),
          area: areaDetail.trim() || `${city} Central`,
          city,
          province: "Pakistan",
          coordinates: coords,
        },
        urgency,
        requiredBy:
          urgency === "critical"
            ? "Within 2 Hours"
            : urgency === "urgent"
            ? "Today, by Evening"
            : "Within 24–48 Hours",
        timeRemaining:
          urgency === "critical" ? "2h remaining" : urgency === "urgent" ? "6h remaining" : "Tomorrow",
        condition: `${bloodComponent} - ${customMessage.trim() || "Urgent replacement blood needed"}`,
        contactPerson: attendantName.trim(),
        contactPhone: attendantPhone,
        verified: false,
        notes: `Requested component: ${bloodComponent}. Direct replacement needed.`,
      }

      onSubmitRequest(newReq)
      setIsSubmitting(false)
    }, 600)
  }

  // ==========================================
  // MANDATORY LIVE LOCATION GATE
  // ==========================================
  if (!isLocationLive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/50 via-background to-background flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 font-sans">
        {/* Top Header */}
        <div className="max-w-md w-full mx-auto flex items-center justify-between pb-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-xl active:scale-95"
          >
            <ArrowLeft className="size-4" />
            <span>Cancel</span>
          </button>
          <BrandLogo size="sm" />
        </div>

        {/* Location Access Required Card */}
        <div className="max-w-md w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="text-center space-y-3">
            <div className="size-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-sm shadow-primary/20">
              <Navigation className="size-8 text-primary animate-pulse" />
            </div>

            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Live Location Required
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              To search for matching standby donors and notify closest hospital blood banks across Pakistan, BloodBridge requires your live location.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <div className="rounded-xl bg-secondary/80 p-3.5 space-y-2 border border-border/60 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <ShieldCheck className="size-4 text-success shrink-0" />
                <span>Why Live Location is Essential</span>
              </div>
              <ul className="space-y-1 text-muted-foreground list-disc pl-5 leading-normal">
                <li>Alerts donors within a 5–15 km radius of your patient.</li>
                <li>Ranks closest hospital blood banks by immediate drive time.</li>
                <li>Your coordinates are never published publicly.</li>
              </ul>
            </div>

            {locationDeniedError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 text-xs space-y-2 text-foreground">
                <div className="flex items-center gap-1.5 font-bold text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>GPS Permission Blocked</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Your browser or device blocked location access. Please allow location in your browser site settings, or select your Pakistani city below to proceed without delay.
                </p>
                <div className="pt-1">
                  <select
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value as PakistaniCity)
                      // Fallback manual allow
                      handleEnableLocation()
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-foreground text-xs font-semibold"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <Button
              onClick={handleEnableLocation}
              disabled={isRequestingLocation}
              className="w-full h-12 text-sm font-bold rounded-xl shadow-xs gap-2 transition-all active:scale-95"
            >
              <MapPin className="size-4" />
              {isRequestingLocation ? "Detecting GPS Location..." : "Share Live GPS Location"}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">
              We are only collecting necessary info to connect you directly with nearby voluntary donors and hospital blood banks across Pakistan.
            </p>
          </div>
        </div>

        <div className="py-4" />
      </div>
    )
  }

  // ==========================================
  // 5-STEP INTERACTIVE WIZARD
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/40 via-background to-background flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Top Bar with Step Progress */}
      <div className="max-w-xl w-full mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep((s) => s - 1)
              } else {
                onBack()
              }
            }}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-xl active:scale-95"
          >
            <ArrowLeft className="size-4" />
            <span>{currentStep === 1 ? "Cancel" : "Back"}</span>
          </button>

          {/* Step Indicator */}
          <span className="text-xs font-bold text-foreground">
            Step {currentStep} of 5
          </span>

          {/* Live location badge */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-[11px] font-semibold text-foreground border border-border">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate max-w-[120px]">{city}</span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden border border-border/50">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Form Step Container */}
      <div className="max-w-xl w-full mx-auto my-auto py-6">
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">

          {/* STEP 1: BLOOD TYPE */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Step 1 · Blood Group
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  What Blood Type is Needed?
                </h2>
                <p className="text-xs text-muted-foreground">
                  Select the required blood group for the patient.
                </p>
              </div>

              {/* 8 Blood Type Buttons */}
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {BLOOD_GROUPS.map((g) => {
                  const isSelected = bloodGroup === g
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setBloodGroup(g)}
                      className={`h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-base sm:text-lg transition-all border active:scale-95 cursor-pointer ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-102"
                          : "bg-secondary text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {g}
                    </button>
                  )
                })}
              </div>

              {/* Selection context info */}
              <div className="rounded-xl bg-secondary/70 p-3.5 border border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Selected Group:</span>
                <BloodGroupBadge group={bloodGroup} size="lg" variant="solid" />
              </div>

              <Button
                onClick={() => setCurrentStep(2)}
                className="w-full h-12 text-sm font-bold rounded-xl shadow-xs gap-2 active:scale-[0.98]"
              >
                Continue to Component Selection
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}

          {/* STEP 2: BLOOD COMPONENT */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Step 2 · Component Type
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  Which Blood Component is Required?
                </h2>
                <p className="text-xs text-muted-foreground">
                  Hospitals often request specific fractions for optimal therapy.
                </p>
              </div>

              <div className="space-y-2.5">
                {BLOOD_COMPONENTS.map((comp) => {
                  const isSelected = bloodComponent === comp.id
                  const Icon = comp.icon
                  return (
                    <div
                      key={comp.id}
                      onClick={() => setBloodComponent(comp.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 active:scale-[0.99] ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary"
                          : "border-border bg-card hover:bg-secondary/60"
                      }`}
                    >
                      <div
                        className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>

                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground">
                            {comp.name}
                          </h4>
                          {isSelected && (
                            <CheckCircle2 className="size-4 text-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">
                          {comp.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Button
                onClick={() => setCurrentStep(3)}
                className="w-full h-12 text-sm font-bold rounded-xl shadow-xs gap-2 active:scale-[0.98]"
              >
                Continue to Units Slider
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}

          {/* STEP 3: UNITS NEEDED (SLIDER) */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Step 3 · Units Quantity
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  How Many Units Do You Need?
                </h2>
                <p className="text-xs text-muted-foreground">
                  Use the slider below to set the required unit count.
                </p>
              </div>

              {/* Big Unit Display Readout */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center space-y-2">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-5xl font-black text-primary font-mono tracking-tight">
                    {unitsNeeded}
                  </span>
                  <span className="text-lg font-bold text-foreground self-end pb-1.5">
                    Unit{unitsNeeded > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {bloodGroup} {bloodComponent}
                </p>
              </div>

              {/* Interactive Slider */}
              <div className="space-y-3 px-2">
                <Slider
                  value={[unitsNeeded]}
                  onValueChange={(val) => {
                    if (Array.isArray(val) && val[0] !== undefined) {
                      setUnitsNeeded(val[0])
                    }
                  }}
                  min={1}
                  max={8}
                  step={1}
                  className="py-4 cursor-pointer"
                />

                <div className="flex justify-between text-xs font-mono text-muted-foreground font-semibold px-0.5">
                  <span>1 Unit</span>
                  <span>2 Units</span>
                  <span>4 Units</span>
                  <span>6 Units</span>
                  <span>8 Units (Max)</span>
                </div>
              </div>

              {/* Stepper Buttons */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={unitsNeeded <= 1}
                  onClick={() => setUnitsNeeded((u) => Math.max(1, u - 1))}
                  className="h-10 px-4 rounded-xl text-xs font-bold"
                >
                  - Decrease
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={unitsNeeded >= 8}
                  onClick={() => setUnitsNeeded((u) => Math.min(8, u + 1))}
                  className="h-10 px-4 rounded-xl text-xs font-bold"
                >
                  + Increase
                </Button>
              </div>

              <Button
                onClick={() => setCurrentStep(4)}
                className="w-full h-12 text-sm font-bold rounded-xl shadow-xs gap-2 active:scale-[0.98]"
              >
                Continue to Urgency Selection
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}

          {/* STEP 4: URGENCY LEVEL */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Step 4 · Urgency Level
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  How Urgent is This Request?
                </h2>
                <p className="text-xs text-muted-foreground">
                  Sets notification priority and matching speed for standby donors.
                </p>
              </div>

              <div className="space-y-3">
                {URGENCY_OPTIONS.map((opt) => {
                  const isSelected = urgency === opt.id
                  const Icon = opt.icon
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setUrgency(opt.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 active:scale-[0.99] ${
                        isSelected
                          ? opt.classes + " shadow-sm scale-101"
                          : "border-border bg-card hover:bg-secondary/60 text-foreground"
                      }`}
                    >
                      <div
                        className={`size-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? "bg-white/90 dark:bg-black/30" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Icon className="size-5" />
                      </div>

                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold">{opt.label}</h4>
                          <span className="text-[11px] font-medium opacity-80">
                            {opt.timeline}
                          </span>
                        </div>
                        <p className="text-xs opacity-90 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Button
                onClick={() => setCurrentStep(5)}
                className="w-full h-12 text-sm font-bold rounded-xl shadow-xs gap-2 active:scale-[0.98]"
              >
                Continue to Hospital & Message
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}

          {/* STEP 5: CUSTOM MESSAGE & HOSPITAL (OPTIONAL) + SUBMIT */}
          {currentStep === 5 && (
            <form
              onSubmit={handleFinalSubmit}
              className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Step 5 · Details & Search
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  Hospital & Optional Message
                </h2>
                <p className="text-xs text-muted-foreground">
                  Provide hospital and attendant details so replacement donors can arrive directly.
                </p>
              </div>

              {/* Summary Pill */}
              <div className="rounded-xl bg-secondary/80 p-3 border border-border/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <BloodGroupBadge group={bloodGroup} size="md" variant="solid" />
                  <span className="font-semibold text-foreground">
                    {unitsNeeded} unit{unitsNeeded > 1 ? "s" : ""} · {bloodComponent}
                  </span>
                </div>
                <span className="font-bold text-primary capitalize">{urgency}</span>
              </div>

              {/* Hospital Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Hospital / Medical Center Name <span className="text-primary">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="e.g. JPMC Karachi / Mayo Hospital Lahore / PIMS Islamabad"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="h-11 pl-9 rounded-xl text-sm"
                    required
                  />
                  <Building2 className="size-4 text-muted-foreground absolute left-3 top-3.5" />
                </div>
              </div>

              {/* City & Sector */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">City</Label>
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

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Attendant Name <span className="text-primary">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Tariq Memon"
                    value={attendantName}
                    onChange={(e) => setAttendantName(e.target.value)}
                    className="h-11 rounded-xl text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Mobile Phone <span className="text-primary">*</span>
                  </Label>
                  <PakPhoneInput
                    value={attendantPhone}
                    onChange={setAttendantPhone}
                    placeholder="300 1234567"
                  />
                </div>
              </div>

              {/* Custom Message (Optional) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Custom Message / Ward Notes (Optional)</span>
                  <span className="text-[11px] text-muted-foreground font-normal">Optional</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="e.g. Patient is in Emergency OT, cross-match slip ready at blood bank"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="h-11 pl-9 rounded-xl text-sm"
                  />
                  <FileText className="size-4 text-muted-foreground absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Final Submit CTA */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching for Blood across Pakistan...
                  </span>
                ) : (
                  "Search for Blood"
                )}
              </Button>
            </form>
          )}

        </div>
      </div>

      {/* Mandatory Trust Text at Bottom */}
      <div className="max-w-md w-full mx-auto text-center py-2 space-y-1">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          We are only collecting necessary info to connect you directly with nearby voluntary donors and hospital blood banks across Pakistan.
        </p>
      </div>

    </div>
  )
}
