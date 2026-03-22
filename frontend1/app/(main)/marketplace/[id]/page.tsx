"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { mockSecondHandItems } from "@/lib/mock-data"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"
import type { SecondHandItem } from "@/lib/types"
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"

const conditionColors = {
  "Like New": "bg-green-500/10 text-green-600 border-green-200",
  "Good": "bg-blue-500/10 text-blue-600 border-blue-200",
  "Fair": "bg-amber-500/10 text-amber-600 border-amber-200",
  "Poor": "bg-red-500/10 text-red-600 border-red-200",
}

const statusConfig = {
  available: {
    label: "Available",
    color: "bg-green-500/10 text-green-600 border-green-200",
    icon: CheckCircle,
  },
  reserved: {
    label: "Reserved",
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    icon: Clock,
  },
  sold: {
    label: "Sold",
    color: "bg-muted text-muted-foreground border-muted",
    icon: AlertCircle,
  },
}

export default function MarketplaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [item, setItem] = useState<SecondHandItem | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false)
  const [contactPhone, setContactPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check localStorage first, then mock data
    const stored = JSON.parse(localStorage.getItem("unimate_marketplace_items") || "[]")
    const found = stored.find((i: SecondHandItem) => i.id === id) || mockSecondHandItems.find((i) => i.id === id)
    
    if (found) {
      // Increment view count
      const updatedItem = { ...found, views: (found.views || 0) + 1 }
      setItem(updatedItem)
      
      // Update in localStorage if it exists there
      const storedIndex = stored.findIndex((i: SecondHandItem) => i.id === id)
      if (storedIndex !== -1) {
        stored[storedIndex] = updatedItem
        localStorage.setItem("unimate_marketplace_items", JSON.stringify(stored))
      }
    }
  }, [id])

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Item not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The item you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/marketplace">Browse Items</Link>
        </Button>
      </div>
    )
  }

  const handleReserve = async () => {
    if (!user || !contactPhone) {
      toast.error("Please provide your contact number")
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update item status
    const reservationExpiry = new Date()
    reservationExpiry.setHours(reservationExpiry.getHours() + 48)

    const updatedItem: SecondHandItem = {
      ...item,
      status: "reserved",
      buyerId: user.id,
      buyerName: user.name,
      buyerContact: contactPhone,
      reservationExpiry: reservationExpiry.toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Update localStorage
    const stored = JSON.parse(localStorage.getItem("unimate_marketplace_items") || "[]")
    const storedIndex = stored.findIndex((i: SecondHandItem) => i.id === id)
    if (storedIndex !== -1) {
      stored[storedIndex] = updatedItem
    } else {
      stored.push(updatedItem)
    }
    localStorage.setItem("unimate_marketplace_items", JSON.stringify(stored))

    setItem(updatedItem)
    setIsSubmitting(false)
    setReserveDialogOpen(false)

    toast.success("Item reserved!", {
      description: "You have 48 hours to complete the purchase. Contact the seller to arrange pickup.",
    })
  }

  const images = item.images.length > 0 ? item.images : ["/placeholder.svg?height=600&width=600"]
  const isOwner = user?.id === item.sellerId
  const status = statusConfig[item.status]
  const StatusIcon = status.icon

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to marketplace
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="relative aspect-square bg-muted">
              <Image
                src={images[selectedImage]}
                alt={item.title}
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
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors",
                      idx === selectedImage ? "border-[oklch(0.50_0.15_145)]" : "border-transparent"
                    )}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge>{item.category}</Badge>
                <Badge variant="outline" className={conditionColors[item.condition]}>
                  {item.condition}
                </Badge>
                <Badge variant="outline" className={status.color}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{item.title}</CardTitle>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {item.location}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {item.views} views
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Posted {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[oklch(0.50_0.15_145)]">
                  Rs. {item.price.toLocaleString()}
                </span>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>

              <Separator />

              {/* Seller Info */}
              <div>
                <h3 className="font-semibold mb-3">Seller Information</h3>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-[oklch(0.50_0.15_145)]/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-[oklch(0.50_0.15_145)]" />
                  </div>
                  <div>
                    <p className="font-medium">{item.sellerName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {item.sellerContact}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reserved Info */}
              {item.status === "reserved" && item.reservationExpiry && (
                <>
                  <Separator />
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-700 mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold">Reserved</span>
                    </div>
                    {isOwner ? (
                      <p className="text-sm text-amber-700">
                        Reserved by {item.buyerName} ({item.buyerContact}).
                        Reservation expires {new Date(item.reservationExpiry).toLocaleString()}.
                      </p>
                    ) : item.buyerId === user?.id ? (
                      <p className="text-sm text-amber-700">
                        You have reserved this item. Contact the seller to complete the purchase.
                        Reservation expires {new Date(item.reservationExpiry).toLocaleString()}.
                      </p>
                    ) : (
                      <p className="text-sm text-amber-700">
                        This item is currently reserved by another buyer.
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {item.status === "available" && !isOwner && (
                  <>
                    {isAuthenticated ? (
                      <Dialog open={reserveDialogOpen} onOpenChange={setReserveDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="flex-1 bg-[oklch(0.50_0.15_145)] hover:bg-[oklch(0.45_0.15_145)]">
                            Reserve Item
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reserve Item</DialogTitle>
                            <DialogDescription>
                              Reserve this item for 48 hours while you arrange pickup with the seller.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Card className="bg-muted/50">
                              <CardContent className="flex items-center gap-4 p-4">
                                <div className="relative h-16 w-16 rounded-md overflow-hidden">
                                  <Image
                                    src={images[0]}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{item.title}</p>
                                  <p className="text-lg font-bold text-[oklch(0.50_0.15_145)]">
                                    Rs. {item.price.toLocaleString()}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>

                            <div className="space-y-2">
                              <Label>Your Contact Number</Label>
                              <Input
                                type="tel"
                                placeholder="Enter your phone number"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground">
                                The seller will contact you on this number
                              </p>
                            </div>

                            <div className="p-3 rounded-lg bg-amber-500/10 text-sm text-amber-700">
                              <p className="font-medium mb-1">Important:</p>
                              <ul className="list-disc list-inside space-y-1">
                                <li>Reservation expires in 48 hours</li>
                                <li>Contact the seller to arrange pickup</li>
                                <li>Payment is made directly to the seller</li>
                              </ul>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setReserveDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handleReserve}
                              disabled={isSubmitting || !contactPhone}
                              className="bg-[oklch(0.50_0.15_145)] hover:bg-[oklch(0.45_0.15_145)]"
                            >
                              {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                              Confirm Reservation
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button className="flex-1" asChild>
                        <Link href="/login">Login to Reserve</Link>
                      </Button>
                    )}
                  </>
                )}

                {isOwner && (
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/marketplace/${item.id}/edit`}>Edit Listing</Link>
                  </Button>
                )}

                <Button variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Seller
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
