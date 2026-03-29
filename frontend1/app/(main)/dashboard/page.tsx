"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
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
} from "lucide-react"

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
  { label: "Pending Listings", href: "/admin/listings", icon: Home, color: "bg-[oklch(0.55_0.18_195)]" },
  { label: "All Users", href: "/admin/users", icon: Users, color: "bg-primary" },
  { label: "Statistics", href: "/admin/stats", icon: TrendingUp, color: "bg-[oklch(0.50_0.15_145)]" },
]

// Mock recent activity
const recentActivity = [
  {
    id: 1,
    type: "reservation",
    title: "Housing Reservation",
    description: "Your reservation for 'Comfortable Single Room' is pending approval",
    status: "pending",
    date: "2 hours ago",
  },
  {
    id: 2,
    type: "booking",
    title: "Laundry Booking",
    description: "Order #LND-00123 - Status: Requested",
    status: "processing",
    date: "Yesterday",
  },
  {
    id: 3,
    type: "listing",
    title: "Marketplace Item",
    description: "Your iPhone 13 listing received 5 new views",
    status: "active",
    date: "2 days ago",
  },
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
          Welcome back, {user.name.split(" ")[0]}!
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">1 pending approval</p>
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
              <div className="text-2xl font-bold">{user.role === "provider" ? "5" : "8"}</div>
              <p className="text-xs text-muted-foreground">
                {user.role === "provider" ? "2 housing, 1 laundry" : "In your watchlist"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.role === "provider" ? "Rs. 45,000" : "Rs. 12,500"}
              </div>
              <p className="text-xs text-muted-foreground">
                {user.role === "provider" ? "Total earnings" : "Total spent"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Stats */}
      {user.role === "admin" && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+23 this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Providers</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">12 pending review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. 2.4M</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const statusStyle = statusStyles[activity.status as keyof typeof statusStyles]
              const StatusIcon = statusStyle.icon
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${statusStyle.bg}`}>
                    <StatusIcon className={`h-4 w-4 ${statusStyle.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.date}
                  </span>
                </div>
              )
            })}
          </div>
          <Button variant="ghost" className="w-full mt-4" asChild>
            <Link href="/activity">
              View All Activity
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
