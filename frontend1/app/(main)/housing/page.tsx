"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { housingService } from "@/lib/services/housing.service"
import { toast } from "sonner"
import type { HousingListing, HousingFilters, PropertyType, HousingReservation } from "@/lib/types"
import {
  Home,
  MapPin,
  Wifi,
  Car,
  Snowflake,
  Bath,
  Tv,
  Search,
  SlidersHorizontal,
  X,
  Plus,
  Loader2,
  CalendarDays,
  Check,
  XCircle,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { format } from "date-fns"

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "boarding", label: "Boarding" },
  { value: "room", label: "Room" },
  { value: "annex", label: "Annex" },
  { value: "apartment", label: "Apartment" },
]

const AMENITIES = [
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "parking", label: "Parking", icon: Car },
  { id: "ac", label: "AC", icon: Snowflake },
  { id: "attached-bathroom", label: "Attached Bathroom", icon: Bath },
  { id: "tv", label: "TV", icon: Tv },
]

const CITIES = ["All", "Colombo", "Kandy", "Galle", "Jaffna", "Matara"]

function getAmenityIcon(amenity: string) {
  const lowerAmenity = amenity.toLowerCase()
  if (lowerAmenity.includes("wifi")) return <Wifi className="h-3 w-3" />
  if (lowerAmenity.includes("parking")) return <Car className="h-3 w-3" />
  if (lowerAmenity.includes("ac")) return <Snowflake className="h-3 w-3" />
  if (lowerAmenity.includes("bathroom")) return <Bath className="h-3 w-3" />
  if (lowerAmenity.includes("tv")) return <Tv className="h-3 w-3" />
  return null
}

