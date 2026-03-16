"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Mail, User, Lock, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { updateProfile, getCurrentProfile } from "@/lib/auth"

interface FormData {
  full_name: string
  username: string
  bio: string
  avatar_url: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    username: "",
    bio: "",
    avatar_url: ""
  })
  const [loading2, setLoading2] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
      return
    }

    if (user) {
      loadProfile()
    }
  }, [user, loading, router])

  async function loadProfile() {
    try {
      const profile = await getCurrentProfile()
      if (profile) {
        setFormData({
          full_name: profile.full_name || "",
          username: profile.username || "",
          bio: profile.bio || "",
          avatar_url: profile.avatar_url || ""
        })
      }
    } catch (err) {
      console.error("Failed to load profile:", err)
    } finally {
      setLoading2(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const success = await updateProfile(user.id, formData)
      if (success) {
        setSuccess("Profile updated successfully!")
        setTimeout(() => router.push(`/profile/${formData.username}`), 2000)
      } else {
        setError("Failed to update profile")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setSaving(false)
    }
  }

  if (loading || loading2) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-[#c9a84c]">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#080808] pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/profile/${formData.username || user.email}`} className="text-[#6b7280] hover:text-[#c9a84c] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-[#e8e8e8]">Settings</h1>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-sm text-sm">
            {success}
          </div>
        )}

        {/* Profile Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Upload */}
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-sm p-6">
            <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#c9a84c]" />
              Avatar
            </h2>
            <div className="space-y-3">
              {formData.avatar_url && (
                <img
                  src={formData.avatar_url}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover border border-[#c9a84c]"
                />
              )}
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                placeholder="Enter image URL"
                className="w-full bg-[#141414] border border-[#1e1e1e] focus:border-[#c9a84c]/50 text-[#e8e8e8] px-4 py-2.5 text-sm outline-none rounded-sm placeholder-[#374151]"
              />
              <p className="text-[#6b7280] text-xs">Enter a direct image URL for your avatar</p>
            </div>
          </div>

          {/* Full Name */}
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-sm p-6">
            <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#c9a84c]" />
              Full Name
            </h2>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              placeholder="Your full name"
              className="w-full bg-[#141414] border border-[#1e1e1e] focus:border-[#c9a84c]/50 text-[#e8e8e8] px-4 py-2.5 text-sm outline-none rounded-sm placeholder-[#374151]"
            />
          </div>

          {/* Username */}
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-sm p-6">
            <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#c9a84c]" />
              Username
            </h2>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="Your username"
              className="w-full bg-[#141414] border border-[#1e1e1e] focus:border-[#c9a84c]/50 text-[#e8e8e8] px-4 py-2.5 text-sm outline-none rounded-sm placeholder-[#374151]"
            />
            <p className="text-[#6b7280] text-xs mt-2">Username must be unique and contain only letters, numbers, and underscores</p>
          </div>

          {/* Bio */}
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-sm p-6">
            <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4">Bio</h2>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Tell us about your movie taste..."
              maxLength={160}
              className="w-full bg-[#141414] border border-[#1e1e1e] focus:border-[#c9a84c]/50 text-[#e8e8e8] px-4 py-2.5 text-sm outline-none rounded-sm placeholder-[#374151] resize-none h-24"
            />
            <p className="text-[#6b7280] text-xs mt-2">{formData.bio.length}/160 characters</p>
          </div>

          {/* Email (Read-only) */}
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-sm p-6">
            <h2 className="text-lg font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#c9a84c]" />
              Email
            </h2>
            <input
              type="email"
              value={user.email || ""}
              disabled
              className="w-full bg-[#141414] border border-[#1e1e1e] text-[#6b7280] px-4 py-2.5 text-sm rounded-sm cursor-not-allowed opacity-50"
            />
            <p className="text-[#6b7280] text-xs mt-2">Email cannot be changed here. Contact support if you need to update it.</p>
          </div>

          {/* Save Button */}
          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-[#c9a84c] text-black hover:bg-[#d4b86a] font-semibold py-2.5"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>

        {/* Danger Zone */}
        <div className="mt-12 p-6 bg-[#0f0f0f] border border-red-500/20 rounded-sm">
          <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </h2>
          <p className="text-[#6b7280] text-sm mb-4">Once you delete your account, there is no going back.</p>
          
          {showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="text-red-400 text-sm font-semibold">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled
                >
                  Delete Account (Coming Soon)
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="border-red-500/20 text-red-400 hover:bg-red-500/10"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
