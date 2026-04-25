"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/context/auth-context"
import { secondhandService } from "@/lib/services/secondhand.service"
import type { ItemCategory, ItemCondition, SecondHandItem } from "@/lib/types"
import { ArrowLeft, Upload, X, Trash2 } from "lucide-react"
import { toast } from "sonner"

const CATEGORIES: ItemCategory[] = [
  "Electronics",
  "Books & Notes",
  "Furniture",
  "Clothing",
  "Sports Equipment",
  "Household Items",
  "Stationery",
  "Other",
]

const CONDITIONS: { value: ItemCondition; label: string; description: string }[] = [
  { value: "Like New", label: "Like New", description: "Barely used, excellent condition" },
  { value: "Good", label: "Good", description: "Minor signs of use, fully functional" },
  { value: "Fair", label: "Fair", description: "Some wear and tear, works well" },
  { value: "Poor", label: "Poor", description: "Heavy use, may have issues" },
]

export default function SellItemPage() {
  const router = useRouter()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ItemCategory | "">("")
  const [condition, setCondition] = useState<ItemCondition | "">("")
  const [price, setPrice] = useState("")
  const [location, setLocation] = useState("")
  const [contactPhone, setContactPhone] = useState(user?.contactPhone || "")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  // Handle image file selection
  const handleImageSelect = async (files: FileList) => {
    if (!files.length) return

    setIsUploadingImages(true)
    const newImages: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`File ${file.name} is not an image`)
          continue
        }

        // Validate file size (max 5MB per image)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} exceeds 5MB limit`)
          continue
        }

        // Convert to base64
        const reader = new FileReader()
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string
            resolve(result)
          }
          reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`))
        })

        reader.readAsDataURL(file)
        const base64 = await base64Promise
        newImages.push(base64)

        // Limit to 5 images
        if (images.length + newImages.length >= 5) break
      }

      setImages((prev) => [...prev, ...newImages].slice(0, 5))

      if (newImages.length > 0) {
        toast.success(`${newImages.length} image(s) added`)
      }
    } catch (error) {
      toast.error("Failed to process images")
      console.error(error)
    } finally {
      setIsUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.add("bg-blue-50")
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove("bg-blue-50")
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove("bg-blue-50")
    handleImageSelect(e.dataTransfer.files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error("Please log in to sell items")
      return
    }

    if (!title || !description || !category || !condition || !price || !location || !contactPhone) {
      toast.error("Please fill in all required fields")
      return
    }
    if (title.trim().length < 5) {
      toast.error("Title must be at least 5 characters")
      return
    }
    if (description.trim().length < 10) {
      toast.error("Description must be at least 10 characters")
      return
    }
    const priceNum = parseInt(price)
    if (isNaN(priceNum) || priceNum < 1) {
      toast.error("Price must be a positive number")
      return
    }
    if (!/^[0-9+\-\s()]{7,15}$/.test(contactPhone.trim())) {
      toast.error("Phone number must be 7–15 digits — no letters allowed")
      return
    }

    if (images.length === 0) {
      toast.error("Please add at least one image")
      return
    }

    setIsSubmitting(true)

    try {
      const itemData = {
        title,
        description,
        category: category as any,
        condition: condition as any,
        price: parseInt(price),
        images,
        sellerLocation: location,
        sellerContact: contactPhone,
        sellerName: user.name, // Also send name if frontend knows it
      }

      // Send to backend API via service
      const response = await secondhandService.createItem(itemData as any)

      toast.success("Item listed successfully!", {
        description: "Your item is now visible to other students.",
      })
      router.push("/marketplace?tab=my-listings")
    } catch (error: any) {
      console.error("Error creating listing:", error)
      toast.error(error.message || "Failed to create listing")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to marketplace
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Sell an Item</CardTitle>
          <CardDescription>
            List your item for sale to the campus community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., iPhone 13 - Excellent Condition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your item in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Category and Condition */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as ItemCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Condition *</Label>
                <Select value={condition} onValueChange={(v) => setCondition(v as ItemCondition)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((cond) => (
                      <SelectItem key={cond.value} value={cond.value}>
                        <div>
                          <span className="font-medium">{cond.label}</span>
                          <span className="text-muted-foreground text-xs ml-2">
                            - {cond.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (Rs.) *</Label>
              <Input
                id="price"
                type="number"
                min="1"
                placeholder="Enter your asking price"
                value={price}
                onChange={(e) => {
                  const v = e.target.value
                  if (/[^0-9]/.test(v)) return
                  setPrice(v)
                }}
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Pickup Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Engineering Faculty, Colombo Campus"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number *</Label>
              <Input
                id="contact"
                type="tel"
                placeholder="e.g., 0771234567"
                value={contactPhone}
                onChange={(e) => {
                  const v = e.target.value
                  if (/[a-zA-Z]/.test(v)) return
                  setContactPhone(v)
                }}
                maxLength={15}
                required
              />
              <p className="text-xs text-muted-foreground">Digits only — no letters allowed</p>
            </div>

            {/* Image Upload Placeholder */}
            <div className="space-y-2">
              <Label>Photos (Max 5 images)</Label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageSelect(e.currentTarget.files!)}
                className="hidden"
              />
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-blue-400 hover:bg-blue-50"
              >
                <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag and drop images or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, JPEG up to 5MB each
                </p>
              </div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <p className="text-xs text-muted-foreground mt-1 text-center">
                        Image {index + 1} of {images.length}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {isUploadingImages && (
                <div className="flex items-center justify-center py-4">
                  <Spinner className="h-5 w-5 mr-2" />
                  <span className="text-sm text-muted-foreground">Processing images...</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" asChild>
                <Link href="/marketplace">Cancel</Link>
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[oklch(0.50_0.15_145)] hover:bg-[oklch(0.45_0.15_145)]"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                List Item
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
