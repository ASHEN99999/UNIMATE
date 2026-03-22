"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { GraduationCap, Loader2, Eye, EyeOff, User, Building2, Home, Shirt } from "lucide-react"
import type { UserRole, ProviderType } from "@/lib/types"

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>("student")
  const [providerType, setProviderType] = useState<ProviderType>("housing")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    if (role === "provider" && !providerType) {
      toast.error("Please select your provider type")
      return
    }

    try {
      await register(name, email, password, role, role === "provider" ? providerType : undefined)
      toast.success(
        role === "provider"
          ? "Account created! Awaiting admin approval."
          : "Account created successfully!"
      )
      router.push("/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">UNIMATE</span>
          </Link>
        </div>

        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              {role === "student" 
                ? "Join UNIMATE with your university email"
                : "Join UNIMATE to offer your services"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {role === "student" ? "University Email" : "Email"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={role === "student" ? "your.name@university.lk" : "your.email@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>I am a...</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as UserRole)}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="student"
                    className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
                  >
                    <RadioGroupItem value="student" id="student" className="sr-only" />
                    <User className="mb-2 h-6 w-6" />
                    <span className="text-sm font-medium">Student</span>
                    <span className="text-xs text-muted-foreground text-center mt-1">
                      Browse and book services
                    </span>
                  </Label>
                  <Label
                    htmlFor="provider"
                    className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
                  >
                    <RadioGroupItem value="provider" id="provider" className="sr-only" />
                    <Building2 className="mb-2 h-6 w-6" />
                    <span className="text-sm font-medium">Provider</span>
                    <span className="text-xs text-muted-foreground text-center mt-1">
                      Offer housing/laundry
                    </span>
                  </Label>
                </RadioGroup>
                {role === "provider" && (
                  <>
                    <div className="space-y-2 pt-2">
                      <Label>Provider Type</Label>
                      <RadioGroup
                        value={providerType}
                        onValueChange={(value) => setProviderType(value as ProviderType)}
                        className="grid grid-cols-2 gap-4"
                      >
                        <Label
                          htmlFor="housing"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
                        >
                          <RadioGroupItem value="housing" id="housing" className="sr-only" />
                          <Home className="mb-2 h-6 w-6" />
                          <span className="text-sm font-medium">Housing</span>
                          <span className="text-xs text-muted-foreground text-center mt-1">
                            Provide housing listings
                          </span>
                        </Label>
                        <Label
                          htmlFor="laundry"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer [&:has([data-state=checked])]:border-primary"
                        >
                          <RadioGroupItem value="laundry" id="laundry" className="sr-only" />
                          <Shirt className="mb-2 h-6 w-6" />
                          <span className="text-sm font-medium">Laundry</span>
                          <span className="text-xs text-muted-foreground text-center mt-1">
                            Provide laundry services
                          </span>
                        </Label>
                      </RadioGroup>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Provider accounts require admin approval before you can create listings.
                    </p>
                  </>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>

            <p className="mt-4 text-xs text-center text-muted-foreground">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
