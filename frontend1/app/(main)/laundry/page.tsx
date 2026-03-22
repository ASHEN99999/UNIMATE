"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockLaundryProviders, mockLaundryBookings } from "@/lib/mock-data"
import { useAuth } from "@/context/auth-context"
import {
  Shirt,
  MapPin,
  Clock,
  Star,
  Phone,
  ArrowRight,
  Package,
} from "lucide-react"

const statusColors = {
  requested: "bg-amber-500/10 text-amber-600 border-amber-200",
  handover_pending: "bg-blue-500/10 text-blue-600 border-blue-200",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-200",
  processing: "bg-purple-500/10 text-purple-600 border-purple-200",
  ready: "bg-green-500/10 text-green-600 border-green-200",
  completed: "bg-muted text-muted-foreground border-muted",
  cancelled: "bg-red-500/10 text-red-600 border-red-200",
}

const statusLabels = {
  requested: "Requested",
  handover_pending: "Awaiting Handover",
  confirmed: "Confirmed",
  processing: "In Progress",
  ready: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
}

export default function LaundryPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("providers")

  // Get user's bookings from localStorage + mock data
  const getUserBookings = () => {
    const storedBookings = JSON.parse(localStorage.getItem("unimate_laundry_bookings") || "[]")
    const userBookings = [...storedBookings, ...mockLaundryBookings].filter(
      (booking) => booking.studentId === user?.id
    )
    return userBookings
  }

  const userBookings = getUserBookings()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laundry Services</h1>
        <p className="text-muted-foreground mt-1">
          Book trusted laundry services near your campus
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="providers">
            <Shirt className="mr-2 h-4 w-4" />
            Service Providers
          </TabsTrigger>
          <TabsTrigger value="bookings">
            <Package className="mr-2 h-4 w-4" />
            My Bookings
            {userBookings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {userBookings.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockLaundryProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          {userBookings.length > 0 ? (
            <div className="space-y-4">
              {userBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No bookings yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Select a laundry provider to make your first booking.
                </p>
                <Button className="mt-4" onClick={() => setActiveTab("providers")}>
                  Browse Providers
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProviderCard({ provider }: { provider: typeof mockLaundryProviders[0] }) {
  return (
    <Link href={`/laundry/${provider.id}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:border-[oklch(0.55_0.16_280)]/50 cursor-pointer group">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.55_0.16_280)]/10 group-hover:bg-[oklch(0.55_0.16_280)]/20 transition-colors">
              <Shirt className="h-6 w-6 text-[oklch(0.55_0.16_280)]" />
            </div>
            <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-full">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="text-sm font-medium">{provider.rating}</span>
              <span className="text-xs text-muted-foreground">({provider.totalReviews})</span>
            </div>
          </div>
          <CardTitle className="mt-3">{provider.businessName}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {provider.location}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {provider.operatingHours.open} - {provider.operatingHours.close}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{provider.contactNumber}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {provider.serviceTypes.map((service) => (
              <Badge key={service.name} variant="outline" className="text-xs">
                {service.name}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div>
              <span className="text-xs text-muted-foreground">Starting from</span>
              <p className="font-semibold text-[oklch(0.55_0.16_280)]">
                Rs. {Math.min(...provider.clothesCategories.map((c) => c.pricePerPiece))}/piece
              </p>
            </div>
            <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground">
              Book Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

function BookingCard({ booking }: { booking: typeof mockLaundryBookings[0] }) {
  const provider = mockLaundryProviders.find((p) => p.id === booking.providerId)
  const status = booking.status as keyof typeof statusColors

  return (
    <Card>
      <CardContent className="flex flex-col md:flex-row md:items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.55_0.16_280)]/10 flex-shrink-0">
          <Shirt className="h-6 w-6 text-[oklch(0.55_0.16_280)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold">{booking.orderNumber}</p>
            <Badge variant="outline" className={statusColors[status]}>
              {statusLabels[status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {provider?.businessName || "Unknown Provider"}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span>{booking.clothesItems.reduce((acc, item) => acc + item.quantity, 0)} items</span>
            <span>{booking.selectedServices.join(", ")}</span>
            <span>{booking.serviceDuration}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-lg">Rs. {booking.totalPrice.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">
            Collection: {new Date(booking.collectionDate).toLocaleDateString()}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/laundry/booking/${booking.id}`}>
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
