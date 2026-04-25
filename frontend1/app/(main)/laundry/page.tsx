"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
// mock-data imports removed - using real API data
import { useAuth } from "@/context/auth-context"
import { laundryService } from "@/lib/services/laundry.service"
import {
  Shirt,
  MapPin,
  Clock,
  Star,
  Phone,
  ArrowRight,
  Package,
  Plus,
  Loader2,
  QrCode,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

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
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || (user?.role === "provider" && user?.providerType === "laundry" ? "my-services" : "providers")
  
  const [activeTab, setActiveTab] = useState(tab)
  const [providerOrders, setProviderOrders] = useState([])
  const [myService, setMyService] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingService, setIsLoadingService] = useState(false)
  const [providers, setProviders] = useState<any[]>([])
  const [isLoadingProviders, setIsLoadingProviders] = useState(false)
  const [userBookings, setUserBookings] = useState<any[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)

  const isLaundryProvider = user?.role === "provider" && user?.providerType === "laundry"

  useEffect(() => {
    setActiveTab(tab)
    if (isLaundryProvider) {
      if (tab === "orders") {
        fetchProviderOrders()
      } else if (tab === "my-services") {
        fetchMyService()
      }
    } else {
      fetchProviders()
      fetchUserBookings()
    }
  }, [tab, isLaundryProvider])

  const fetchUserBookings = async () => {
    try {
      setIsLoadingBookings(true)
      const response = await fetch('http://localhost:5000/api/laundry/bookings', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('unimate_token')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setUserBookings(data.data || [])
      }
    } catch (error) {
      console.error("Failed to load bookings:", error)
    } finally {
      setIsLoadingBookings(false)
    }
  }

  const fetchProviders = async () => {
    try {
      setIsLoadingProviders(true)
      const response = await fetch('http://localhost:5000/api/laundry/providers', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('unimate_token')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setProviders(data.data || [])
      }
    } catch (error) {
      console.error("Failed to load providers:", error)
    } finally {
      setIsLoadingProviders(false)
    }
  }

  const fetchMyService = async () => {
    try {
      setIsLoadingService(true)
      const response = await fetch('http://localhost:5000/api/laundry/providers/my-provider', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('unimate_token')}`
        }
      })
      const data = await response.json()
      if (data.success && data.data) {
        setMyService(data.data)
      }
    } catch (error) {
      console.error("Failed to load service:", error)
    } finally {
      setIsLoadingService(false)
    }
  }

  const fetchProviderOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:5000/api/laundry/bookings', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('unimate_token')}`
        }
      })
      const data = await response.json()
      setProviderOrders(data.data || [])
    } catch (error) {
      toast.error("Failed to load orders")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // userBookings fetched from API via fetchUserBookings

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laundry Services</h1>
          <p className="text-muted-foreground mt-1">
            {isLaundryProvider 
              ? "Manage your laundry service and orders" 
              : "Book trusted laundry services near your campus"}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {isLaundryProvider ? (
            <>
              <TabsTrigger value="my-services">
                <Shirt className="mr-2 h-4 w-4" />
                My Services
              </TabsTrigger>
              <TabsTrigger value="orders">
                <Package className="mr-2 h-4 w-4" />
                Orders
                {providerOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {providerOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
            </>
          ) : (
            <>
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
            </>
          )}
        </TabsList>

        {/* Provider Tabs */}
        {isLaundryProvider && (
          <>
            <TabsContent value="my-services" className="mt-6">
              <MyServicesTab service={myService} isLoading={isLoadingService} onRefresh={fetchMyService} />
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <OrdersTab orders={providerOrders} isLoading={isLoading} onRefresh={fetchProviderOrders} />
            </TabsContent>
          </>
        )}

        {/* Student Tabs */}
        {!isLaundryProvider && (
          <>
            <TabsContent value="providers" className="mt-6">
          {isLoadingProviders ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : providers.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <ProviderCard key={provider.id || provider._id} provider={provider} />
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <Shirt className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No providers yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No laundry service providers are available at the moment.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          {isLoadingBookings ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : userBookings.length > 0 ? (
            <div className="space-y-4">
              {userBookings.map((booking) => (
                <BookingCard key={booking.id || booking._id} booking={booking} />
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
          </>
        )}
      </Tabs>
    </div>
  )
}

// My Services Tab - Provider View
function MyServicesTab({ service, isLoading, onRefresh }: { service: any, isLoading: boolean, onRefresh: () => void }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const token = sessionStorage.getItem('unimate_token')
      const response = await fetch(`http://localhost:5000/api/laundry/providers/${service.id || service._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Service deleted successfully")
        onRefresh()
      } else {
        toast.error(data.message || "Failed to delete service")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete service")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!service) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <Shirt className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Service Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your laundry service to start receiving orders from students.
          </p>
          <Button asChild className="mt-4">
            <Link href="/laundry/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Link>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="h-5 w-5" />
                {service.businessName}
              </CardTitle>
              <CardDescription className="mt-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {service.location}
              </CardDescription>
            </div>
            <Badge variant={service.isActive ? "default" : "secondary"}>
              {service.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Info */}
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact
            </h4>
            <p className="text-sm text-muted-foreground">{service.contactNumber}</p>
          </div>

          {/* Clothes Categories */}
          {service.clothesCategories && service.clothesCategories.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Clothes Categories</h4>
              <div className="grid gap-2">
                {service.clothesCategories.map((category: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm border-b pb-2">
                    <span>{category.name}</span>
                    <span className="font-medium">Rs. {category.pricePerItem}/item</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Types */}
          {service.serviceTypes && service.serviceTypes.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Service Types</h4>
              <div className="grid gap-2">
                {service.serviceTypes.map((serviceType: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm border-b pb-2">
                    <span>{serviceType.name}</span>
                    <span className="font-medium">Rs. {serviceType.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Durations */}
          {service.serviceDurations && service.serviceDurations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Service Durations</h4>
              <div className="grid gap-2">
                {service.serviceDurations.map((duration: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm border-b pb-2">
                    <span>{duration.duration} ({duration.hours}h)</span>
                    <span className="font-medium">
                      {duration.price > 0 ? `+Rs. ${duration.price}` : "Standard"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{service.rating?.toFixed(1) || "0.0"}</span>
            <span className="text-sm text-muted-foreground">
              ({service.totalReviews || 0} reviews)
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={onRefresh}>
            <Loader2 className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link href={`/laundry/edit/${service.id || service._id}`}>
              Edit Service
            </Link>
          </Button>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Service</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your laundry service? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  )
}

// Orders Tab - Provider View
function OrdersTab({ orders, isLoading, onRefresh }: { orders: any[], isLoading: boolean, onRefresh: () => void }) {
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{order.orderNumber || `Order #${order.id?.substring(0, 8)}`}</CardTitle>
                    <CardDescription className="mt-1">
                      Student: {order.studentName}
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                    {statusLabels[order.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Items:</strong> {order.clothesItems?.length || 0} items</div>
                  <div><strong>Services:</strong> {order.selectedServices?.join(", ") || "N/A"}</div>
                  <div><strong>Total:</strong> Rs. {order.totalPrice?.toLocaleString() || 0}</div>
                  <div><strong>Collection Date:</strong> {order.collectionDate ? new Date(order.collectionDate).toLocaleDateString() : "N/A"}</div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm">View Details</Button>
                {order.status === "requested" && (
                  <Button size="sm">Confirm Order</Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              When students book your laundry service, orders will appear here.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

function ProviderCard({ provider }: { provider: any }) {
  return (
    <Link href={`/laundry/${provider._id || provider.id}`}>
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
          {provider.operatingHours && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {provider.operatingHours.open} - {provider.operatingHours.close}
              </span>
            </div>
          )}
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
                Rs. {provider.clothesCategories?.length > 0 ? Math.min(...provider.clothesCategories.map((c: any) => c.pricePerItem)) : 0}/piece
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

function BookingCard({ booking }: { booking: any }) {
  const providerName = typeof booking.providerId === 'object'
    ? booking.providerId?.businessName
    : undefined
  const status = booking.status as keyof typeof statusColors
  const [qrData, setQrData] = useState<{ qrCode: string; booking: any } | null>(null)
  const [isLoadingQR, setIsLoadingQR] = useState(false)

  const handleShowQR = async () => {
    if (qrData) return // already loaded
    try {
      setIsLoadingQR(true)
      const data = await laundryService.getBookingQRCode(booking.id)
      setQrData(data)
    } catch {
      toast.error("Could not generate QR code for this booking")
    } finally {
      setIsLoadingQR(false)
    }
  }

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
            {providerName || booking.providerName || "Unknown Provider"}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span>{booking.clothesItems?.reduce((acc: number, item: any) => acc + item.quantity, 0)} items</span>
            <span>{Array.isArray(booking.selectedServices) ? booking.selectedServices.map((s: any) => s.name || s).join(", ") : ""}</span>
            <span>{booking.serviceDuration?.duration || booking.serviceDuration}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-lg">Rs. {booking.totalPrice.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">
            Collection: {new Date(booking.collectionDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/laundry/booking/${booking.id || booking._id}`}>
              View Details
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleShowQR}>
                {isLoadingQR ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <QrCode className="mr-2 h-4 w-4" />
                )}
                QR Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Booking QR Ticket</DialogTitle>
              </DialogHeader>
              {isLoadingQR ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : qrData ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <img src={qrData.qrCode} alt="Booking QR Code" className="w-56 h-56 rounded-lg border" />
                  <div className="w-full text-sm space-y-1 border rounded-lg p-3 bg-muted/30">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order</span>
                      <span className="font-medium">{qrData.booking.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className={statusColors[qrData.booking.status as keyof typeof statusColors]}>
                        {statusLabels[qrData.booking.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-medium">Rs. {qrData.booking.totalPrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Collection</span>
                      <span className="font-medium">{new Date(qrData.booking.collectionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Show this QR code to the laundry provider for pickup/handover verification.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                  <QrCode className="h-12 w-12" />
                  <p className="text-sm">QR code not available for this booking.</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
