import * as React from "react"
import { BrandLogo } from "@/components/common/BrandLogo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PakPhoneInput } from "@/components/common/PakPhoneInput"
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { api } from "@/lib/api"

interface AuthPageProps {
  initialMode?: "signin" | "signup"
  onBack: () => void
  onAuthSuccess?: (user: { name: string; phone: string }) => void
}

export function AuthPage({
  initialMode = "signin",
  onBack,
  onAuthSuccess,
}: AuthPageProps) {
  const [mode, setMode] = React.useState<"signin" | "signup">(initialMode)
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Sign In: Phone + Password
  const [signInPhone, setSignInPhone] = React.useState("")
  const [signInPassword, setSignInPassword] = React.useState("")

  // Sign Up: Name + Phone + Password
  const [signUpName, setSignUpName] = React.useState("")
  const [signUpPhone, setSignUpPhone] = React.useState("")
  const [signUpPassword, setSignUpPassword] = React.useState("")

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const cleanPhone = signInPhone.replace(/\D/g, "")
    if (cleanPhone.length < 10 || !signInPassword.trim()) {
      setErrorMessage("Please enter a valid 10-digit mobile number and your password.")
      return
    }

    setIsLoading(true)
    try {
      const res = await api.auth.login({
        phone: cleanPhone,
        password: signInPassword,
      })
      setSuccessMessage(`Welcome back, ${res.user.name}! Signed in to BloodBridge.`)
      setTimeout(() => {
        onAuthSuccess?.({ name: res.user.name, phone: res.user.phone })
      }, 500)
    } catch (err: any) {
      setErrorMessage(
        err.message || "Invalid mobile number or password. If you don't have an account, please switch to Sign Up."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const cleanPhone = signUpPhone.replace(/\D/g, "")
    if (!signUpName.trim() || cleanPhone.length < 10) {
      setErrorMessage("Please enter your name and a valid 10-digit mobile number.")
      return
    }

    if (signUpPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.")
      return
    }

    setIsLoading(true)
    try {
      const res = await api.auth.signup({
        name: signUpName.trim(),
        phone: cleanPhone,
        password: signUpPassword,
      })
      setSuccessMessage(`Account created for ${res.user.name}! You can now coordinate requests.`)
      setTimeout(() => {
        onAuthSuccess?.({ name: res.user.name, phone: res.user.phone })
      }, 600)
    } catch (err: any) {
      setErrorMessage(
        err.message || "Account creation failed. This phone number might already be registered."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 via-background to-background flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Bar with Back Button */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pb-4">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-xl active:scale-95"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Home</span>
        </button>

        <span className="text-[11px] font-medium text-muted-foreground">
          Hyderabad, Sindh
        </span>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex justify-center">
            <BrandLogo size="lg" />
          </div>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            {mode === "signin"
              ? "Sign in to post and manage emergency blood requests."
              : "Create an account in seconds to broadcast urgent blood requests."}
          </p>
        </div>

        {/* Sliding Segmented Tab Controller with micro-animation */}
        <div className="relative p-1 rounded-2xl bg-secondary border border-border flex items-center shadow-2xs">
          {/* Animated background pill slider */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-card border border-border/80 shadow-xs transition-transform duration-300 ease-out pointer-events-none ${
              mode === "signin" ? "translate-x-0" : "translate-x-full"
            }`}
          />

          <button
            type="button"
            onClick={() => {
              setMode("signin")
              setSuccessMessage(null)
              setErrorMessage(null)
            }}
            className={`relative z-10 flex-1 py-2 text-xs font-bold transition-colors duration-200 text-center select-none ${
              mode === "signin" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signup")
              setSuccessMessage(null)
              setErrorMessage(null)
            }}
            className={`relative z-10 flex-1 py-2 text-xs font-bold transition-colors duration-200 text-center select-none ${
              mode === "signup" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="rounded-xl border border-success/30 bg-success/10 text-success p-3 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive p-3 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Container with animated fade/slide transitions */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm overflow-hidden relative">
          
          {/* Mode 1: Sign In (Phone + Password ONLY) */}
          {mode === "signin" && (
            <form
              onSubmit={handleSignInSubmit}
              className="space-y-4 animate-in fade-in slide-in-from-left-3 duration-300 ease-out"
            >
              <div className="space-y-1">
                <h2 className="text-base font-bold text-foreground">Sign In</h2>
                <p className="text-xs text-muted-foreground">
                  Enter your mobile phone number and password.
                </p>
              </div>

              {/* Phone Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Mobile Number <span className="text-primary">*</span>
                </Label>
                <PakPhoneInput
                  value={signInPhone}
                  onChange={setSignInPhone}
                  placeholder="300 1234567"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">Password</Label>
                  <button
                    type="button"
                    onClick={() => alert("Password reset instructions will be sent via SMS.")}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="h-11 pl-9 pr-10 rounded-xl text-sm"
                    required
                  />
                  <Lock className="size-4 text-muted-foreground absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-sm font-bold rounded-xl shadow-xs transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Switch to Sign Up */}
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  Need to post a request?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup")
                      setSuccessMessage(null)
                    }}
                    className="font-bold text-primary hover:underline focus:outline-none"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Mode 2: Sign Up (Name + Phone + Password ONLY) */}
          {mode === "signup" && (
            <form
              onSubmit={handleSignUpSubmit}
              className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300 ease-out"
            >
              <div className="space-y-1">
                <h2 className="text-base font-bold text-foreground">Sign Up</h2>
                <p className="text-xs text-muted-foreground">
                  Register with your phone number to coordinate blood requests.
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Your Full Name <span className="text-primary">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="e.g. Tariq Memon"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="h-11 pl-9 rounded-xl text-sm"
                    required
                  />
                  <User className="size-4 text-muted-foreground absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Mobile Number (+92) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Mobile Number <span className="text-primary">*</span>
                </Label>
                <PakPhoneInput
                  value={signUpPhone}
                  onChange={setSignUpPhone}
                  placeholder="300 1234567"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Create Password <span className="text-primary">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="h-11 pl-9 pr-10 rounded-xl text-sm"
                    minLength={6}
                    required
                  />
                  <Lock className="size-4 text-muted-foreground absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-sm font-bold rounded-xl shadow-xs transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Switch to Sign In */}
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin")
                      setSuccessMessage(null)
                    }}
                    className="font-bold text-primary hover:underline focus:outline-none"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

        </div>

        {/* Minimal trust info */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-success" />
            <span>Secure & Private</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Free Coordination</span>
          </div>
        </div>

      </div>

      {/* Footer minimal info */}
      <div className="text-center py-4 text-[11px] text-muted-foreground">
        BloodBridge · Coordinating Blood Requests Across Hyderabad, Sindh
      </div>
    </div>
  )
}
