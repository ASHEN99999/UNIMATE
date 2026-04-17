"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { housingService } from "@/lib/services/housing.service"
import type { PropertyType, RoomType } from "@/lib/types"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Home, MapPin, Upload, X, ImageIcon } from "lucide-react"
import Link from "next/link"

const PROPERTY_TYPES = [
  { value: "boarding", label: "Boarding" },
  { value: "room", label: "Room" },
  { value: "annex", label: "Annex" },
  { value: "apartment", label: "Apartment" },
]

const ROOM_TYPES = [
  { value: "single", label: "Single Room" },
  { value: "shared", label: "Shared Room" },
  { value: "full-house", label: "Full House" },
]

const CITIES = [
  "Colombo",
  "Kandy",
  "Galle",
  "Jaffna",
  "Matara",
  "Negombo",
  "Kurunegala",
  "Ratnapura",
]

const AMENITIES = [
  { id: "wifi", label: "WiFi" },
  { id: "parking", label: "Parking" },
  { id: "ac", label: "Air Conditioning" },
  { id: "attached-bathroom", label: "Attached Bathroom" },
  { id: "tv", label: "TV" },
  { id: "kitchen", label: "Kitchen Access" },
  { id: "laundry", label: "Laundry Facilities" },
  { id: "security", label: "24/7 Security" },
  { id: "hot-water", label: "Hot Water" },
  { id: "furniture", label: "Fully Furnished" },
]

export default function NewHousingListingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    propertyType: "",
    roomType: "",
    address: "",
    city: "",
    district: "",
    distance: "",
    contactPhone: "",
    rulesAndRegulations: "",
  })
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageUrlInput, setImageUrlInput] = useState("")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    // Block non-numeric input for phone and numeric fields
    if (name === "contactPhone" && /[^0-9+\-\s()]/.test(value)) return
    if ((name === "price" || name === "distance") && /[^0-9.]/.test(value)) return
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    )
  }

  const handleImageUrlAdd = () => {
    if (imageUrlInput.trim()) {
      // Basic URL validation
      try {
        new URL(imageUrlInput)
        setImageUrls((prev) => [...prev, imageUrlInput.trim()])
        setImageUrlInput("")
        toast.success("Image URL added")
      } catch {
        toast.error("Please enter a valid image URL")
      }
    }
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate file types
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    setImageFiles((prev) => [...prev, ...validFiles])
    toast.success(`${validFiles.length} image(s) added`)
  }

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
    toast.success("Image removed")
  }

  const removeImageFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    toast.success("Image removed")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title || !formData.description || !formData.price) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!formData.propertyType || !formData.roomType) {
      toast.error("Please select property type and room type")
      return
    }

    if (!formData.address || !formData.city) {
      toast.error("Please provide location details")
      return
    }

    if (!formData.contactPhone) {
      toast.error("Please provide contact phone number")
      return
    }
    if (!/^[0-9+\-\s()]{7,15}$/.test(formData.contactPhone.trim())) {
      toast.error("Please enter a valid phone number (digits only, 7–15 characters)")
      return
    }
    const priceNum = parseFloat(formData.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Monthly rent must be a positive number")
      return
    }
    if (formData.title.trim().length < 5) {
      toast.error("Title must be at least 5 characters")
      return
    }
    if (formData.description.trim().length < 20) {
      toast.error("Description must be at least 20 characters")
      return
    }

    try {
      setIsLoading(true)

      const listingData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        propertyType: formData.propertyType as PropertyType,
        roomType: formData.roomType as RoomType,
        location: {
          address: formData.address,
          city: formData.city,
          district: formData.district || formData.city,
          distance: parseFloat(formData.distance) || 0,
        },
        amenities: selectedAmenities,
        contactPhone: formData.contactPhone,
        rulesAndRegulations: formData.rulesAndRegulations || undefined,
        images: [...imageUrls, ...imagePreviews], // Combine URL images and uploaded file previews
      }

      await housingService.createListing(listingData)
      toast.success("Listing created successfully! Awaiting admin approval.")
      router.push("/housing")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create listing")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user is a provider
  if (!user || user.role !== "provider") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Only providers can create housing listings.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user.isApproved) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Your provider account must be approved before you can create listings.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/housing">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Home className="h-8 w-8" />
          Create Housing Listing
        </h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details below to create anew housing listing. Your listing will be reviewed by admin before going live.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Provide the main details about your property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Listing Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Comfortable Single Room Near Campus"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your property, its features, and what makes it special..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => handleSelectChange("propertyType", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomType">Room Type *</Label>
                  <Select
                    value={formData.roomType}
                    onValueChange={(value) => handleSelectChange("roomType", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Monthly Rent (Rs.) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="e.g., 15000"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="100"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </CardTitle>
              <CardDescription>Help students find your property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="e.g., 123 University Road"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => handleSelectChange("city", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District (Optional)</Label>
                  <Input
                    id="district"
                    name="district"
                    placeholder="e.g., Colombo"
                    value={formData.district}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="distance">Distance from Campus (km)</Label>
                <Input
                  id="distance"
                  name="distance"
                  type="number"
                  placeholder="e.g., 0.5"
                  value={formData.distance}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>Select all amenities available</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {AMENITIES.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity.id}
                      checked={selectedAmenities.includes(amenity.id)}
                      onCheckedChange={() => toggleAmenity(amenity.id)}
                    />
                    <Label
                      htmlFor={amenity.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Property Images
              </CardTitle>
              <CardDescription>Add photos to showcase your property (recommended: 3-5 images)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="image-upload">Upload Images</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFileChange}
                    className="cursor-pointer"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload multiple images (max 5MB each, JPG, PNG, or WebP)
                </p>
              </div>

              {/* Image URL Input */}
              <div className="space-y-2">
                <Label htmlFor="image-url">Or Add Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleImageUrlAdd()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleImageUrlAdd}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Image Previews */}
              {(imagePreviews.length > 0 || imageUrls.length > 0) && (
                <div className="space-y-2">
                  <Label>Added Images ({imagePreviews.length + imageUrls.length})</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* URL Images */}
                    {imageUrls.map((url, index) => (
                      <div key={`url-${index}`} className="relative group aspect-video rounded-lg overflow-hidden border">
                        <Image
                          src={url}
                          alt={`Property ${index + 1}`}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImageUrl(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {/* File Upload Previews */}
                    {imagePreviews.map((preview, index) => (
                      <div key={`file-${index}`} className="relative group aspect-video rounded-lg overflow-hidden border">
                        <Image
                          src={preview}
                          alt={`Property ${imageUrls.length + index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImageFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                          {imageFiles[index]?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(imagePreviews.length === 0 && imageUrls.length === 0) && (
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No images added yet</p>
                  <p className="text-xs mt-1">Upload files or add image URLs above</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact & Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Contact & Rules</CardTitle>
              <CardDescription>How students can reach you and house rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone Number *</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  placeholder="e.g., 0771234567"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  maxLength={15}
                  required
                />
                <p className="text-xs text-muted-foreground">Digits only — no letters allowed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rulesAndRegulations">Rules & Regulations (Optional)</Label>
                <Textarea
                  id="rulesAndRegulations"
                  name="rulesAndRegulations"
                  placeholder="e.g., No smoking, Quiet hours after 10 PM, etc."
                  value={formData.rulesAndRegulations}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Listing"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