export default function HousingPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "browse"
  
  const [listings, setListings] = useState<HousingListing[]>([])
  const [reservations, setReservations] = useState<HousingReservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<HousingFilters>({})
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    if (tab === "reservations" && user?.role === "provider") {
      fetchReservations()
    } else if (tab === "my-reservations" && user?.role === "student") {
      fetchReservations()
    } else {
      fetchListings()
    }
  }, [tab, user])

  const fetchReservations = async () => {
    try {
      setIsLoading(true)
      // Fetch provider or student reservations based on role
      const endpoint = user?.role === "provider" 
        ? 'http://localhost:5000/api/housing/provider/reservations'
        : 'http://localhost:5000/api/housing/my/reservations'
      
      console.log('Fetching reservations from:', endpoint)
      console.log('User role:', user?.role)
      console.log('User ID:', user?.id)
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('unimate_token')}`
        }
      })
      
      const data = await response.json()
      console.log('Reservations response:', data)
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reservations')
      }
      
      setReservations(data.data || [])
    } catch (error) {
      console.error('Reservation fetch error:', error)
      toast.error("Failed to load reservations")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchListings = async () => {
    try {
      setIsLoading(true)
      const data = await housingService.getAllListings()
      setListings(data)
    } catch (error) {
      toast.error("Failed to load listings")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      // For providers: show all their listings regardless of status
      // For students/public: only show active and available listings
      const isProvider = user?.role === "provider"
      // Backend returns createdBy field (can be ObjectId string or populated object)
      const listingOwnerId = typeof (listing as any).createdBy === 'string' 
        ? (listing as any).createdBy 
        : (listing as any).createdBy?._id || listing.providerId
      const isOwnListing = isProvider && listingOwnerId === user?.id
      
      if (!isOwnListing) {
        // Non-provider or not their listing - only show active and available
        if (listing.status !== "active" || !listing.availability) {
          return false
        }
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          listing.location.city.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // City filter
      if (filters.city && filters.city !== "All" && listing.location.city !== filters.city) {
        return false
      }

      // Property type filter
      if (filters.propertyType && listing.propertyType !== filters.propertyType) {
        return false
      }

      // Price range filter
      if (listing.price < priceRange[0] || listing.price > priceRange[1]) {
        return false
      }

      // Amenities filter
      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every((amenity) =>
          listing.amenities.some((a) => a.toLowerCase().includes(amenity.toLowerCase()))
        )
        if (!hasAllAmenities) return false
      }

      return true
    })
  }, [listings, searchQuery, filters, priceRange, selectedAmenities, user])

  const clearFilters = () => {
    setFilters({})
    setPriceRange([0, 50000])
    setSelectedAmenities([])
  }

  const hasActiveFilters =
    filters.city || filters.propertyType || priceRange[0] > 0 || priceRange[1] < 50000 || selectedAmenities.length > 0

  // Render reservations tab for providers
  if (tab === "reservations" && user?.role === "provider") {
    return <ReservationsTab reservations={reservations} isLoading={isLoading} onRefresh={fetchReservations} />
  }

  // Render my-reservations tab for students
  if (tab === "my-reservations" && user?.role === "student") {
    return <MyReservationsTab reservations={reservations} isLoading={isLoading} onRefresh={fetchReservations} />
  }

  // Default: Render listings view
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find Housing</h1>
          <p className="text-muted-foreground mt-1">
            Browse verified accommodation near your campus
          </p>
        </div>
        {user?.role === "provider" && (
          <Button asChild>
            <Link href="/housing/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Listing
            </Link>
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location, title, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={filters.city || "All"}
            onValueChange={(value) => setFilters({ ...filters, city: value === "All" ? undefined : value })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.propertyType || "all"}
            onValueChange={(value) =>
              setFilters({ ...filters, propertyType: value === "all" ? undefined : (value as PropertyType) })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                More Filters
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Listings</SheetTitle>
                <SheetDescription>Narrow down your search with these options</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <Label>Price Range (Rs.)</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={50000}
                    step={1000}
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Rs. {priceRange[0].toLocaleString()}</span>
                    <span>Rs. {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {AMENITIES.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.id}
                          checked={selectedAmenities.includes(amenity.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAmenities([...selectedAmenities, amenity.id])
                            } else {
                              setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity.id))
                            }
                          }}
                        />
                        <label
                          htmlFor={amenity.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                        >
                          <amenity.icon className="h-4 w-4 text-muted-foreground" />
                          {amenity.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      clearFilters()
                      setFiltersOpen(false)
                    }}
                  >
                    Clear All
                  </Button>
                  <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {isLoading ? "Loading..." : `${filteredListings.length} ${filteredListings.length === 1 ? "listing" : "listings"} found`}
      </p>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <HousingCard key={listing.id || (listing as any)._id} listing={listing} />
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <Home className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No listings found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters to find more options.
            </p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

function HousingCard({ listing }: { listing: HousingListing }) {
  const { user } = useAuth()
  // Backend returns createdBy field (can be ObjectId string or populated object)
  const listingOwnerId = typeof (listing as any).createdBy === 'string' 
    ? (listing as any).createdBy 
    : (listing as any).createdBy?._id || listing.providerId
  const isOwnListing = user?.role === "provider" && listingOwnerId === user?.id
  
  // Handle both id and _id from backend
  const listingId = listing.id || (listing as any)._id
  
  const getStatusVariant = (status: ListingStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
        return "default"
      case "pending_approval":
        return "secondary"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }
  
  return (
    <Link href={`/housing/${listingId}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 group cursor-pointer h-full flex flex-col">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={listing.images[0] || "/placeholder.svg?height=400&width=600"}
            alt={listing.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <Badge className="absolute top-3 left-3 capitalize">{listing.propertyType}</Badge>
          <Badge variant="secondary" className="absolute top-3 right-3 capitalize">
            {listing.roomType}
          </Badge>
          {isOwnListing && listing.status !== "active" && (
            <Badge 
              variant={getStatusVariant(listing.status)} 
              className="absolute bottom-3 left-3 capitalize"
            >
              {listing.status.replace("_", " ")}
            </Badge>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1 text-lg">{listing.title}</CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {listing.location.city} - {listing.location.distance}km from campus
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {listing.amenities.slice(0, 4).map((amenity, index) => (
              <Badge key={`${amenity}-${index}`} variant="outline" className="text-xs flex items-center gap-1">
                {getAmenityIcon(amenity)}
                {amenity}
              </Badge>
            ))}
            {listing.amenities.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{listing.amenities.length - 4} more
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t pt-4">
          <div>
            <span className="text-xl font-bold text-primary">
              Rs. {listing.price.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
          <Button size="sm">View Details</Button>
        </CardFooter>
      </Card>
    </Link>
  )
}

// Reservations Tab Component for Providers
function ReservationsTab({ reservations, isLoading, onRefresh }: { 
  reservations: HousingReservation[], 
  isLoading: boolean,
  onRefresh: () => void 
}) {
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleResponse = async (reservationId: string, action: 'accept' | 'reject') => {
    try {
      setProcessingId(reservationId)
      const response = await fetch(`http://localhost:5000/api/housing/reservations/${reservationId}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('unimate_token')}`
        },
        body: JSON.stringify({
          responseMessage: action === 'reject' ? 'Not available at this time' : 'Approved!'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Reservation ${action}ed successfully`)
        onRefresh()
      } else {
        toast.error(data.message || `Failed to ${action} reservation`)
      }
    } catch (error) {
      console.error(`Error ${action}ing reservation:`, error)
      toast.error(`Failed to ${action} reservation`)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
        <p className="text-muted-foreground mt-1">
          Manage student reservation requests for your listings
        </p>
      </div>

      {/* Reservations List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reservations.length > 0 ? (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        {(reservation.listing as any)?.title || `Listing ${(reservation as any).listingId?.id || (reservation as any).listingId || ''}`}
                      </h3>
                      <Badge
                        variant={
                          reservation.status === "accepted"
                            ? "default"
                            : reservation.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {reservation.status}
                      </Badge>
                    </div>

                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>Move-in: {(reservation as any).moveInDate ? format(new Date((reservation as any).moveInDate), "PPP") : "Not specified"}</span>
                      </div>
                      <p><strong>Student:</strong> {reservation.studentName || (reservation as any).studentId?.name || "Unknown"}</p>
                      {reservation.message && (
                        <p><strong>Message:</strong> {reservation.message}</p>
                      )}
                    </div>
                  </div>

                  {reservation.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleResponse(reservation.id, "accept")}
                        disabled={processingId === reservation.id}
                      >
                        {processingId === reservation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleResponse(reservation.id, "reject")}
                        disabled={processingId === reservation.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No reservations yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              When students request to reserve your listings, they'll appear here.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

// My Reservations Tab Component for Students
function MyReservationsTab({ reservations, isLoading, onRefresh }: { 
  reservations: HousingReservation[], 
  isLoading: boolean,
  onRefresh: () => void 
}) {
  const handleCancelReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/housing/reservations/${reservationId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('unimate_token')}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Reservation cancelled successfully")
        onRefresh()
      } else {
        toast.error(data.message || "Failed to cancel reservation")
      }
    } catch (error) {
      console.error("Error cancelling reservation:", error)
      toast.error("Failed to cancel reservation")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500">Accepted</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Reservations</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your housing reservation requests
        </p>
      </div>

      {/* Reservations List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reservations.length > 0 ? (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        {(reservation.listing as any)?.title || `Listing ${(reservation as any).listingId?.id || (reservation as any).listingId || ''}`}
                      </h3>
                      {getStatusBadge(reservation.status)}
                    </div>

                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{(reservation.listing as any)?.location?.city || "Location not available"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>Request sent: {format(new Date(reservation.createdAt), "PPP")}</span>
                      </div>
                      {(reservation as any).moveInDate && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>Move-in: {format(new Date((reservation as any).moveInDate), "PPP")}</span>
                        </div>
                      )}
                      {reservation.message && (
                        <p className="mt-2"><strong>Your message:</strong> {reservation.message}</p>
                      )}
                      {(reservation as any).responseMessage && (
                        <div className="mt-2 p-3 bg-muted rounded-md">
                          <p className="text-sm"><strong>Provider response:</strong> {(reservation as any).responseMessage}</p>
                        </div>
                      )}
                    </div>

                    {reservation.status === "accepted" && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">✓ Reservation Accepted!</h4>
                        <p className="text-sm text-green-700">
                          Contact the provider at: {(reservation.listing as any)?.contactPhone || "Contact info not available"}
                        </p>
                      </div>
                    )}

                    {reservation.status === "rejected" && (reservation as any).responseMessage && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-red-800">Reservation Declined</h4>
                      </div>
                    )}
                  </div>

                  {reservation.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelReservation(reservation.id)}
                    >
                      Cancel Request
                    </Button>
                  )}

                  {(reservation.status === "accepted" || reservation.status === "rejected") && (
                    <Button asChild size="sm">
                      <Link href={`/housing/${(reservation.listing as any)?.id || (reservation as any).listingId}`}>
                        View Listing
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No reservations yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              When you request to reserve a listing, it will appear here.
            </p>
            <Button asChild className="mt-4">
              <Link href="/housing">Browse Listings</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
