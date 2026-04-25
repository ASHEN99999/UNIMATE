"use client"

import { useState } from "react"
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
import { ArrowLeft, Upload, X } from "lucide-react"
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

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ItemCategory | "">("")
  const [condition, setCondition] = useState<ItemCondition | "">("")
  const [price, setPrice] = useState("")
  const [location, setLocation] = useState("")
  const [contactPhone, setContactPhone] = useState(user?.contactPhone || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newItem: SecondHandItem = {
      id: `item_${Date.now()}`,
      title,
      description,
      category: category as ItemCategory,
      condition: condition as ItemCondition,
      price: parseInt(price),
      images: ["/placeholder.svg?height=400&width=400"],
      sellerId: user.id,
      sellerName: user.name,
      sellerContact: contactPhone,
      location,
      status: "available",
      views: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const stored = JSON.parse(localStorage.getItem("unimate_marketplace_items") || "[]")
    stored.push(newItem)
    localStorage.setItem("unimate_marketplace_items", JSON.stringify(stored))

    setIsSubmitting(false)
    toast.success("Item listed successfully!", {
      description: "Your item is now visible to other students.",
    })
    router.push("/marketplace?tab=my-listings")
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
              <Label>Photos</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag and drop images or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (Image upload will be available with storage integration)
                </p>
              </div>
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
