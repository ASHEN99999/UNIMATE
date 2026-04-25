"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/context/auth-context"
import { housingService } from "@/lib/services/housing.service"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Home, MapPin, Phone, Upload } from "lucide-react"
import type { HousingListing } from "@/lib/types"

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [listing, setListing] = useState<HousingListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [propertyType, setPropertyType] = useState<"boarding" | "room" | "annex" | "apartment">("room")
  const [roomType, setRoomType] = useState<"single" | "shared" | "full-house">("single")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [distance, setDistance] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [rulesAndRegulations, setRulesAndRegulations] = useState("")
  const [amenities, setAmenities] = useState<string[]>([])

  const allAmenities = [
    "WiFi", "AC", "Parking", "Laundry", "Kitchen", "Furnished", 
    "Security", "Gym", "Pool", "Study Room", "Balcony", "TV"
  ]

  useEffect(() => {
    const listingId = params.id as string
    if (listingId) {
      fetchListing(listingId)
    }
  }, [params.id])

  const fetchListing = async (id: string) => {
    try {
      setLoading(true)
      const data = await housingService.getListingById(id)
      
      // Check if user owns this listing
      const listingOwnerId = typeof (data as any).createdBy === 'string' 
        ? (data as any).createdBy 
        : (data as any).createdBy?._id || data.providerId
      
      if (user?.id !== listingOwnerId) {
        toast.error("You don't have permission to edit this listing")
        router.push(`/housing/${id}`)
        return
      }

      setListing(data)
      
      // Pre-fill form
      setTitle(data.title)
      setDescription(data.description)
      setPrice(data.price.toString())
      setPropertyType(data.propertyType)
      setRoomType(data.roomType)
      setAddress(data.location.address)
      setCity(data.location.city)
      setDistance(data.location.distance.toString())
      setContactPhone(data.contactPhone)
      setRulesAndRegulations(data.rulesAndRegulations || "")
      setAmenities(data.amenities || [])
    } catch (error) {
      toast.error("Failed to fetch listing")
      console.error(error)
      router.push("/housing")
    } finally {
      setLoading(false)
    }
  }

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!listing) return

    if (!title || !description || !price || !address || !city || !distance || !contactPhone) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setSubmitting(true)
      const listingId = params.id as string
      
      const updateData = {
        title,
        description,
        price: parseFloat(price),
        location: {
          address,
          city,
          distance: parseFloat(distance),
        },
        propertyType,
        roomType,
        amenities,
        contactPhone,
        rulesAndRegulations,
      }

      await housingService.updateListing(listingId, updateData)
      toast.success("Listing updated successfully!")
      router.push(`/housing/${listingId}`)
    } catch (error) {
      toast.error("Failed to update listing")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Listing not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Listing
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-6 w-6" />
            Edit Housing Listing
          </CardTitle>
          <CardDescription>
            Update your housing listing details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Comfortable Single Room Near Campus"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your accommodation..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Monthly Price (Rs.) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., 25000"
                  required
                />
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Property Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select value={propertyType} onValueChange={(value: any) => setPropertyType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boarding">Boarding</SelectItem>
                      <SelectItem value="room">Room</SelectItem>
                      <SelectItem value="annex">Annex</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="roomType">Room Type *</Label>
                  <Select value={roomType} onValueChange={(value: any) => setRoomType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="shared">Shared</SelectItem>
                      <SelectItem value="full-house">Full House</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </h3>
              
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., 123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Colombo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="distance">Distance from Campus (km) *</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="e.g., 2.5"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="font-semibold">Amenities</h3>
              <div className="grid grid-cols-3 gap-3">
                {allAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={amenities.includes(amenity)}
                      onCheckedChange={() => toggleAmenity(amenity)}
                    />
                    <Label htmlFor={amenity} className="text-sm cursor-pointer">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact & Rules */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact & Rules
              </h3>
              
              <div>
                <Label htmlFor="contactPhone">Contact Phone *</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g., 0771234567"
                  required
                />
              </div>

              <div>
                <Label htmlFor="rules">Rules and Regulations (Optional)</Label>
                <Textarea
                  id="rules"
                  value={rulesAndRegulations}
                  onChange={(e) => setRulesAndRegulations(e.target.value)}
                  placeholder="e.g., No guests after 10 PM, Quiet hours from 9 PM to 7 AM"
                  rows={3}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Listing"
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
