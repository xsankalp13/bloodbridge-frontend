import { cn } from "@/lib/utils"

interface BrandLogoProps {
  size?: "sm" | "md" | "lg"
  showTagline?: boolean
  className?: string
}

export function BrandLogo({ size = "md", showTagline = false, className }: BrandLogoProps) {
  const iconSizes = {
    sm: "size-7",
    md: "size-9",
    lg: "size-11",
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Minimal droplet logo with inner bridge arch motif */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/25",
          iconSizes[size]
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3/5"
          aria-hidden="true"
        >
          {/* Blood droplet */}
          <path d="M12 2.5C12 2.5 5 11 5 15.5C5 19.09 8.13 22 12 22C15.87 22 19 19.09 19 15.5C19 11 12 2.5 12 2.5Z" />
          {/* Bridge connection */}
          <path d="M9 16C9 14.5 10.3 13.5 12 13.5C13.7 13.5 15 14.5 15 16" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={cn("font-bold tracking-tight text-foreground leading-none", textSizes[size])}>
          Blood<span className="text-primary">Bridge</span>
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium text-muted-foreground mt-0.5 leading-tight">
            Connecting people. Coordinating blood requests.
          </span>
        )}
      </div>
    </div>
  )
}
