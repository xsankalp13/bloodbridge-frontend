import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  ShieldCheck,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  time: string
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ""

// Light, fast Groq model with reasoning capabilities
const GROQ_MODEL = "openai/gpt-oss-20b"

const SYSTEM_PROMPT = `You are the official BloodBridge Pakistan AI Assistant.

PLATFORM INFORMATION:
- BloodBridge is a mobile-first emergency blood donation coordination platform designed for Pakistan (Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Multan, Faisalabad, Hyderabad, etc.).
- Requesters can create emergency blood requests in 5 steps (Blood Group, Component, Units slider, Urgency, Hospital details).
- Standby donors register once with their live GPS coordinates and receive instant emergency WhatsApp alerts when a matching patient needs blood nearby.
- Verified hospital blood banks operate 24/7 (such as JPMC Karachi, Indus Hospital, Shaukat Khanum Lahore, PIMS Islamabad, LUMHS Hyderabad, Lady Reading Hospital Peshawar).
- Blood Compatibility Rules:
  * O- is the universal red blood cell donor (can donate to everyone).
  * AB+ is the universal red blood cell recipient (can receive from everyone).
  * O+ can donate to O+, A+, B+, AB+.
  * A+ can donate to A+, AB+.
  * B+ can donate to B+, AB+.
  * A- can donate to A-, A+, AB-, AB+.
  * B- can donate to B-, B+, AB-, AB+.
  * AB- can donate to AB-, AB+.
- Donor Eligibility:
  * Age: 18 to 60 years old.
  * Minimum weight: 50 kg.
  * Hemoglobin level: ≥ 12.5 g/dL.
  * Waiting period: 3 months between whole blood donations.
  * Must be free from active infections, hepatitis B/C, HIV, and not on blood-thinning medications.

CRITICAL INSTRUCTIONS & GUARDRAILS:
1. You must ONLY answer questions directly related to BloodBridge, blood donation, blood group compatibility, donor eligibility, transfusion components, and hospital blood banks in Pakistan.
2. If the user asks ANY question not related to blood donation or BloodBridge (such as general knowledge, coding, politics, entertainment, weather, sports, personal advice, etc.), you MUST STRICTLY REFUSE with this exact polite message:
"I am the BloodBridge AI Assistant, specialized exclusively in blood donation, emergency coordination, and hospital blood banks across Pakistan. I cannot assist with unrelated topics. How can I help you with finding blood or registering as a donor?"
3. Keep answers concise, clear, human, and reassuring.
4. FORMATTING PREFERENCES:
   - For hospital blood banks, donor criteria, or compatibility guidelines, use clean structured bullet points with bold highlights (e.g. • **Hospital Name** (City) — Details).
   - If using markdown tables, keep them concise and easy to read on mobile.`

const QUICK_PROMPTS = [
  "What blood group can O- donate to?",
  "How does BloodBridge standby donor registration work?",
  "Am I eligible to donate blood in Pakistan?",
  "Where are 24/7 blood banks in Karachi & Lahore?",
]

