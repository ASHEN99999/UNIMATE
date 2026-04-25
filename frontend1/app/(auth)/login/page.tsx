"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { GraduationCap, Loader2, Eye, EyeOff, User, Building2 } from "lucide-react"

type LoginType = "university" | "provider"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [loginType, setLoginType] = useState<LoginType>("university")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState("")

  // Validate university email format (it22267818@my.sliit.lk)
  const validateUniversityEmail = (email: string): boolean => {
    // University email pattern: it + 8 digits + @my.sliit.lk (case insensitive)
    const universityPattern = /^it\d{8}@my\.sliit\.lk$/i
    return universityPattern.test(email)
  }

  // Validate regular email format
  const validateProviderEmail = (email: string): boolean => {
    // Basic email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!email.includes("@")) {
      setEmailError("Email must contain '@' symbol")
      return false
    }
    
    if (!email.includes(".")) {
      setEmailError("Email must contain a domain (e.g., gmail.com)")
      return false
    }
    
    if (email.indexOf("@") > email.lastIndexOf(".")) {
      setEmailError("Invalid email format. Example: user@example.com")
      return false
    }
    
    if (!emailPattern.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    
    return true
  }

  // Handle email change with validation
  const handleEmailChange = (value: string) => {
    setEmail(value)
    setEmailError("")
    
    if (value) {
      if (loginType === "university") {
        if (!validateUniversityEmail(value)) {
          setEmailError("Please enter a valid university email (e.g., it22267818@my.sliit.lk)")
        }
      } else {
        if (!validateProviderEmail(value)) {
          // Error message is set inside validateProviderEmail
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    // Validate email format before submitting
    if (loginType === "university") {
      if (!validateUniversityEmail(email)) {
        toast.error("Please enter a valid university email (e.g., it22267818@my.sliit.lk)")
        return
      }
    } else {
      if (!validateProviderEmail(email)) {
        toast.error("Please enter a valid email address")
        return
      }
    }

    try {
      await login(email, password)
      toast.success("Welcome back!")
      router.push("/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed")
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
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={loginType} onValueChange={(value) => {
              setLoginType(value as LoginType)
              setEmail("")
              setEmailError("")
            }} className="mb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="university" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  University
                </TabsTrigger>
                <TabsTrigger value="provider" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Provider
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="university" className="mt-4">
                <p className="text-xs text-muted-foreground">
                  For Admin, Students, and Student Food Dealers
                </p>
              </TabsContent>
              
              <TabsContent value="provider" className="mt-4">
                <p className="text-xs text-muted-foreground">
                  For Housing and Laundry Service Providers
                </p>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {loginType === "university" ? "University Email" : "Email"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={
                    loginType === "university" 
                      ? "it22267818@my.sliit.lk" 
                      : "provider@gmail.com"
                  }
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  disabled={isLoading}
                  required
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && (
                  <p className="text-xs text-red-500 mt-1">{emailError}</p>
                )}
                {loginType === "university" && !emailError && email && validateUniversityEmail(email) && (
                  <p className="text-xs text-green-600 mt-1">✓ Valid university email format</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {"Don't have an account? "}
              </span>
              <Link href="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Demo Credentials:
              </p>
              <div className="space-y-1 text-xs">
                {loginType === "university" ? (
                  <>
                    <p>
                      <span className="text-muted-foreground">Student:</span>{" "}
                      it22267818@my.sliit.lk / password123
                    </p>
                    <p>
                      <span className="text-muted-foreground">Food Dealer:</span>{" "}
                      it22345678@my.sliit.lk / password123
                    </p>
                    <p>
                      <span className="text-muted-foreground">Admin:</span>{" "}
                      admin@sliit.lk / admin123
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <span className="text-muted-foreground">Housing Provider:</span>{" "}
                      provider123@gmail.com / password123
                    </p>
                    <p>
                      <span className="text-muted-foreground">Laundry Provider:</span>{" "}
                      laundry@outlook.com / password123
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
