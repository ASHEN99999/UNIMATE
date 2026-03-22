"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { HousingListing, HousingFilters, PropertyType } from "@/lib/types"
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
} from "lucide-react"
import { useAuth } from "@/context/auth-context"

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
  const [listings, setListings] = useState<HousingListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<HousingFilters>({})
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    fetchListings()
  }, [])

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
      // Only show active and available listings
      if (listing.status !== "active" || !listing.availability) {
        return false
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
  }, [listings, searchQuery, filters, priceRange, selectedAmenities])

  const clearFilters = () => {
    setFilters({})
    setPriceRange([0, 50000])
    setSelectedAmenities([])
  }

  const hasActiveFilters =
    filters.city || filters.propertyType || priceRange[0] > 0 || priceRange[1] < 50000 || selectedAmenities.length > 0

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
            <HousingCard key={listing.id} listing={listing} />
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
  return (
    <Link href={`/housing/${listing.id}`}>
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
            {listing.amenities.slice(0, 4).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs flex items-center gap-1">
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
