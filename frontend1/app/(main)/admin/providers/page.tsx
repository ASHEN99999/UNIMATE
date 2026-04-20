"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { authService } from "@/lib/services/auth.service"
import { toast } from "sonner"
import { CheckCircle2, XCircle, Mail, Phone, User, Loader2, Home, Shirt } from "lucide-react"
import type { User as UserType } from "@/lib/types"

export default function PendingProvidersPage() {
  const { user } = useAuth()
  const [providers, setProviders] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingProviders()
  }, [])

  const fetchPendingProviders = async () => {
    try {
      setLoading(true)
      const data = await authService.getPendingProviders()
      setProviders(data)
    } catch (error) {
      toast.error("Failed to fetch pending providers")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (providerId: string) => {
    try {
      setActionLoading(providerId)
      await authService.approveProvider(providerId)
      toast.success("Provider approved successfully!")
      await fetchPendingProviders()
    } catch (error) {
      toast.error("Failed to approve provider")
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (providerId: string) => {
    try {
      setActionLoading(providerId)
      await authService.rejectProvider(providerId)
      toast.success("Provider rejected")
      await fetchPendingProviders()
    } catch (error) {
      toast.error("Failed to reject provider")
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pending Providers</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve provider applications
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      ) : providers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              No pending provider applications
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {provider.name}
                    </CardTitle>
                    <CardDescription>
                      Applied on {new Date(provider.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {provider.role}
                    </Badge>
                    {provider.providerType && (
                      <Badge variant="outline" className="capitalize flex items-center gap-1">
                        {provider.providerType === "housing" ? (
                          <Home className="h-3 w-3" />
                        ) : (
                          <Shirt className="h-3 w-3" />
                        )}
                        {provider.providerType}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                      <span className="text-muted-foreground">{provider.universityEmail}</span>
                    </div>
                    {provider.contactNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Phone:</span>
                        <span className="text-muted-foreground">{provider.contactNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleApprove(provider.id)}
                      disabled={actionLoading === provider.id}
                      className="flex-1"
                    >
                      {actionLoading === provider.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(provider.id)}
                      disabled={actionLoading === provider.id}
                      className="flex-1"
                    >
                      {actionLoading === provider.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
