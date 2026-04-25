"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { authService } from "@/lib/services/auth.service"
import { toast } from "sonner"
import { Loader2, User, Phone, Building, Save } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [universityEmail, setUniversityEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [role, setRole] = useState<"student" | "provider" | "admin">("student")
  const [providerType, setProviderType] = useState<"housing" | "laundry">("housing")

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setUniversityEmail(user.universityEmail || "")
      setContactPhone(user.contactPhone || "")
      setRole(user.role || "student")
      setProviderType(user.providerType || "housing")
      setLoading(false)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !universityEmail) {
      toast.error("Name and email are required")
      return
    }

    try {
      setSaving(true)
      const updateData = {
        name,
        contactPhone,
        providerType: role === "provider" ? providerType : undefined,
      }

      const updatedUser = await authService.updateProfile(updateData)
      
      // Update sessionStorage
      sessionStorage.setItem('unimate_user', JSON.stringify(updatedUser))
      
      // Reload page to update auth context
      window.location.reload()
      
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Manage your account information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="universityEmail">University Email *</Label>
                <Input
                  id="universityEmail"
                  type="email"
                  value={universityEmail}
                  onChange={(e) => setUniversityEmail(e.target.value)}
                  placeholder="it22267818@my.sliit.lk"
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="0771234567"
                />
              </div>
            </div>

            {/* Role Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Role Information
              </h3>
              
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={role} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="provider">Service Provider</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Role cannot be changed</p>
              </div>

              {role === "provider" && (
                <div>
                  <Label htmlFor="providerType">Provider Type</Label>
                  <Select value={providerType} onValueChange={(value: any) => setProviderType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="housing">Housing</SelectItem>
                      <SelectItem value="laundry">Laundry Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Account Status */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Account Status</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <p className="font-semibold capitalize">
                    {user?.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                
                {role === "provider" && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Provider Status</p>
                    <p className="font-semibold capitalize">
                      {user?.isApproved ? "Approved" : "Pending Approval"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
