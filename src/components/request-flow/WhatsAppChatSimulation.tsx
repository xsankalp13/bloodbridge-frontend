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
  FastForward,
  MessageSquare,
  Navigation,
} from "lucide-react"

interface WhatsAppChatSimulationProps {
  request: BloodRequest
  userCity: string
  onSwitchToBloodBanks?: () => void
  onDone?: () => void
}

interface SimulatedMessage {
  id: string
  sender: "bot" | "donor" | "asker"
  senderName?: string
  text: string
  time: string
  status?: "sent" | "delivered" | "read"
}

export function WhatsAppChatSimulation({
  request,
  userCity,
  onSwitchToBloodBanks,
  onDone,
}: WhatsAppChatSimulationProps) {
  // Donor details
  const donor = React.useMemo(() => {
    const names = [
      "Hamza Tariq",
      "Daniyal Ali",
      "Zeeshan Ahmed",
      "Bilal Soomro",
      "Usman Farooq",
    ]
    const chosenName = names[Math.floor(Math.random() * names.length)]
    return {
      name: chosenName,
      bloodGroup: request.bloodGroup,
      phone: "3019827140",
      location: request.hospital.area || userCity || "City Center",
      distanceKm: 2.8,
      etaMins: 18,
      donationsCount: 6,
    }
  }, [request.bloodGroup, request.hospital.area, userCity])

  const [messages, setMessages] = React.useState<SimulatedMessage[]>([])
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isTyping, setIsTyping] = React.useState(false)
  const [typingName, setTypingName] = React.useState<string | null>(null)
  const [userInput, setUserInput] = React.useState("")
  const [isCompleted, setIsCompleted] = React.useState(false)
  const chatBottomRef = React.useRef<HTMLDivElement>(null)

  const getTimeString = (offsetSeconds = 0) => {
    const d = new Date(Date.now() + offsetSeconds * 1000)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Initial dispatch message from BloodBridge Bot
  const initialBroadcastText = `🚨 *BLOODBRIDGE EMERGENCY ALERT — Case #${request.referenceCode}*

*Hospital:* ${request.hospital.name}, ${request.hospital.city}
*Patient Needs:* ${request.unitsNeeded} Unit(s) of ${request.bloodGroup} ${request.condition || "Whole Blood"}
*Urgency:* ${request.urgency.toUpperCase()}
*Attendant:* ${request.contactPerson} (+92 ${request.contactPhone})

⚡ *Calling Standby Donors within 10 km:* Please confirm your health readiness and availability immediately!`

  // Reset and start simulation
  const startSimulation = React.useCallback(() => {
    setMessages([
      {
        id: "msg-1",
        sender: "bot",
        senderName: "BloodBridge AI Dispatch",
        text: initialBroadcastText,
        time: getTimeString(-30),
        status: "sent",
      },
    ])
    setCurrentStep(1)
    setIsCompleted(false)
    setIsTyping(false)
  }, [initialBroadcastText])

  React.useEffect(() => {
    startSimulation()
  }, [startSimulation])

  // Auto-scroll on new messages
  React.useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Step-by-step scripted sequence
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (currentStep === 1) {
      // Step 1: Change bot message to read (double blue ticks) after 1.5s
      timer = setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === "msg-1" ? { ...m, status: "read" } : m))
        )
        setCurrentStep(2)
      }, 1500)
    } else if (currentStep === 2) {
      // Step 2: Donor starts typing after 2s
      timer = setTimeout(() => {
        setIsTyping(true)
        setTypingName(`${donor.name} (Standby Donor)`)
        setCurrentStep(3)
      }, 2000)
    } else if (currentStep === 3) {
      // Step 3: Donor sends first reply: "Yes I'm fit and ready to give blood"
      timer = setTimeout(() => {
        setIsTyping(false)
        setTypingName(null)
        setMessages((prev) => [
          ...prev,
          {
            id: "msg-2",
            sender: "donor",
            senderName: donor.name,
            text: "Assalam-o-Alaikum! Yes, I am fit and ready to give blood.",
            time: getTimeString(),
          },
        ])
        setCurrentStep(4)
      }, 2500)
    } else if (currentStep === 4) {
      // Step 4: Donor typing second reply with health & location details
      timer = setTimeout(() => {
        setIsTyping(true)
        setTypingName(`${donor.name} (Standby Donor)`)
        setCurrentStep(5)
      }, 1500)
    } else if (currentStep === 5) {
      // Step 5: Donor sends second message
      timer = setTimeout(() => {
        setIsTyping(false)
        setTypingName(null)
        setMessages((prev) => [
          ...prev,
          {
            id: "msg-3",
            sender: "donor",
            senderName: donor.name,
            text: `Alhamdulillah my last donation was 4 months ago. Hemoglobin is normal and no medication. I am in ${donor.location}, about ~${donor.etaMins} minutes away from ${request.hospital.name}.`,
            time: getTimeString(),
          },
        ])
        setCurrentStep(6)
      }, 2500)
    } else if (currentStep === 6) {
      // Step 6: BloodBridge AI Dispatch Bot replies with reception instructions
      timer = setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "msg-4",
            sender: "bot",
            senderName: "BloodBridge AI Dispatch",
            text: `Walaikum Assalam ${donor.name} Bhai! JazakAllah Khair! 🙏

Please proceed directly to the *${request.hospital.name} Blood Bank Reception Counter*.
• *Case Reference:* #${request.referenceCode}
• *Attendant:* ${request.contactPerson} is waiting with the cross-match sample slip.`,
            time: getTimeString(),
            status: "read",
          },
        ])
        setCurrentStep(7)
      }, 2000)
    } else if (currentStep === 7) {
      // Step 7: Donor confirms transit
      timer = setTimeout(() => {
        setIsTyping(true)
        setTypingName(`${donor.name} (Standby Donor)`)
        setCurrentStep(8)
      }, 1500)
    } else if (currentStep === 8) {
      timer = setTimeout(() => {
        setIsTyping(false)
        setTypingName(null)
        setMessages((prev) => [
          ...prev,
          {
            id: "msg-5",
            sender: "donor",
            senderName: donor.name,
            text: `Understood! Taking my bike right now, reaching in ~15-20 minutes InshaAllah. Tell ${request.contactPerson} not to worry, I'm on my way.`,
            time: getTimeString(),
          },
        ])
        setIsCompleted(true)
        setCurrentStep(9)
      }, 2000)
    }

    return () => clearTimeout(timer)
  }, [currentStep, donor, request])

  // Fast forward simulation instantly
  const handleFastForward = () => {
    setIsTyping(false)
    setTypingName(null)
    setMessages([
      {
        id: "msg-1",
        sender: "bot",
        senderName: "BloodBridge AI Dispatch",
        text: initialBroadcastText,
        time: getTimeString(-120),
        status: "read",
      },
      {
        id: "msg-2",
        sender: "donor",
        senderName: donor.name,
        text: "Assalam-o-Alaikum! Yes, I am fit and ready to give blood.",
        time: getTimeString(-90),
      },
      {
        id: "msg-3",
        sender: "donor",
        senderName: donor.name,
        text: `Alhamdulillah my last donation was 4 months ago. Hemoglobin is normal and no medication. I am in ${donor.location}, about ~${donor.etaMins} minutes away from ${request.hospital.name}.`,
        time: getTimeString(-60),
      },
      {
        id: "msg-4",
        sender: "bot",
        senderName: "BloodBridge AI Dispatch",
        text: `Walaikum Assalam ${donor.name} Bhai! JazakAllah Khair! 🙏

Please proceed directly to the *${request.hospital.name} Blood Bank Reception Counter*.
• *Case Reference:* #${request.referenceCode}
• *Attendant:* ${request.contactPerson} is waiting with the cross-match sample slip.`,
        time: getTimeString(-30),
        status: "read",
      },
      {
        id: "msg-5",
        sender: "donor",
        senderName: donor.name,
        text: `Understood! Taking my bike right now, reaching in ~15-20 minutes InshaAllah. Tell ${request.contactPerson} not to worry, I'm on my way.`,
        time: getTimeString(),
      },
    ])
    setIsCompleted(true)
    setCurrentStep(9)
  }

  // Handle asker (patient attendant) sending a custom text to donor
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim()) return

    const userText = userInput.trim()
    setUserInput("")

    const userMsg: SimulatedMessage = {
      id: `user-${Date.now()}`,
      sender: "asker",
      senderName: request.contactPerson,
      text: userText,
      time: getTimeString(),
      status: "read",
    }

    setMessages((prev) => [...prev, userMsg])

    // Simulated donor reply after 2 seconds
    setTimeout(() => {
      setIsTyping(true)
      setTypingName(`${donor.name} (Standby Donor)`)

      setTimeout(() => {
        setIsTyping(false)
        setTypingName(null)

        let reply = `Thank you! I am just a few minutes away from ${request.hospital.name}. Will call your number (+92 ${request.contactPhone}) as soon as I arrive at the blood bank counter.`
        if (userText.toLowerCase().includes("where")) {
          reply = `I am on the main road near ${request.hospital.area || userCity}, about 7 minutes away now.`
        } else if (userText.toLowerCase().includes("call") || userText.toLowerCase().includes("phone")) {
          reply = `Sure! You can also call me directly on 0${donor.phone} whenever needed.`
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `donor-reply-${Date.now()}`,
            sender: "donor",
            senderName: donor.name,
            text: reply,
            time: getTimeString(),
          },
        ])
      }, 1800)
    }, 1000)
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Simulation Controls Top Banner */}
      <div className="flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-foreground">
            Live Emergency WhatsApp Simulation
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            Case #{request.referenceCode}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onDone && isCompleted && (
            <Button
              type="button"
              size="sm"
              onClick={onDone}
              className="h-8 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              Done
            </Button>
          )}
          {!isCompleted ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFastForward}
              className="h-8 text-xs font-semibold rounded-lg gap-1 border-primary/30 text-primary hover:bg-primary/10"
            >
              <FastForward className="size-3.5" />
              <span>Skip to Donor Acceptance</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={startSimulation}
              className="h-8 text-xs font-semibold rounded-lg gap-1 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              <span>Replay Chat</span>
            </Button>
          )}
        </div>
      </div>

      {/* Realistic WhatsApp Chat Device Window */}
      <div className="rounded-3xl border border-emerald-900/20 dark:border-emerald-700/30 shadow-2xl overflow-hidden bg-[#efeae2] dark:bg-[#0c1317] flex flex-col font-sans h-[620px]">
        
        {/* WhatsApp App Header (Official WhatsApp Green) */}
        <div className="bg-[#075E54] dark:bg-[#1f2c34] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0 select-none">
          <div className="flex items-center gap-3">
            {/* Donor Avatar */}
            <div className="relative">
              <div className="size-10 rounded-full bg-emerald-700 dark:bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-inner border border-white/20">
                {donor.name.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 size-3 rounded-full bg-[#25D366] border-2 border-[#075E54] dark:border-[#1f2c34]" />
            </div>

            {/* Donor Name & Dynamic Status */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white leading-tight">
                  {donor.name}
                </h3>
                <BloodGroupBadge group={request.bloodGroup} size="sm" variant="solid" />
              </div>
              <p className="text-[11px] text-white/80 leading-none">
                {isTyping ? (
                  <span className="text-emerald-300 font-medium animate-pulse">
                    typing...
                  </span>
                ) : (
                  <span>Verified Standby Donor · Online</span>
                )}
              </p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 text-white/90">
            <a
              href={`tel:+92${donor.phone}`}
              title="Call Donor"
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Phone className="size-4" />
            </a>
            <div className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
              <Video className="size-4 opacity-60" />
            </div>
            <div className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
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
                🔒 Messages are connected to BloodBridge Pakistan emergency dispatch protocol.
              </span>
            </div>
          </div>

          {/* Date Divider */}
          <div className="flex justify-center my-2">
            <span className="px-3 py-0.5 rounded-md bg-black/10 dark:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-2xs">
              Today
            </span>
          </div>

          {/* Render Messages */}
          {messages.map((m) => {
            const isOutgoing = m.sender === "bot" || m.sender === "asker"
            const isAsker = m.sender === "asker"

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isOutgoing ? "items-end" : "items-start"} animate-in fade-in duration-200`}
              >
                {/* Sender tag for broadcast */}
                {m.senderName && !isAsker && (
                  <span
                    className={`text-[10px] font-bold px-1 mb-0.5 ${
                      m.sender === "bot" ? "text-emerald-800 dark:text-emerald-400" : "text-[#128C7E] dark:text-emerald-400"
                    }`}
                  >
                    {m.senderName}
                  </span>
                )}

                {/* Message Bubble */}
                <div
                  className={`relative p-3 rounded-2xl max-w-[85%] sm:max-w-[78%] text-xs leading-relaxed shadow-sm break-words ${
                    isOutgoing
                      ? "bg-[#D9FDD3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-xs"
                      : "bg-[#FFFFFF] dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-xs"
                  }`}
                >
                  {/* Message Content with simple bold rendering */}
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
                    {isOutgoing && (
                      <span>
                        {m.status === "read" ? (
                          <CheckCheck className="size-3.5 text-[#53bdeb]" />
                        ) : m.status === "delivered" ? (
                          <CheckCheck className="size-3.5 text-muted-foreground" />
                        ) : (
                          <Check className="size-3.5 text-muted-foreground" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Typing Indicator Bubble */}
          {isTyping && (
            <div className="flex flex-col items-start animate-in fade-in duration-200">
              {typingName && (
                <span className="text-[10px] font-bold text-[#128C7E] dark:text-emerald-400 px-1 mb-0.5">
                  {typingName}
                </span>
              )}
              <div className="p-3 rounded-2xl rounded-tl-xs bg-[#FFFFFF] dark:bg-[#202c33] shadow-sm flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="size-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="size-1.5 rounded-full bg-emerald-500 animate-bounce" />
                <span className="text-[11px] text-muted-foreground ml-1 font-medium">
                  typing message...
                </span>
              </div>
            </div>
          )}

          {/* Dispatched Celebration Box (Shows when donor accepted) */}
          {isCompleted && (
            <div className="my-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 shadow-xs space-y-2 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <UserCheck className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                    Donor Confirmed & Dispatched!
                  </h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    {donor.name} is heading to {request.hospital.name}. ETA ~{donor.etaMins} mins.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={`tel:+92${donor.phone}`}
                  className="flex-1 min-w-[140px]"
                >
                  <Button
                    size="sm"
                    className="w-full h-8 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5"
                  >
                    <PhoneCall className="size-3.5" />
                    Call Donor (+92 {donor.phone})
                  </Button>
                </a>

                <a
                  href={`https://wa.me/92${donor.phone}?text=Assalam-o-Alaikum%20${encodeURIComponent(donor.name)},%20this%20is%20${encodeURIComponent(request.contactPerson)}%20from%20${encodeURIComponent(request.hospital.name)}%20regarding%20BloodBridge%20Case%20#${request.referenceCode}.`}
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
                    Open in Real WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* WhatsApp Bottom Message Input Bar */}
        <form
          onSubmit={handleSendMessage}
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
            placeholder={`Reply to ${donor.name} (as ${request.contactPerson})...`}
            className="h-10 text-xs rounded-xl bg-background border-none shadow-inner focus-visible:ring-emerald-500"
          />

          {userInput.trim() ? (
            <Button
              type="submit"
              size="sm"
              className="size-10 p-0 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white shrink-0 shadow-xs"
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
          Cross-match slip should be ready at {request.hospital.name} blood bank counter.
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
