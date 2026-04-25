"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { authService } from "@/lib/services/auth.service"
import { housingService } from "@/lib/services/housing.service"
import { TrendingUp, Users, Home, Clock, DollarSign, Loader2, Shirt } from "lucide-react"

export default function StatisticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingProviders: 0,
    activeListings: 0,
    pendingListings: 0,
    totalProviders: 0,
    totalStudents: 0,
    monthlyTransactions: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch users
      const users = await authService.getAllUsers()
      const providers = await authService.getAllProviders()
      const pendingProviders = await authService.getPendingProviders()
      
      // Fetch listings
      const token = sessionStorage.getItem('unimate_token')
      const activeListingsResponse = await fetch(`http://localhost:5000/api/housing?status=active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const pendingListingsResponse = await fetch(`http://localhost:5000/api/housing?status=pending_approval`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const activeListingsData = await activeListingsResponse.json()
      const pendingListingsData = await pendingListingsResponse.json()
      
      setStats({
        totalUsers: users.length,
        pendingProviders: pendingProviders.length,
        activeListings: activeListingsData.success ? activeListingsData.data.length : 0,
        pendingListings: pendingListingsData.success ? pendingListingsData.data.length : 0,
        totalProviders: providers.length,
        totalStudents: users.filter(u => u.role === 'student').length,
        monthlyTransactions: 0 // This would need a separate endpoint
      })
    } catch (error) {
      console.error("Failed to fetch stats", error)
    } finally {
      setLoading(false)
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
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Statistics
        </h1>
        <p className="text-muted-foreground mt-2">
          View platform analytics and insights
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
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalStudents} students, {stats.totalProviders} providers
              </p>
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
              <CardTitle className="text-sm font-medium">Monthly Transactions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. 2.4M</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Stats */}
      {!loading && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Breakdown by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Students</span>
                  </div>
                  <span className="font-semibold">{stats.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shirt className="h-4 w-4 text-muted-foreground" />
                    <span>Providers</span>
                  </div>
                  <span className="font-semibold">{stats.totalProviders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>Admins</span>
                  </div>
                  <span className="font-semibold">{stats.totalUsers - stats.totalStudents - stats.totalProviders}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Listing Status</CardTitle>
              <CardDescription>Housing listings overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-green-500" />
                    <span>Active Listings</span>
                  </div>
                  <span className="font-semibold">{stats.activeListings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>Pending Review</span>
                  </div>
                  <span className="font-semibold">{stats.pendingListings}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