export function BloodBridgeChatbot() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Assalam-o-Alaikum! I am the **BloodBridge Assistant**.\n\nI can help you with blood group compatibility, emergency hospital blood banks across Pakistan, donor eligibility, and how our WhatsApp matching works. How can I assist you today?",
      time: "Just now",
    },
  ])
  const [inputValue, setInputValue] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasUnread, setHasUnread] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setHasUnread(false)
    }
  }, [messages, isOpen])

  // Call Groq API
  const sendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: userText.trim(),
      time: now,
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputValue("")
    setIsLoading(true)

    // Build message payload for Groq OpenAI-compatible chat endpoint
    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ]

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: apiMessages,
          temperature: 0.2,
          max_tokens: 350,
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`)
      }

      const data = await response.json()
      const botReply =
        data.choices?.[0]?.message?.content?.trim() ||
        "I am having trouble connecting right now. Please try again or check our emergency feed directly."

      const botMessage: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: "assistant",
        content: botReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prev) => [...prev, botMessage])
      if (!isOpen) setHasUnread(true)
    } catch (err) {
      console.error("[Groq Chatbot Error]:", err)
      const fallbackMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "assistant",
        content:
          "I am having difficulty reaching the Groq AI service. For immediate emergencies, please use the **Need Blood Urgently** search directly on BloodBridge.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content:
          "Chat reset. How can I assist you with blood donation, compatibility, or emergency coordination across Pakistan?",
        time: "Just now",
      },
    ])
  }

  // Render rich markdown formatting (GFM tables, lists, bold text, headings)
  const ChatMarkdown = ({ content, isUser }: { content: string; isUser: boolean }) => {
    if (isUser) {
      return <span className="whitespace-pre-wrap">{content}</span>
    }

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto rounded-xl border border-border/80 bg-background/60 shadow-xs">
              <table className="w-full text-[11px] border-collapse text-left">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/80 text-foreground border-b border-border/80 font-bold">{children}</thead>
          ),
          tbody: ({ children }) => <tbody className="divide-y divide-border/40">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-muted/30 transition-colors">{children}</tr>,
          th: ({ children }) => (
            <th className="px-2.5 py-1.5 font-bold text-foreground text-[10px] uppercase tracking-wider">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-2.5 py-1.5 text-foreground/90 align-top leading-relaxed text-[11px]">{children}</td>
          ),
          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-1.5 leading-relaxed">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-1.5 leading-relaxed">{children}</ol>,
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          h1: ({ children }) => <h3 className="font-extrabold text-foreground text-xs mt-2 mb-1">{children}</h3>,
          h2: ({ children }) => <h4 className="font-bold text-foreground text-xs mt-1.5 mb-1">{children}</h4>,
          h3: ({ children }) => <h5 className="font-bold text-foreground text-[11px] mt-1.5 mb-0.5">{children}</h5>,
          strong: ({ children }) => <strong className="font-extrabold text-foreground">{children}</strong>,
          code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-[10px] font-mono">{children}</code>,
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  return (
    <div className="fixed bottom-18 right-4 sm:bottom-5 sm:right-5 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-white/40"
        >
          {/* Pulsing notification indicator */}
          <span className="relative flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex size-3 rounded-full bg-white" />
          </span>

          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm tracking-tight">
            <Bot className="size-4.5" />
            <span>BloodBridge AI</span>
          </div>

          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
            Online
          </span>

          {hasUnread && (
            <span className="absolute -top-1 -right-1 size-3.5 bg-destructive border-2 border-white rounded-full animate-bounce" />
          )}
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[calc(100vw-28px)] sm:w-[460px] h-[580px] max-h-[86vh] rounded-3xl bg-card border border-border/80 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-primary via-primary/95 to-destructive text-primary-foreground flex items-center justify-between border-b border-primary/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="size-5 text-white" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white">BloodBridge AI</h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider">
                    <Sparkles className="size-2.5" />
                    Groq Fast
                  </span>
                </div>
                <p className="text-[11px] text-white/80 leading-none">
                  Pakistan Blood Donation & Hospital Guide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Restart chat"
                className="size-8 rounded-xl hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="size-8 rounded-xl hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="size-4.5" />
              </button>
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className="bg-secondary/70 border-b border-border/60 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="size-3.5 text-primary shrink-0" />
              <span>Strictly BloodBridge-related assistance only</span>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-secondary/30">
            {messages.map((m) => {
              const isUser = m.role === "user"
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`size-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                      isUser
                        ? "bg-foreground text-background"
                        : "bg-primary text-primary-foreground shadow-xs shadow-primary/20"
                    }`}
                  >
                    {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
                  </div>

                  <div className={`space-y-1 ${isUser ? "max-w-[85%] items-end" : "max-w-[92%] items-start min-w-0"}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs overflow-hidden ${
                        isUser
                          ? "bg-primary text-primary-foreground rounded-tr-xs"
                          : "bg-card text-foreground border border-border/80 rounded-tl-xs"
                      }`}
                    >
                      <ChatMarkdown content={m.content} isUser={isUser} />
                    </div>
                    <span className="text-[10px] text-muted-foreground px-1 block">
                      {m.time}
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Typing status indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="size-7 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="size-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-card border border-border/80 text-xs flex items-center gap-1.5 shadow-2xs">
                  <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="text-[11px] text-muted-foreground ml-1">Analyzing with Groq...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Chips (shown when few messages) */}
          {messages.length <= 3 && !isLoading && (
            <div className="p-2.5 bg-background border-t border-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5 px-1">
                Suggested Questions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary transition-colors border border-border text-left truncate max-w-[190px] cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-background border-t border-border/80 flex items-center gap-2"
          >
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about blood groups, banks, donors..."
              className="h-10 text-xs rounded-xl bg-secondary/60 border-border/80 focus-visible:ring-primary/20"
              disabled={isLoading}
            />

            <Button
              type="submit"
              size="sm"
              disabled={!inputValue.trim() || isLoading}
              className="h-10 w-10 p-0 rounded-xl shrink-0 font-bold active:scale-95"
            >
              <Send className="size-4" />
            </Button>
          </form>

        </div>
      )}
    </div>
  )
}
