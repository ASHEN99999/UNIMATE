"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { housingService } from "@/lib/services/housing.service"
import { toast } from "sonner"
import { CheckCircle2, XCircle, MapPin, Home, Loader2, Bed, DollarSign } from "lucide-react"
import type { HousingListing } from "@/lib/types"

export default function PendingListingsPage() {
  const { user } = useAuth()
  const [listings, setListings] = useState<HousingListing[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingListings()
  }, [])

  const fetchPendingListings = async () => {
    try {
      setLoading(true)
      const token = sessionStorage.getItem('unimate_token')
      const response = await fetch(`http://localhost:5000/api/housing?status=pending_approval`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setListings(data.data)
      } else {
        toast.error("Failed to fetch pending listings")
      }
    } catch (error) {
      toast.error("Failed to fetch pending listings")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (listingId: string) => {
    try {
      setActionLoading(listingId)
      const token = sessionStorage.getItem('unimate_token')
      const response = await fetch(`http://localhost:5000/api/housing/${listingId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Listing approved successfully!")
        await fetchPendingListings()
      } else {
        toast.error(data.message || "Failed to approve listing")
      }
    } catch (error) {
      toast.error("Failed to approve listing")
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (listingId: string) => {
    const reason = prompt("Please enter a reason for rejection:")
    if (!reason) return

    try {
      setActionLoading(listingId)
      const token = sessionStorage.getItem('unimate_token')
      const response = await fetch(`http://localhost:5000/api/housing/${listingId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Listing rejected")
        await fetchPendingListings()
      } else {
        toast.error(data.message || "Failed to reject listing")
      }
    } catch (error) {
      toast.error("Failed to reject listing")
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
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Home className="h-8 w-8" />
          Pending Listings
        </h1>
        <p className="text-muted-foreground mt-2">
          Review and approve housing listings
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
      ) : listings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              No pending listings
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      {listing.title}
                    </CardTitle>
                    <CardDescription>
                      Submitted on {new Date(listing.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {listing.propertyType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Location:</span>
                      <span className="text-muted-foreground">
                        {listing.location.city} - {listing.location.distance}km from campus
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Room Type:</span>
                      <span className="text-muted-foreground capitalize">{listing.roomType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Price:</span>
                      <span className="text-muted-foreground">Rs. {listing.price.toLocaleString()}/month</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Description:</span>
                      <p className="text-muted-foreground mt-1 line-clamp-2">{listing.description}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleApprove(listing.id)}
                      disabled={actionLoading === listing.id}
                      className="flex-1"
                    >
                      {actionLoading === listing.id ? (
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
                      onClick={() => handleReject(listing.id)}
                      disabled={actionLoading === listing.id}
                      className="flex-1"
                    >
                      {actionLoading === listing.id ? (
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
