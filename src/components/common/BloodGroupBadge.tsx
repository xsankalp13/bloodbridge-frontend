import { cn } from "@/lib/utils"
import type { BloodGroup } from "@/types"

interface BloodGroupBadgeProps {
  group: BloodGroup
  size?: "sm" | "md" | "lg"
  variant?: "solid" | "subtle" | "outline"
  className?: string
}

export function BloodGroupBadge({
  group,
  size = "md",
  variant = "subtle",
  className,
}: BloodGroupBadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-semibold rounded-md",
    md: "px-2.5 py-1 text-sm font-bold rounded-lg",
    lg: "px-3.5 py-1.5 text-base font-extrabold rounded-xl min-w-12 text-center",
  }

  const variantStyles = {
    solid: "bg-primary text-primary-foreground shadow-xs shadow-primary/25",
    subtle: "bg-primary/10 text-primary border border-primary/20",
    outline: "border-2 border-primary text-primary bg-background",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-mono tracking-tight transition-colors select-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {group}
    </span>
  )
}
