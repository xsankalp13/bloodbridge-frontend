import * as React from "react"
import { BrandLogo } from "@/components/common/BrandLogo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MapPin, Menu, Plus, Heart } from "lucide-react"

interface NavbarProps {
  onPostRequest: () => void
  onRegisterDonor: () => void
  onNavigateAuth?: () => void
  onNavigateDashboard?: () => void
  currentUser?: { name: string; phone: string } | null
  locationLabel?: string
  isLocationLive?: boolean
  onRequestLocation?: () => void
}

export function Navbar({
  onPostRequest,
  onRegisterDonor,
  onNavigateAuth,
  onNavigateDashboard,
  currentUser,
  locationLabel = "Hyderabad, Sindh",
  isLocationLive = false,
  onRequestLocation,
}: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const navLinks = [
    { label: "Live Requests", href: "#live-requests" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Blood Centers", href: "#blood-centers" },
    { label: "Eligibility", href: "#eligibility" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Location tag */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2">
            <BrandLogo size="md" />
          </a>

          <button
            onClick={onRequestLocation}
            type="button"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs font-medium text-muted-foreground border border-border/60 hover:bg-muted transition-colors cursor-pointer active:scale-95"
            title="Click to detect or refresh GPS location"
          >
            <MapPin className={`size-3.5 ${isLocationLive ? "text-emerald-600 animate-pulse" : "text-primary"}`} />
            <span className="text-foreground font-semibold">{locationLabel}</span>
            {isLocationLive && (
              <span className="size-1.5 rounded-full bg-emerald-500" title="GPS Verified" />
            )}
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateDashboard}
              className="text-xs font-bold h-9 rounded-xl border-primary/30 text-primary hover:bg-primary/5"
            >
              Dashboard ({currentUser.name})
            </Button>
          ) : (
            onNavigateAuth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateAuth}
                className="text-xs font-semibold h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                Sign In
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onRegisterDonor}
            className="hidden sm:inline-flex text-xs font-semibold h-9 rounded-xl border-border hover:bg-secondary"
          >
            <Heart className="size-3.5 mr-1.5 text-primary" />
            Join as Donor
          </Button>

          <Button
            size="sm"
            onClick={onPostRequest}
            className="text-xs sm:text-sm font-semibold h-9 sm:h-10 px-3 sm:px-4 rounded-xl shadow-xs"
          >
            <Plus className="size-4 mr-1" />
            Post Blood Request
          </Button>

          {/* Mobile Hamburger menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="inline-flex items-center justify-center size-9 rounded-xl hover:bg-muted text-foreground transition-colors active:scale-95 cursor-pointer">
                <Menu className="size-5" />
                <span className="sr-only">Open navigation menu</span>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <BrandLogo size="md" showTagline />

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-xs font-medium border border-border">
                    <MapPin className="size-3.5 text-primary" />
                    <span>Serving Latifabad, Qasimabad, Saddar & Jamshoro</span>
                  </div>

                  <div className="flex flex-col space-y-3 pt-2">
                    {navLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="text-base font-semibold text-foreground py-2 border-b border-border/50 hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-border">
                  <Button
                    onClick={() => {
                      setIsOpen(false)
                      onPostRequest()
                    }}
                    className="w-full h-11 font-semibold rounded-xl"
                  >
                    <Plus className="size-4 mr-1.5" />
                    Post Urgent Request
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false)
                      onRegisterDonor()
                    }}
                    className="w-full h-11 font-semibold rounded-xl"
                  >
                    <Heart className="size-4 mr-1.5 text-primary" />
                    Join Volunteer Network
                  </Button>

                  {onNavigateAuth && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsOpen(false)
                        onNavigateAuth()
                      }}
                      className="w-full h-10 font-semibold rounded-xl text-muted-foreground hover:text-foreground"
                    >
                      Sign In to BloodBridge
                    </Button>
                  )}

                  <p className="text-[11px] text-center text-muted-foreground pt-1">
                    Emergency Helpline: 022-9210206 (Civil LUH)
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
