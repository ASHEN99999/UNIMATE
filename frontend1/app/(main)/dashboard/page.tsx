"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { authService } from "@/lib/services/auth.service"
import { housingService } from "@/lib/services/housing.service"
import {
  Home,
  Shirt,
  Utensils,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Package,
  Users,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { useState, useEffect } from "react"

// Quick actions based on role
const studentActions = [
  { label: "Find Housing", href: "/housing", icon: Home, color: "bg-[oklch(0.55_0.18_195)]" },
  { label: "My Reservations", href: "/housing?tab=my-reservations", icon: CalendarDays, color: "bg-[oklch(0.55_0.16_280)]" },
  { label: "Book Laundry", href: "/laundry", icon: Shirt, color: "bg-[oklch(0.55_0.16_280)]" },
  { label: "Request Food", href: "/food", icon: Utensils, color: "bg-[oklch(0.60_0.18_40)]" },
  { label: "Browse Items", href: "/marketplace", icon: ShoppingBag, color: "bg-[oklch(0.50_0.15_145)]" },
]

const providerActions = [
  { label: "My Listings", href: "/housing?tab=my-listings", icon: Home, color: "bg-[oklch(0.55_0.18_195)]" },
  { label: "Laundry Orders", href: "/laundry?tab=orders", icon: Shirt, color: "bg-[oklch(0.55_0.16_280)]" },
  { label: "Add Listing", href: "/housing/new", icon: Home, color: "bg-primary" },
]

const housingProviderActions = [
  { label: "My Listings", href: "/housing?tab=my-listings", icon: Home, color: "bg-[oklch(0.55_0.18_195)]" },
  { label: "Reservations", href: "/housing?tab=reservations", icon: CalendarDays, color: "bg-[oklch(0.55_0.16_280)]" },
  { label: "Add Listing", href: "/housing/new", icon: Home, color: "bg-primary" },
]

const laundryProviderActions = [
  { label: "My Services", href: "/laundry?tab=my-services", icon: Shirt, color: "bg-[oklch(0.55_0.16_280)]" },
  { label: "Orders", href: "/laundry?tab=orders", icon: Package, color: "bg-[oklch(0.55_0.18_195)]" },
  { label: "Add Service", href: "/laundry/new", icon: Shirt, color: "bg-primary" },
]

const adminActions = [
  { label: "Pending Providers", href: "/admin/providers", icon: Users, color: "bg-[oklch(0.55_0.16_280)]" },
  { label: "All Providers", href: "/admin/all-providers", icon: Users, color: "bg-[oklch(0.55_0.18_195)]" },
  { label: "Pending Listings", href: "/admin/listings", icon: Home, color: "bg-[oklch(0.55_0.18_195)]" },
  { label: "All Users", href: "/admin/users", icon: Users, color: "bg-primary" },
  { label: "Statistics", href: "/admin/stats", icon: TrendingUp, color: "bg-[oklch(0.50_0.15_145)]" },
]

const statusStyles = {
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  processing: { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
  active: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  rejected: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingProviders: 0,
    activeListings: 0,
    pendingListings: 0,
    totalProviders: 0,
    totalStudents: 0,
    monthlyTransactions: 0,
    userStats: {
      activeBookings: 0,
      pendingBookings: 0,
      myListings: 0,
      savedItems: 0,
    }
  })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAdminStats()
    } else if (user) {
      fetchUserStats()
    }
  }, [user])

  const fetchAdminStats = async () => {
    try {
      setStatsLoading(true)
      const users = await authService.getAllUsers()
      const providers = await authService.getAllProviders()
      const pendingProviders = await authService.getPendingProviders()
      
      const token = sessionStorage.getItem('unimate_token')
      const activeListingsResponse = await fetch(`http://localhost:5000/api/housing?status=active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const pendingListingsResponse = await fetch(`http://localhost:5000/api/housing?status=pending_approval`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      // Fetch paid transactions from food requests (laundry endpoint doesn't support admin filtering)
      const foodRequestsResponse = await fetch(`http://localhost:5000/api/food-assistance/requests?paymentStatus=paid`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const activeListingsData = await activeListingsResponse.json()
      const pendingListingsData = await pendingListingsResponse.json()
      const foodRequestsData = await foodRequestsResponse.json()
      
      // Calculate total transactions from paid requests
      let totalTransactions = 0
      if (foodRequestsData.success && foodRequestsData.data) {
        foodRequestsData.data.forEach((request: any) => {
          if (request.estimatedCost) {
            totalTransactions += request.estimatedCost
          }
        })
      }
      
      setStats({
        totalUsers: users.length,
        pendingProviders: pendingProviders.length,
        activeListings: activeListingsData.success ? activeListingsData.data.length : 0,
        pendingListings: pendingListingsData.success ? pendingListingsData.data.length : 0,
        totalProviders: providers.length,
        totalStudents: users.filter(u => u.role === 'student').length,
        monthlyTransactions: totalTransactions,
        userStats: stats.userStats
      })
    } catch (error) {
      console.error("Failed to fetch stats", error)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchUserStats = async () => {
    if (!user) return
    
    try {
      setStatsLoading(true)
      
      if (user.role === "student") {
        // Fetch student-specific stats
        const myReservations = await housingService.getMyReservations()
        const pendingCount = myReservations.filter(r => r.status === 'pending').length
        
        setStats(prev => ({
          ...prev,
          userStats: {
            activeBookings: myReservations.length,
            pendingBookings: pendingCount,
            myListings: 0,
            savedItems: 0,
          }
        }))
      } else if (user.role === "provider") {
        // Fetch provider-specific stats
        const myListings = await housingService.getMyListings()
        
        setStats(prev => ({
          ...prev,
          userStats: {
            activeBookings: 0,
            pendingBookings: 0,
            myListings: myListings.length,
            savedItems: 0,
          }
        }))
      }
    } catch (error) {
      console.error("Failed to fetch user stats", error)
    } finally {
      setStatsLoading(false)
    }
  }

  // No need to check auth here - layout already handles it

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    )
  }

  const getQuickActions = () => {
    switch (user.role) {
      case "admin":
        return adminActions
      case "provider":
        if (user.providerType === "housing") {
          return housingProviderActions
        } else if (user.providerType === "laundry") {
          return laundryProviderActions
        }
        return providerActions // fallback for providers without type
      default:
        return studentActions
    }
  }

  const quickActions = getQuickActions()

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name ? user.name.split(" ")[0] : "User"}!
        </h1>
        <p className="text-muted-foreground">
          {user.role === "admin"
            ? "Manage the UNIMATE platform and review pending approvals."
            : user.role === "provider"
            ? user.providerType === "housing"
              ? "Manage your housing listings and view incoming reservations."
              : user.providerType === "laundry"
              ? "Manage your laundry services and view incoming orders."
              : "Manage your listings and view incoming reservations."
            : "Here's what's happening with your campus services."}
        </p>
      </div>

      {/* Role Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="capitalize">
          {user.role}
        </Badge>
        {user.role === "provider" && user.providerType && (
          <Badge variant="secondary" className="capitalize">
            {user.providerType} Provider
          </Badge>
        )}
        {user.role === "provider" && !user.isApproved && (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
            Pending Approval
          </Badge>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div
                    className={`${action.color} p-3 rounded-xl mb-3 transition-transform group-hover:scale-110`}
                  >
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Cards (Student/Provider) */}
      {user.role !== "admin" && (
        <div className="grid md:grid-cols-3 gap-4">
          {statsLoading ? (
            <Card className="col-span-3">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.userStats.activeBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.userStats.pendingBookings > 0 ? `${stats.userStats.pendingBookings} pending approval` : "All confirmed"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {user.role === "provider" ? "Active Listings" : "Saved Items"}
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {user.role === "provider" ? stats.userStats.myListings : stats.userStats.savedItems}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {user.role === "provider" ? "Your published listings" : "In your watchlist"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rs. 0</div>
                  <p className="text-xs text-muted-foreground">
                    {user.role === "provider" ? "Total earnings" : "Total spent"}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Admin Stats */}
      {user.role === "admin" && (
        <div className="grid md:grid-cols-4 gap-4">
          {statsLoading ? (
            <Card className="col-span-4">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">{stats.totalStudents} students, {stats.totalProviders} providers</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Providers</CardTitle>
                  <Clock className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingProviders}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeListings}</div>
                  <p className="text-xs text-muted-foreground">{stats.pendingListings} pending review</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rs. {stats.monthlyTransactions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total from paid bookings</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

    </div>
  )
}
