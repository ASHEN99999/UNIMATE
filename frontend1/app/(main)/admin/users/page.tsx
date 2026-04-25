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
import { CheckCircle2, XCircle, Mail, Phone, User, Loader2, Users, Search, Shield } from "lucide-react"
import type { User as UserType } from "@/lib/types"

export default function AllUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchUsers()
  }, [roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await authService.getAllUsers()
      
      // Filter client-side since backend doesn't support these filters
      let filtered = data
      if (roleFilter !== "all") {
        filtered = filtered.filter(u => u.role === roleFilter)
      }
      if (statusFilter !== "all") {
        filtered = filtered.filter(u => 
          statusFilter === "active" ? u.isActive : !u.isActive
        )
      }
      
      setUsers(filtered)
    } catch (error) {
      toast.error("Failed to fetch users")
      console.error(error)
    } finally {
      setLoading(false)
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
        toast.success("User deactivated successfully")
        await fetchUsers()
      } else {
        toast.error(data.message || "Failed to deactivate user")
      }
    } catch (error) {
      toast.error("Failed to deactivate user")
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
        toast.success("User activated successfully")
        await fetchUsers()
      } else {
        toast.error(data.message || "Failed to activate user")
      }
    } catch (error) {
      toast.error("Failed to activate user")
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        user.name?.toLowerCase().includes(query) ||
        user.universityEmail?.toLowerCase().includes(query)
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
          All Users
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage all registered users
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="provider">Providers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              No users found
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((userItem) => (
            <Card key={userItem.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {userItem.name}
                      {userItem.role === "admin" && (
                        <Shield className="h-4 w-4 text-primary" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      Joined on {new Date(userItem.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {userItem.role}
                    </Badge>
                    {userItem.providerType && (
                      <Badge variant="outline" className="capitalize">
                        {userItem.providerType}
                      </Badge>
                    )}
                    <Badge variant={userItem.isActive ? "default" : "secondary"}>
                      {userItem.isActive ? "Active" : "Inactive"}
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
                      <span className="text-muted-foreground">{userItem.universityEmail}</span>
                    </div>
                    {userItem.contactNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Phone:</span>
                        <span className="text-muted-foreground">{userItem.contactNumber}</span>
                      </div>
                    )}
                    {!userItem.isApproved && userItem.role === "provider" && (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <Shield className="h-4 w-4" />
                        <span>Pending Approval</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    {userItem.isActive ? (
                      <Button
                        variant="outline"
                        onClick={() => handleDeactivate(userItem.id)}
                        disabled={actionLoading === userItem.id || userItem.id === user.id}
                        className="flex-1"
                      >
                        {actionLoading === userItem.id ? (
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
                        onClick={() => handleActivate(userItem.id)}
                        disabled={actionLoading === userItem.id}
                        className="flex-1"
                      >
                        {actionLoading === userItem.id ? (
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
