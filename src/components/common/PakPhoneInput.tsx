import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface PakPhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function PakPhoneInput({
  value,
  onChange,
  className,
  error,
  ...props
}: PakPhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep only digits
    const raw = e.target.value.replace(/\D/g, "")
    let cleaned = raw
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1)
    }
    const truncated = cleaned.slice(0, 10)
    onChange(truncated)
  }

  const formattedDisplay =
    value.length > 3 ? `${value.slice(0, 3)} ${value.slice(3)}` : value

  return (
    <div className="w-full space-y-1.5">
      <div className="relative flex items-center rounded-xl border border-input bg-background shadow-2xs focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 transition-all">
        <div className="flex items-center gap-1.5 px-3 py-2.5 border-r border-border bg-secondary/60 text-muted-foreground select-none rounded-l-xl">
          <span className="text-xs font-bold text-foreground">🇵🇰 +92</span>
        </div>

        <Input
          type="tel"
          inputMode="numeric"
          placeholder="300 1234567"
          value={formattedDisplay}
          onChange={handleChange}
          className={cn(
            "border-0 shadow-none focus-visible:ring-0 focus-visible:border-0 rounded-l-none h-11 text-base tracking-wide font-mono",
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          Enter 10-digit mobile number without leading zero (e.g. 300 1234567)
        </p>
      )}
    </div>
  )
}
