"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import type { SecondHandItem, ItemCategory, ItemCondition, MarketplaceFilters, ItemBid } from "@/lib/types"
import { toast } from "sonner"
import {
  ShoppingBag,
  Search,
  SlidersHorizontal,
  X,
  Plus,
  MapPin,
  Eye,
  Clock,
  Package,
  TrendingUp,
  Tag,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  XCircle,
  DollarSign,
} from "lucide-react"
import { CartDrawer } from "@/components/cart-drawer"
import { useCart } from "@/context/cart-context"

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

const CONDITIONS: ItemCondition[] = ["Like New", "Good", "Fair", "Poor"]

const conditionColors = {
  "Like New": "bg-green-500/10 text-green-600 border-green-200",
  "Good": "bg-blue-500/10 text-blue-600 border-blue-200",
  "Fair": "bg-amber-500/10 text-amber-600 border-amber-200",
  "Poor": "bg-red-500/10 text-red-600 border-red-200",
}

const statusColors = {
  available: "bg-green-500/10 text-green-600 border-green-200",
  reserved: "bg-amber-500/10 text-amber-600 border-amber-200",
  sold: "bg-muted text-muted-foreground border-muted",
}

export default function MarketplacePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("browse")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<MarketplaceFilters>({})
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [items, setItems] = useState<SecondHandItem[]>([])

  useEffect(() => {
    // Load items from localStorage
    const stored = JSON.parse(localStorage.getItem("unimate_marketplace_items") || "[]")
    setItems(stored)
  }, [])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.isActive || item.status === "sold") return false

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Category filter
      if (filters.category && item.category !== filters.category) return false

      // Condition filter
      if (filters.condition && item.condition !== filters.condition) return false

      // Price range
      if (item.price < priceRange[0] || item.price > priceRange[1]) return false

      return true
    })
  }, [items, searchQuery, filters, priceRange])

  const myListings = items.filter((item) => item.sellerId === user?.id)

  const sellerStats = useMemo(() => {
    const listings = myListings
    return {
      total: listings.length,
      available: listings.filter((i) => i.status === "available").length,
      reserved: listings.filter((i) => i.status === "reserved").length,
      sold: listings.filter((i) => i.status === "sold").length,
      totalViews: listings.reduce((acc, i) => acc + i.views, 0),
      revenue: listings
        .filter((i) => i.status === "sold")
        .reduce((acc, i) => acc + i.price, 0),
    }
  }, [myListings])

  const clearFilters = () => {
    setFilters({})
    setPriceRange([0, 100000])
  }

  const hasActiveFilters = filters.category || filters.condition || priceRange[0] > 0 || priceRange[1] < 100000

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Buy and sell second-hand items within your campus community
          </p>
        </div>
        <div className="flex gap-2">
          <CartDrawer />
          <Button asChild className="bg-[oklch(0.50_0.15_145)] hover:bg-[oklch(0.45_0.15_145)]">
            <Link href="/marketplace/new">
              <Plus className="mr-2 h-4 w-4" />
              Sell Item
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse Items
          </TabsTrigger>
          <TabsTrigger value="my-listings">
            <Package className="mr-2 h-4 w-4" />
            My Listings
            {myListings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {myListings.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6 space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select
                value={filters.category || "all"}
                onValueChange={(v) =>
                  setFilters({ ...filters, category: v === "all" ? undefined : (v as ItemCategory) })
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.condition || "all"}
                onValueChange={(v) =>
                  setFilters({ ...filters, condition: v === "all" ? undefined : (v as ItemCondition) })
                }
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {CONDITIONS.map((cond) => (
                    <SelectItem key={cond} value={cond}>
                      {cond}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Price
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[oklch(0.50_0.15_145)]" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Items</SheetTitle>
                    <SheetDescription>Set your price range</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="space-y-3">
                      <Label>Price Range (Rs.)</Label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={100000}
                        step={500}
                      />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Rs. {priceRange[0].toLocaleString()}</span>
                        <span>Rs. {priceRange[1].toLocaleString()}</span>
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
                        Clear
                      </Button>
                      <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
                        Apply
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

          {/* Results */}
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
          </p>

          {filteredItems.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item) => (
                <ItemCard 
                  key={item.id} 
                  item={item} 
                  isOwner={item.sellerId === user?.id}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No items found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search or filters.
                </p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-listings" className="mt-6 space-y-6">
          {/* Seller Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.50_0.15_145)]/10">
                  <Package className="h-6 w-6 text-[oklch(0.50_0.15_145)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{sellerStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                  <Tag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{sellerStats.available}</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{sellerStats.reserved}</p>
                  <p className="text-sm text-muted-foreground">Reserved</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Rs. {sellerStats.revenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {myListings.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myListings.map((item) => (
                <ItemCard key={item.id} item={item} isOwner />
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No listings yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start selling items you no longer need.
                </p>
                <Button asChild className="mt-4 bg-[oklch(0.50_0.15_145)] hover:bg-[oklch(0.45_0.15_145)]">
                  <Link href="/marketplace/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Sell Item
                  </Link>
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ItemCard({ item, isOwner = false }: { item: SecondHandItem; isOwner?: boolean }) {
  const { addToCart, removeFromCart, isInCart } = useCart()
  const { user } = useAuth()
  const inCart = isInCart(item.id)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [bidOpen, setBidOpen] = useState(false)
  const [bidAmount, setBidAmount] = useState("")
  const [bidMessage, setBidMessage] = useState("")
  const [isSubmittingBid, setIsSubmittingBid] = useState(false)

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex(0)
    setPreviewOpen(true)
  }

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % item.images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length)
  }

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error("Please log in to place a bid")
      return
    }

    const amount = parseInt(bidAmount)
    if (isNaN(amount) || amount < 1) {
      toast.error("Please enter a valid bid amount")
      return
    }

    if (amount >= item.price) {
      toast.error("Bid must be lower than the listed price")
      return
    }

    setIsSubmittingBid(true)

    const newBid: ItemBid = {
      id: `bid_${Date.now()}`,
      itemId: item.id,
      bidderId: user.id,
      bidderName: user.name,
      bidderContact: user.contactPhone || "",
      amount,
      message: bidMessage,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store bids in localStorage
    const bids = JSON.parse(localStorage.getItem("unimate_marketplace_bids") || "[]")
    bids.push(newBid)
    localStorage.setItem("unimate_marketplace_bids", JSON.stringify(bids))

    setIsSubmittingBid(false)
    setBidOpen(false)
    setBidAmount("")
    setBidMessage("")
    toast.success("Bid submitted successfully!", {
      description: `Your offer of Rs. ${amount.toLocaleString()} has been sent to the seller.`,
    })
  }

  return (
    <>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{item.title}</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <Image
              src={item.images[currentImageIndex] || "/placeholder.svg?height=600&width=800"}
              alt={`${item.title} - Image ${currentImageIndex + 1}`}
              fill
              className="object-contain"
            />
            {item.images.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute left-2 top-1/2 -translate-y-1/2"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {item.images.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setCurrentImageIndex(idx)
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Image {currentImageIndex + 1} of {item.images.length}</span>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={bidOpen} onOpenChange={setBidOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBid} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bidAmount">Your Offer (Rs.)</Label>
              <Input
                id="bidAmount"
                type="number"
                min="1"
                max={item.price - 1}
                placeholder={`Enter amount less than Rs. ${item.price.toLocaleString()}`}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Listed price: Rs. {item.price.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bidMessage">Message (Optional)</Label>
              <Textarea
                id="bidMessage"
                placeholder="Add a message to the seller..."
                value={bidMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBidMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setBidOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[oklch(0.50_0.15_145)] hover:bg-[oklch(0.45_0.15_145)]"
                disabled={isSubmittingBid}
              >
                {isSubmittingBid ? "Submitting..." : "Submit Offer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-[oklch(0.50_0.15_145)]/50 group h-full flex flex-col">
        <Link href={`/marketplace/${item.id}`} className="flex-1 flex flex-col">
          <div className="relative aspect-square overflow-hidden bg-muted cursor-pointer" onClick={handleImageClick}>
            <Image
              src={item.images[0] || "/placeholder.svg?height=400&width=400"}
              alt={item.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ZoomIn className="h-8 w-8 text-white" />
            </div>
            <Badge className="absolute top-3 left-3">{item.category}</Badge>
            <Badge
              variant="outline"
              className={`absolute top-3 right-3 ${statusColors[item.status]}`}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
            {item.images.length > 1 && (
              <Badge variant="secondary" className="absolute bottom-3 left-3">
                {item.images.length} photos
              </Badge>
            )}
          </div>
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1 text-base">{item.title}</CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {item.location}
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={conditionColors[item.condition]}>
              {item.condition}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              {item.views}
            </span>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex items-center justify-between border-t pt-4 gap-2">
        <span className="text-xl font-bold text-[oklch(0.50_0.15_145)]">
          Rs. {item.price.toLocaleString()}
        </span>
        {!isOwner && item.status === "available" ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={inCart ? "secondary" : "outline"}
              onClick={(e) => {
                e.preventDefault()
                inCart ? removeFromCart(item.id) : addToCart(item)
              }}
            >
              <ShoppingCart className="mr-1 h-3 w-3" />
              {inCart ? "Remove" : "Add"}
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                setBidOpen(true)
              }}
              className="bg-[oklch(0.50_0.15_145)] hover:bg-[oklch(0.45_0.15_145)]"
            >
              <DollarSign className="mr-1 h-3 w-3" />
              Offer
            </Button>
          </div>
        ) : (
          <Link href={`/marketplace/${item.id}`}>
            <Button size="sm" variant="outline">
              {isOwner ? "Manage" : "View"}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
    </>
  )
}
