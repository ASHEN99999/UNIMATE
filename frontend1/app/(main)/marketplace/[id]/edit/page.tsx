"use client"

import { useState, useEffect, use, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import type { ItemCategory, ItemCondition, SecondHandItem } from "@/lib/types"
import { ArrowLeft, Upload, X, Plus } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

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

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [item, setItem] = useState<SecondHandItem | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ItemCategory | "">("")
  const [condition, setCondition] = useState<ItemCondition | "">("")
  const [price, setPrice] = useState("")
  const [location, setLocation] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("unimate_marketplace_items") || "[]")
    const found = stored.find((i: SecondHandItem) => i.id === id)
    
    if (found) {
      setItem(found)
      setTitle(found.title)
      setDescription(found.description)
      setCategory(found.category)
      setCondition(found.condition)
      setPrice(found.price.toString())
      setLocation(found.location)
      setContactPhone(found.sellerContact)
      setImages(found.images)
    }
    setIsLoading(false)
  }, [id])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      processFiles(Array.from(files))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      toast.error("Please select image files only")
      return
    }

    if (images.length + imageFiles.length > 5) {
      toast.error("Maximum 5 images allowed")
      return
    }

    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setImages(prev => [...prev, base64])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error("Please log in to edit items")
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

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedItem: SecondHandItem = {
      ...item!,
      title,
      description,
      category: category as ItemCategory,
      condition: condition as ItemCondition,
      price: parseInt(price),
      images: images.length > 0 ? images : ["/placeholder.svg?height=400&width=400"],
      sellerContact: contactPhone,
      location,
      updatedAt: new Date().toISOString(),
    }

    const stored = JSON.parse(localStorage.getItem("unimate_marketplace_items") || "[]")
    const index = stored.findIndex((i: SecondHandItem) => i.id === id)
    if (index !== -1) {
      stored[index] = updatedItem
      localStorage.setItem("unimate_marketplace_items", JSON.stringify(stored))
    }

    setIsSubmitting(false)
    toast.success("Item updated successfully!", {
      description: "Your listing has been updated.",
    })
    router.push(`/marketplace/${id}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-lg font-semibold">Item not found</h2>
        <Button className="mt-4" asChild>
          <Link href="/marketplace">Browse Items</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to item
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Listing</CardTitle>
          <CardDescription>
            Update your item listing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="space-y-2">
              <Label>Photos</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <Image
                        src={image}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center hover:bg-muted/50 transition-colors"
                    >
                      <Plus className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Add More</span>
                    </button>
                  )}
                </div>
              )}
              
              {images.length === 0 && (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag and drop images or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum 5 images (PNG, JPG, GIF)
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" asChild>
                <Link href={`/marketplace/${id}`}>Cancel</Link>
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[oklch(0.50_0.15_145)] hover:bg-[oklch(0.45_0.15_145)]"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
