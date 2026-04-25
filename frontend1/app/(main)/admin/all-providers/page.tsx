"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { authService } from "@/lib/services/auth.service"
import { toast } from "sonner"
import { CheckCircle2, XCircle, Mail, Phone, User, Loader2, Users, Search, Shield, Home, Shirt } from "lucide-react"
import type { User as UserType } from "@/lib/types"

export default function AllProvidersPage() {
  const { user } = useAuth()
  const [providers, setProviders] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchProviders()
  }, [typeFilter, statusFilter])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      const data = await authService.getAllUsers()
      
      // Filter client-side since backend doesn't support these filters
      let filtered = data.filter(u => u.role === "provider")
      if (typeFilter !== "all") {
        filtered = filtered.filter(p => p.providerType === typeFilter)
      }
      if (statusFilter !== "all") {
        filtered = filtered.filter(p => 
          statusFilter === "approved" ? p.isApproved : !p.isApproved
        )
      }
      
      setProviders(filtered)
    } catch (error) {
      toast.error("Failed to fetch providers")
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
      await fetchProviders()
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
      await fetchProviders()
    } catch (error) {
      toast.error("Failed to reject provider")
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeactivate = async (userId: string) => {
    try {
      setActionLoading(userId)
      const token = sessionStorage.getItem('unimate_token')
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Provider deactivated successfully")
        await fetchProviders()
      } else {
        toast.error(data.message || "Failed to deactivate provider")
      }
    } catch (error) {
      toast.error("Failed to deactivate provider")
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleActivate = async (userId: string) => {
    try {
      setActionLoading(userId)
      const token = sessionStorage.getItem('unimate_token')
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Provider activated successfully")
        await fetchProviders()
      } else {
        toast.error(data.message || "Failed to activate provider")
      }
    } catch (error) {
      toast.error("Failed to activate provider")
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredProviders = (Array.isArray(providers) ? providers : []).filter(provider => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        provider.name?.toLowerCase().includes(query) ||
        provider.universityEmail?.toLowerCase().includes(query)
      )
    }
    return true
  })

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
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8" />
          All Providers
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage all registered providers
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="housing">Housing</SelectItem>
                <SelectItem value="laundry">Laundry</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      ) : filteredProviders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              No providers found
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredProviders.map((provider) => (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {provider.name}
                    </CardTitle>
                    <CardDescription>
                      Joined on {new Date(provider.createdAt).toLocaleDateString()}
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
                    <Badge variant={provider.isApproved ? "default" : "secondary"}>
                      {provider.isApproved ? "Approved" : "Pending"}
                    </Badge>
                    <Badge variant={provider.isActive ? "default" : "secondary"}>
                      {provider.isActive ? "Active" : "Inactive"}
                    </Badge>
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
                    {!provider.isApproved && (
                      <>
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
                      </>
                    )}
                    {provider.isApproved && (
                      <>
                        {provider.isActive ? (
                          <Button
                            variant="outline"
                            onClick={() => handleDeactivate(provider.id)}
                            disabled={actionLoading === provider.id}
                            className="flex-1"
                          >
                            {actionLoading === provider.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deactivating...
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleActivate(provider.id)}
                            disabled={actionLoading === provider.id}
                            className="flex-1"
                          >
                            {actionLoading === provider.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Activating...
                              </>
                            ) : (
                              <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Activate
                            </>
                            )}
                          </Button>
                        )}
                      </>
                    )}
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
