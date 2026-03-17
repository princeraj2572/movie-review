"use client"

import { useState } from "react"
import { X, Mail, Lock, User, Eye, EyeOff, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signIn, signUp } from "@/lib/auth"
import { useAuth } from "./AuthProvider"

interface AuthModalProps {
  onClose: () => void
  defaultTab?: "signin" | "signup"
}

export default function AuthModal({ onClose, defaultTab = "signin" }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { refresh } = useAuth()

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError("Please fill in all fields"); return }
    setLoading(true); setError("")
    try {
      const { error: err } = await signIn(email, password)
      if (err) { 
        if (err.includes('Invalid login credentials')) {
          setError("Invalid email or password. Please try again.")
        } else if (err.includes('Email not confirmed')) {
          setError("Please confirm your email before signing in.")
        } else {
          setError(`Sign in error: ${err}`)
        }
        setLoading(false)
        return 
      }
      await refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || !username) { setError("Please fill in all required fields"); return }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError("Username can only contain letters, numbers and underscores"); return }
    setLoading(true); setError("")
    try {
      const { error: err } = await signUp(email, password, username, fullName)
      if (err) { 
        // Better error messages
        if (err.includes('already registered')) {
          setError("This email is already registered. Try signing in instead.")
        } else if (err.includes('Username')) {
          setError("Username is already taken. Choose a different one.")
        } else if (err.includes('valid email')) {
          setError("Please enter a valid email address.")
        } else {
          setError(`Signup error: ${err}`)
        }
        setLoading(false)
        return 
      }
      setSuccess("Account created successfully! Sign in with your credentials.")
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 modal-backdrop" />
      <div
        className="relative w-full max-w-md bg-[#0f0f0f] border border-[#1e1e1e] rounded-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#c9a84c] flex items-center justify-center">
              <Film className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-accent text-lg text-[#e8e8e8] tracking-widest">CINESCOPE</span>
          </div>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#e8e8e8] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1e1e1e]">
          {(["signin", "signup"] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); setSuccess("") }}
              className={`flex-1 py-3 text-xs uppercase tracking-widest font-semibold transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "border-[#c9a84c] text-[#c9a84c]"
                  : "border-transparent text-[#6b7280] hover:text-[#9ca3af]"
              }`}
            >
              {t === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-[#22c55e] font-semibold mb-2">Check your email!</p>
              <p className="text-[#6b7280] text-sm">{success}</p>
              <Button className="mt-4 w-full" onClick={() => { setTab("signin"); setSuccess("") }}>
                Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={tab === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
              {tab === "signup" && (
                <>
                  <div>
                    <label className="text-[#c9a84c] text-xs uppercase tracking-widest block mb-1.5">Username *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase())}
                        placeholder="your_username"
                        className="w-full bg-[#141414] border border-[#1e1e1e] focus:border-[#c9a84c]/50 text-[#e8e8e8] pl-10 pr-4 py-2.5 text-sm outline-none rounded-sm placeholder-[#374151]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[#c9a84c] text-xs uppercase tracking-widest block mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[#141414] border border-[#1e1e1e] focus:border-[#c9a84c]/50 text-[#e8e8e8] pl-10 pr-4 py-2.5 text-sm outline-none rounded-sm placeholder-[#374151]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[#c9a84c] text-xs uppercase tracking-widest block mb-1.5">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#141414] border border-[#1e1e1e] focus:border-[#c9a84c]/50 text-[#e8e8e8] pl-10 pr-4 py-2.5 text-sm outline-none rounded-sm placeholder-[#374151]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#c9a84c] text-xs uppercase tracking-widest block mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={tab === "signup" ? "Min. 6 characters" : "Your password"}
                    className="w-full bg-[#141414] border border-[#1e1e1e] focus:border-[#c9a84c]/50 text-[#e8e8e8] pl-10 pr-10 py-2.5 text-sm outline-none rounded-sm placeholder-[#374151]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b5563] hover:text-[#9ca3af]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-[#e53030] text-sm bg-[#e53030]/10 border border-[#e53030]/20 px-3 py-2 rounded-sm">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? "Please wait..." : tab === "signin" ? "Sign In" : "Create Account"}
              </Button>

              <p className="text-center text-[#4b5563] text-xs">
                {tab === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => { setTab(tab === "signin" ? "signup" : "signin"); setError("") }}
                  className="text-[#c9a84c] hover:underline"
                >
                  {tab === "signin" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
