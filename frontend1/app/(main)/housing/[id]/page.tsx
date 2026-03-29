"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { housingService } from "@/lib/services/housing.service"
import type { HousingListing } from "@/lib/types"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Calendar as CalendarIcon,
  Wifi,
  Car,
  Snowflake,
  Bath,
  Tv,
  Home,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

function getAmenityIcon(amenity: string) {
  const lowerAmenity = amenity.toLowerCase()
  if (lowerAmenity.includes("wifi")) return <Wifi className="h-5 w-5" />
  if (lowerAmenity.includes("parking")) return <Car className="h-5 w-5" />
  if (lowerAmenity.includes("ac")) return <Snowflake className="h-5 w-5" />
  if (lowerAmenity.includes("bathroom")) return <Bath className="h-5 w-5" />
  if (lowerAmenity.includes("tv")) return <Tv className="h-5 w-5" />
  return <Home className="h-5 w-5" />
}

export default function HousingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [listing, setListing] = useState<HousingListing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [reservationOpen, setReservationOpen] = useState(false)
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [duration, setDuration] = useState("12")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true)
        const data = await housingService.getListingById(id)
        setListing(data)
      } catch (error) {
        console.error("Failed to fetch listing:", error)
        toast.error("Failed to load listing details")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchListing()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Home className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Listing not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The listing you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/housing">Browse Listings</Link>
        </Button>
      </div>
    )
  }

  const handleReservation = async () => {
    if (!checkInDate) {
      toast.error("Please select a check-in date")
      return
    }

    if (!isAuthenticated) {
      toast.error("Please log in to make a reservation")
      router.push("/login")
      return
    }

    if (user?.role !== "student") {
      toast.error("Only students can make reservations")
      return
    }

    try {
      setIsSubmitting(true)
      
      await housingService.createReservation(id, {
        message,
        moveInDate: format(checkInDate, "yyyy-MM-dd")
      })

      setReservationOpen(false)
      toast.success("Reservation request sent!", {
        description: "The provider will review your request shortly.",
      })
      
      // Reset form
      setCheckInDate(undefined)
      setMessage("")
    } catch (error) {
      console.error("Reservation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create reservation")
    } finally {
      setIsSubmitting(false)
    }
  }

  const images = listing.images.length > 0 ? listing.images : ["/placeholder.svg?height=600&width=800"]

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to listings
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              <Image
                src={images[selectedImage]}
                alt={listing.title}
                fill
                className="object-cover"
              />
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      idx === selectedImage ? "bg-white" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "relative h-16 w-24 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors",
                      idx === selectedImage ? "border-primary" : "border-transparent"
                    )}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className="capitalize">{listing.propertyType}</Badge>
                <Badge variant="secondary" className="capitalize">
                  {listing.roomType}
                </Badge>
                {listing.availability && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Available
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl">{listing.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {listing.location.address}, {listing.location.city} - {listing.location.distance}km from campus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {listing.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                    >
                      {getAmenityIcon(amenity)}
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {listing.rulesAndRegulations && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Rules & Regulations</h3>
                    <p className="text-muted-foreground text-sm">{listing.rulesAndRegulations}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  Rs. {listing.price.toLocaleString()}
                </span>
                <span className="text-muted-foreground font-normal">/month</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              
              {/* Provider Info */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Listed by</h4>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{listing.providerName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {listing.contactPhone}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Reserve Button */}
              {user?.role === "student" && (
                <Dialog open={reservationOpen} onOpenChange={setReservationOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      Request Reservation
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Reservation</DialogTitle>
                      <DialogDescription>
                        Fill in the details below to send a reservation request to the provider.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Check-in Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !checkInDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={checkInDate}
                              onSelect={setCheckInDate}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>Duration (months)</Label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 3, 6, 12].map((months) => (
                              <SelectItem key={months} value={months.toString()}>
                                {months} {months === 1 ? "month" : "months"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Message to Provider (optional)</Label>
                        <Textarea
                          placeholder="Tell the provider about yourself..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                      </div>

                      <Card className="bg-muted/50">
                        <CardContent className="pt-4">
                          <div className="flex justify-between text-sm">
                            <span>Monthly Rent</span>
                            <span>Rs. {listing.price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span>Duration</span>
                            <span>{duration} months</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>Rs. {(listing.price * parseInt(duration)).toLocaleString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setReservationOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleReservation} disabled={isSubmitting}>
                        {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                        Send Request
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {!isAuthenticated && (
                <Button className="w-full" size="lg" asChild>
                  <Link href="/login">Login to Reserve</Link>
                </Button>
              )}

              {user?.role === "provider" && user.id === listing.providerId && (
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/housing/${listing.id}/edit`}>Edit Listing</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
