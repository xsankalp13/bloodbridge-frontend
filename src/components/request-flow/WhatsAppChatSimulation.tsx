import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BloodGroupBadge } from "@/components/common/BloodGroupBadge"
import type { BloodRequest } from "@/types"
import {
  Phone,
  Video,
  MoreVertical,
  Send,
  Check,
  CheckCheck,
  Smile,
  Paperclip,
  Mic,
  ShieldCheck,
  PhoneCall,
  UserCheck,
  RotateCcw,
  MessageSquare,
  Navigation,
  HeartHandshake,
} from "lucide-react"

interface WhatsAppChatSimulationProps {
  request: BloodRequest
  userCity: string
  onSwitchToBloodBanks?: () => void
  onDone?: () => void
}

interface SimulatedMessage {
  id: string
  sender: "bot" | "user_donor"
  text: string
  time: string
  status?: "sent" | "delivered" | "read"
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ""
const GROQ_MODEL = "openai/gpt-oss-20b"

export function WhatsAppChatSimulation({
  request,
  userCity,
  onSwitchToBloodBanks,
  onDone,
}: WhatsAppChatSimulationProps) {
  const [messages, setMessages] = React.useState<SimulatedMessage[]>([])
  const [isBotTyping, setIsBotTyping] = React.useState(false)
  const [userInput, setUserInput] = React.useState("")
  const [hasConfirmedReadiness, setHasConfirmedReadiness] = React.useState(false)
  const chatBottomRef = React.useRef<HTMLDivElement>(null)

  const getTimeString = (offsetSeconds = 0) => {
    const d = new Date(Date.now() + offsetSeconds * 1000)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const targetCity = request.hospital.city || userCity || "Pakistan"

  // Initial Emergency Broadcast Alert from BloodBridge Bot
  const initialBroadcastText = `🚨 *BLOODBRIDGE EMERGENCY ALERT — Case #${request.referenceCode}*

Assalam-o-Alaikum! You are registered as an active *${request.bloodGroup}* standby donor in ${targetCity}. An urgent request was just posted in your vicinity:

• *Hospital:* ${request.hospital.name}, ${targetCity}
• *Blood Group:* ${request.bloodGroup} (${request.unitsNeeded} unit(s) needed)
• *Urgency:* ${request.urgency.toUpperCase()}
• *Patient Attendant:* ${request.contactPerson} (+92 ${request.contactPhone})

⚡ *Are you physically fit and ready to donate right now? Please reply to confirm!*`

  // Start chat with the single initial alert, then WAIT for the user to respond!
  const startSimulation = React.useCallback(() => {
    setMessages([
      {
        id: "msg-alert",
        sender: "bot",
        text: initialBroadcastText,
        time: getTimeString(-10),
        status: "sent",
      },
    ])
    setHasConfirmedReadiness(false)
    setIsBotTyping(false)

    // After 1 second, turn ticks to blue (donor opened the WhatsApp chat)
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === "msg-alert" ? { ...m, status: "read" } : m))
      )
    }, 1000)
  }, [initialBroadcastText])

  React.useEffect(() => {
    startSimulation()
  }, [startSimulation])

  // Auto-scroll on new messages
  React.useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isBotTyping])

  // Context-aware AI response from BloodBridge Bot to what the donor says
  const generateBotReply = async (userText: string, updatedHistory: SimulatedMessage[]) => {
    setIsBotTyping(true)

    // Check if user confirmed readiness or transit
    const lower = userText.toLowerCase()
    const isAccepting =
      lower.includes("fit") ||
      lower.includes("ready") ||
      lower.includes("yes") ||
      lower.includes("available") ||
      lower.includes("coming") ||
      lower.includes("way") ||
      lower.includes("mins") ||
      lower.includes("minutes") ||
      lower.includes("bike") ||
      lower.includes("reach")

    if (isAccepting) {
      setHasConfirmedReadiness(true)
    }

    // Try calling Groq API for realistic conversational replies
    if (GROQ_API_KEY) {
      try {
        const systemPrompt = `You are the official BloodBridge Pakistan emergency blood dispatch assistant replying to a voluntary standby donor on WhatsApp.
Case Reference: #${request.referenceCode}
Hospital: ${request.hospital.name}, ${request.hospital.city}
Blood Group: ${request.bloodGroup} (${request.unitsNeeded} units needed)
Patient Attendant: ${request.contactPerson} (+92 ${request.contactPhone})

INSTRUCTIONS:
1. The user is a voluntary standby donor responding to the emergency alert.
2. Be warm, polite, and reassuring (use Assalam-o-Alaikum, JazakAllah Khair, brother/sister).
3. If they confirm they are fit / ready to donate:
   - Thank them enthusiastically (JazakAllah Khair).
   - Instruct them to proceed directly to the ${request.hospital.name} Blood Bank Reception Counter.
   - Mention Case #${request.referenceCode} and that Attendant ${request.contactPerson} is waiting with the cross-match sample slip.
   - Ask for their approximate ETA if they haven't shared it yet.
4. If they share their ETA / location:
   - Acknowledge it, tell them to drive safely, and confirm the attendant has been notified.
5. If they ask a question (e.g. where to go, attendant contact, parking):
   - Answer clearly for ${request.hospital.name}.
6. Keep replies concise, conversational, and WhatsApp-friendly (2 to 3 sentences maximum, use clean bullet points or bold where helpful).`

        const chatPayload = [
          { role: "system", content: systemPrompt },
          ...updatedHistory.map((m) => ({
            role: m.sender === "bot" ? ("assistant" as const) : ("user" as const),
            content: m.text,
          })),
        ]

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: chatPayload,
            temperature: 0.3,
            max_tokens: 220,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const reply = data.choices?.[0]?.message?.content?.trim()
          if (reply) {
            setIsBotTyping(false)
            setMessages((prev) => [
              ...prev,
              {
                id: `bot-${Date.now()}`,
                sender: "bot",
                text: reply,
                time: getTimeString(),
                status: "read",
              },
            ])
            return
          }
        }
      } catch (err) {
        console.warn("[Groq Dispatch Simulation Error]:", err)
      }
    }

    // Instant Fallback Logic (if offline or Groq response unavailable)
    setTimeout(() => {
      setIsBotTyping(false)
      let reply = ""

      if (isAccepting) {
        reply = `Walaikum Assalam! JazakAllah Khair brother! 🙏\n\nPlease proceed directly to the *${request.hospital.name} Blood Bank Reception Counter*.\n• Case Reference: *#${request.referenceCode}*\n• Attendant: *${request.contactPerson}* is waiting with the cross-match sample slip.\n\nApproximately how many minutes will it take you to arrive?`
      } else if (lower.includes("where") || lower.includes("location") || lower.includes("counter")) {
        reply = `The blood bank is located on the Ground Floor, Main Laboratory Building at *${request.hospital.name}*. Ask the reception staff for Case *#${request.referenceCode}*.`
      } else if (lower.includes("no") || lower.includes("cannot") || lower.includes("sorry") || lower.includes("fever")) {
        reply = `Thank you for letting us know! We understand completely. We are immediately reaching out to the next standby ${request.bloodGroup} donor nearby.`
      } else {
        reply = `Understood! JazakAllah Khair for your quick response. Attendant *${request.contactPerson}* has been alerted. Please call +92 ${request.contactPhone} once you arrive at the ${request.hospital.name} blood bank counter.`
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: reply,
          time: getTimeString(),
          status: "read",
        },
      ])
    }, 1200)
  }

  // Handle donor sending a message
  const handleSendDonorMessage = (textToSend?: string) => {
    const text = (textToSend || userInput).trim()
    if (!text || isBotTyping) return

    setUserInput("")

    const donorMsg: SimulatedMessage = {
      id: `donor-${Date.now()}`,
      sender: "user_donor",
      text,
      time: getTimeString(),
      status: "read",
    }

    const nextHistory = [...messages, donorMsg]
    setMessages(nextHistory)

    // Trigger AI response after a short realistic typing delay
    setTimeout(() => {
      generateBotReply(text, nextHistory)
    }, 600)
  }

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendDonorMessage()
  }

  // Quick 1-tap responses for the donor
  const DONOR_QUICK_RESPONSES = [
    "Yes, I am fit and ready to give blood!",
    "Alhamdulillah, I'm ready. Leaving on my bike now (~15 min ETA).",
    "Where is the blood bank reception counter located?",
    "Please tell attendant Tariq I'm on my way.",
  ]

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 font-sans">
      
      {/* Simulation Info & Control Banner */}
      <div className="rounded-2xl bg-secondary/80 border border-border p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
            <HeartHandshake className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                You are chatting as: <span className="text-emerald-600 dark:text-emerald-400">Standby Donor 🩸</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Case #{request.referenceCode}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Reply to the alert below. The AI Dispatcher will respond to you in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onDone && (
            <Button
              type="button"
              size="sm"
              onClick={onDone}
              className="h-8 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              Done
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={startSimulation}
            className="h-8 text-xs font-semibold rounded-lg gap-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* Realistic WhatsApp Chat Device Window */}
      <div className="rounded-3xl border border-emerald-900/20 dark:border-emerald-700/30 shadow-2xl overflow-hidden bg-[#efeae2] dark:bg-[#0c1317] flex flex-col h-[620px]">
        
        {/* WhatsApp App Header (Official WhatsApp Green) */}
        <div className="bg-[#075E54] dark:bg-[#1f2c34] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0 select-none">
          <div className="flex items-center gap-3">
            {/* BloodBridge Dispatch Avatar */}
            <div className="relative">
              <div className="size-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-inner border border-white/20">
                🩸
              </div>
              <span className="absolute bottom-0 right-0 size-3 rounded-full bg-[#25D366] border-2 border-[#075E54] dark:border-[#1f2c34]" />
            </div>

            {/* Header Title & Status */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white leading-tight">
                  BloodBridge Emergency Dispatch
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/20 text-white">
                  Verified Bot
                </span>
                <BloodGroupBadge group={request.bloodGroup} size="sm" variant="solid" />
              </div>
              <p className="text-[11px] text-white/80 leading-none">
                {isBotTyping ? (
                  <span className="text-emerald-300 font-medium animate-pulse">
                    typing...
                  </span>
                ) : (
                  <span>Official Emergency Response · Pakistan</span>
                )}
              </p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 text-white/90">
            <a
              href={`tel:+92${request.contactPhone}`}
              title="Call Patient Attendant"
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Phone className="size-4" />
            </a>
            <div className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-60">
              <Video className="size-4" />
            </div>
            <div className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <MoreVertical className="size-4" />
            </div>
          </div>
        </div>

        {/* WhatsApp Chat Canvas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 relative bg-[radial-gradient(#00000008_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]">
          
          {/* Security Notice Pill */}
          <div className="flex justify-center my-1">
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-[#182229] border border-amber-200/60 dark:border-amber-800/40 text-[10px] text-amber-900 dark:text-amber-300 text-center max-w-sm flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="size-3.5 shrink-0 text-amber-600" />
              <span>
                🔒 Messages are end-to-end encrypted with BloodBridge emergency coordination.
              </span>
            </div>
          </div>

          {/* Date Divider */}
          <div className="flex justify-center my-1.5">
            <span className="px-3 py-0.5 rounded-md bg-black/10 dark:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-2xs">
              Today
            </span>
          </div>

          {/* Render Messages */}
          {messages.map((m) => {
            const isUserDonor = m.sender === "user_donor"

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUserDonor ? "items-end" : "items-start"} animate-in fade-in duration-200`}
              >
                {!isUserDonor && (
                  <span className="text-[10px] font-bold px-1 mb-0.5 text-emerald-800 dark:text-emerald-400">
                    BloodBridge Dispatch
                  </span>
                )}

                {/* Message Bubble */}
                <div
                  className={`relative p-3 rounded-2xl max-w-[85%] sm:max-w-[80%] text-xs leading-relaxed shadow-sm break-words ${
                    isUserDonor
                      ? "bg-[#D9FDD3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-xs"
                      : "bg-[#FFFFFF] dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-xs"
                  }`}
                >
                  {/* Message Content with bold formatting support */}
                  <div className="whitespace-pre-wrap font-normal">
                    {m.text.split("\n").map((line, lIdx) => {
                      const boldSegments = line.split(/(\*[^*]+\*)/g)
                      return (
                        <p key={lIdx} className={lIdx > 0 ? "mt-1" : ""}>
                          {boldSegments.map((seg, sIdx) => {
                            if (seg.startsWith("*") && seg.endsWith("*")) {
                              return (
                                <strong key={sIdx} className="font-extrabold">
                                  {seg.slice(1, -1)}
                                </strong>
                              )
                            }
                            return <span key={sIdx}>{seg}</span>
                          })}
                        </p>
                      )
                    })}
                  </div>

                  {/* Time & WhatsApp Ticks */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-muted-foreground opacity-80 select-none">
                    <span>{m.time}</span>
                    {isUserDonor ? (
                      <span>
                        <CheckCheck className="size-3.5 text-[#53bdeb]" />
                      </span>
                    ) : (
                      m.status && (
                        <span>
                          {m.status === "read" ? (
                            <CheckCheck className="size-3.5 text-[#53bdeb]" />
                          ) : (
                            <Check className="size-3.5 text-muted-foreground" />
                          )}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Typing Indicator for Bot */}
          {isBotTyping && (
            <div className="flex flex-col items-start animate-in fade-in duration-200">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 px-1 mb-0.5">
                BloodBridge Dispatch
              </span>
              <div className="p-3 rounded-2xl rounded-tl-xs bg-[#FFFFFF] dark:bg-[#202c33] shadow-sm flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="size-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="size-1.5 rounded-full bg-emerald-500 animate-bounce" />
                <span className="text-[11px] text-muted-foreground ml-1 font-medium">
                  Dispatch is typing...
                </span>
              </div>
            </div>
          )}

          {/* Confirmed Match Banner (Displays once donor confirms fitness) */}
          {hasConfirmedReadiness && (
            <div className="my-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 shadow-xs space-y-2 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <UserCheck className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                    You Confirmed Donation Readiness!
                  </h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    Patient Attendant ({request.contactPerson}) is waiting for you at {request.hospital.name}.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={`tel:+92${request.contactPhone}`}
                  className="flex-1 min-w-[140px]"
                >
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5"
                  >
                    <PhoneCall className="size-3.5" />
                    Call Attendant (+92 {request.contactPhone})
                  </Button>
                </a>

                <a
                  href={`https://wa.me/92${request.contactPhone}?text=Assalam-o-Alaikum%20${encodeURIComponent(request.contactPerson)},%20I%20am%20the%20BloodBridge%20standby%20donor%20for%20Case%20#${request.referenceCode}.%20I%20am%20heading%20to%20${encodeURIComponent(request.hospital.name)}.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-w-[140px]"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs font-bold rounded-lg border-emerald-600/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 gap-1.5"
                  >
                    <MessageSquare className="size-3.5 text-emerald-600" />
                    Open Real WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips for the Donor */}
        <div className="px-3 py-2 bg-[#f0f2f5]/90 dark:bg-[#1f2c34] border-t border-black/5 dark:border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
            Tap a quick response as Donor:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DONOR_QUICK_RESPONSES.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isBotTyping}
                onClick={() => handleSendDonorMessage(chip)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white dark:bg-[#202c33] hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors border border-border shadow-2xs text-left truncate max-w-[280px] cursor-pointer disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* WhatsApp Bottom Message Input Bar */}
        <form
          onSubmit={handleSubmitForm}
          className="p-2.5 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-black/5 dark:border-white/5 flex items-center gap-2 shrink-0 select-none"
        >
          <div className="flex items-center gap-1 text-muted-foreground px-1">
            <button
              type="button"
              className="p-1 hover:text-foreground transition-colors cursor-pointer"
            >
              <Smile className="size-5" />
            </button>
            <button
              type="button"
              className="p-1 hover:text-foreground transition-colors cursor-pointer"
            >
              <Paperclip className="size-5" />
            </button>
          </div>

          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isBotTyping}
            placeholder="Type your response as Donor (e.g. Yes I'm fit and ready to give blood)..."
            className="h-10 text-xs rounded-xl bg-background border-none shadow-inner focus-visible:ring-emerald-500"
          />

          {userInput.trim() ? (
            <Button
              type="submit"
              size="sm"
              disabled={isBotTyping}
              className="size-10 p-0 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white shrink-0 shadow-xs cursor-pointer active:scale-95"
            >
              <Send className="size-4" />
            </Button>
          ) : (
            <div className="size-10 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-muted-foreground cursor-pointer">
              <Mic className="size-5" />
            </div>
          )}
        </form>

      </div>

      {/* Quick Navigation Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Sample cross-match slip is ready at {request.hospital.name} blood bank desk.
        </span>
        {onSwitchToBloodBanks && (
          <button
            type="button"
            onClick={onSwitchToBloodBanks}
            className="text-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View 24/7 Hospital Blood Banks Map</span>
            <Navigation className="size-3" />
          </button>
        )}
      </div>
    </div>
  )
}
