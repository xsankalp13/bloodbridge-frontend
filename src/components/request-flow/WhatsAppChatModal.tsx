import * as React from "react"
import { X, MessageSquare } from "lucide-react"
import { WhatsAppChatSimulation } from "./WhatsAppChatSimulation"
import type { BloodRequest } from "@/types"

interface WhatsAppChatModalProps {
  isOpen: boolean
  onClose: () => void
  request: BloodRequest
  userCity: string
  onSwitchToBloodBanks?: () => void
}

export function WhatsAppChatModal({
  isOpen,
  onClose,
  request,
  userCity,
  onSwitchToBloodBanks,
}: WhatsAppChatModalProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card rounded-3xl shadow-2xl border border-border/80 overflow-hidden flex flex-col max-h-[96vh] animate-in zoom-in-95 duration-200">
        
        {/* Top Window Titlebar */}
        <div className="bg-[#075E54] dark:bg-[#1f2c34] text-white px-4 py-2.5 flex items-center justify-between border-b border-white/10 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-300">
              <MessageSquare className="size-3.5" />
            </div>
            <span className="font-bold text-xs sm:text-sm">
              WhatsApp Donor Simulator · Case #{request.referenceCode}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="size-7 rounded-full hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close window"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Modal Content containing the Interactive WhatsApp Chat */}
        <div className="p-3 sm:p-4 overflow-y-auto bg-background/50">
          <WhatsAppChatSimulation
            request={request}
            userCity={userCity}
            onSwitchToBloodBanks={() => {
              onClose()
              onSwitchToBloodBanks?.()
            }}
            onDone={onClose}
          />
        </div>

      </div>
    </div>
  )
}
