import { cn } from "@/lib/utils"
import type { UrgencyLevel } from "@/types"
import { AlertCircle, Clock, ShieldAlert } from "lucide-react"

interface UrgencyPillProps {
  urgency: UrgencyLevel
  timeRemaining?: string
  className?: string
  showIcon?: boolean
}

export function UrgencyPill({
  urgency,
  timeRemaining,
  className,
  showIcon = true,
}: UrgencyPillProps) {
  const configs = {
    critical: {
      label: "Critical",
      icon: ShieldAlert,
      wrapperClasses: "bg-red-50 text-destructive border-destructive/25 dark:bg-destructive/15 dark:text-red-300",
      dotClass: "bg-destructive animate-pulse",
    },
    urgent: {
      label: "Urgent",
      icon: AlertCircle,
      wrapperClasses: "bg-amber-50 text-amber-700 border-amber-300/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/50",
      dotClass: "bg-amber-500",
    },
    routine: {
      label: "Standard",
      icon: Clock,
      wrapperClasses: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700",
      dotClass: "bg-slate-400",
    },
  }

  const current = configs[urgency]
  const Icon = current.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-tight select-none",
        current.wrapperClasses,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", current.dotClass)} />
      {showIcon && <Icon className="size-3 shrink-0" />}
      <span>{current.label}</span>
      {timeRemaining && (
        <span className="opacity-80 font-normal">· {timeRemaining}</span>
      )}
    </span>
  )
}
