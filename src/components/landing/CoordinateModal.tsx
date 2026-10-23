import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BloodGroupBadge } from "@/components/common/BloodGroupBadge"
import type { BloodRequest } from "@/types"
import { Phone, Hospital, AlertTriangle, ShieldCheck } from "lucide-react"

interface CoordinateModalProps {
  request: BloodRequest | null
  isOpen: boolean
  onClose: () => void
}

export function CoordinateModal({
  request,
  isOpen,
  onClose,
}: CoordinateModalProps) {
  if (!request) return null

  const handleCall = () => {
    window.open(`tel:+92${request.contactPhone}`, "_self")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[420px] p-6 rounded-2xl bg-card">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-foreground">
              Direct Coordination
            </DialogTitle>
            <BloodGroupBadge group={request.bloodGroup} size="md" variant="solid" />
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Connect directly with the family or hospital attendant for Case #{request.referenceCode}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 my-2">
          {/* Hospital Context Box */}
          <div className="rounded-xl border border-border bg-secondary/70 p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Hospital className="size-4 text-primary shrink-0" />
              <span>{request.hospital.name}</span>
            </div>
            <p className="text-muted-foreground pl-5.5">
              Area: <strong className="text-foreground">{request.hospital.area}, Hyderabad</strong>
            </p>
            <p className="text-muted-foreground pl-5.5">
              Contact Person: <strong className="text-foreground">{request.contactPerson}</strong>
            </p>
            <p className="text-muted-foreground pl-5.5 font-mono">
              Phone: +92 {request.contactPhone.slice(0, 3)} {request.contactPhone.slice(3)}
            </p>
          </div>

          {/* Quick eligibility check */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1 text-foreground">
            <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>Donor Check before Calling</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Please ensure you have had no fever or antibiotics in the last 7 days and at least 3 months since your last whole blood donation.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-1">
            <ShieldCheck className="size-3.5 text-success shrink-0" />
            <span>Never pay any individual. Donation is strictly voluntary & free.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <Button
            className="w-full h-11 text-sm font-semibold gap-2 shadow-xs rounded-xl"
            onClick={handleCall}
          >
            <Phone className="size-4" />
            Call Attendant (+92 {request.contactPhone})
          </Button>

          <Button
            variant="ghost"
            className="w-full text-xs text-muted-foreground hover:text-foreground rounded-xl"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
