"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { mockFoodRequests, generateOrderNumber } from "@/lib/mock-data"
import { useAuth } from "@/context/auth-context"
import type { MealType, FoodItem, FoodRequest, FoodRequestStatus } from "@/lib/types"
import {
  Utensils,
  Plus,
  Minus,
  MapPin,
  Clock,
  Phone,
  User,
  Package,
  HandHelping,
  CheckCircle,
  AlertCircle,
  Truck,
} from "lucide-react"
import { toast } from "sonner"

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"]

const DELIVERY_LOCATIONS = [
  { type: "Hostel", placeholder: "Block and Room number" },
  { type: "Study Room", placeholder: "Building and room details" },
  { type: "Library", placeholder: "Floor and section" },
  { type: "Cafeteria", placeholder: "Table or area" },
  { type: "Other", placeholder: "Describe the location" },
]

const statusConfig = {
  pending: { label: "Pending", color: "bg-amber-500/10 text-amber-600 border-amber-200", icon: Clock },
  accepted: { label: "Accepted", color: "bg-blue-500/10 text-blue-600 border-blue-200", icon: CheckCircle },
  purchased: { label: "Purchased", color: "bg-purple-500/10 text-purple-600 border-purple-200", icon: Package },
  delivering: { label: "Delivering", color: "bg-cyan-500/10 text-cyan-600 border-cyan-200", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-500/10 text-green-600 border-green-200", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-muted text-muted-foreground border-muted", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-600 border-red-200", icon: AlertCircle },
}

export default function FoodPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("requests")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [requests, setRequests] = useState<FoodRequest[]>([])

  // Form state
  const [mealType, setMealType] = useState<MealType>("Lunch")
  const [foodItems, setFoodItems] = useState<FoodItem[]>([{ item: "", quantity: 1 }])
  const [locationType, setLocationType] = useState("")
  const [locationDetails, setLocationDetails] = useState("")
  const [requiredTime, setRequiredTime] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Load requests from localStorage + mock data
    const stored = JSON.parse(localStorage.getItem("unimate_food_requests") || "[]")
    setRequests([...stored, ...mockFoodRequests])
  }, [])

  const myRequests = requests.filter((r) => r.requesterId === user?.id)
  const availableRequests = requests.filter(
    (r) => r.status === "pending" && r.requesterId !== user?.id
  )

  const addFoodItem = () => {
    setFoodItems([...foodItems, { item: "", quantity: 1 }])
  }

  const removeFoodItem = (index: number) => {
    if (foodItems.length > 1) {
      setFoodItems(foodItems.filter((_, i) => i !== index))
    }
  }

  const updateFoodItem = (index: number, field: keyof FoodItem, value: string | number) => {
    setFoodItems(
      foodItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  const handleCreateRequest = async () => {
    if (!user) return
    
    const validItems = foodItems.filter((item) => item.item.trim() !== "")
    if (validItems.length === 0) {
      toast.error("Please add at least one food item")
      return
    }
    if (!locationType || !locationDetails) {
      toast.error("Please specify delivery location")
      return
    }
    if (!requiredTime) {
      toast.error("Please specify when you need the food")
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newRequest: FoodRequest = {
      id: `food_${Date.now()}`,
      requestNumber: generateOrderNumber("FOOD"),
      requesterId: user.id,
      requesterName: user.name,
      requesterContact: user.contactPhone || "",
      mealType,
      foodItems: validItems,
      deliveryLocation: {
        type: locationType,
        details: locationDetails,
      },
      requiredTime: new Date(requiredTime).toISOString(),
      status: "pending",
      paymentStatus: "pending",
      specialInstructions,
      createdAt: new Date().toISOString(),
    }

    const stored = JSON.parse(localStorage.getItem("unimate_food_requests") || "[]")
    stored.push(newRequest)
    localStorage.setItem("unimate_food_requests", JSON.stringify(stored))
    setRequests([newRequest, ...requests])

    // Reset form
    setMealType("Lunch")
    setFoodItems([{ item: "", quantity: 1 }])
    setLocationType("")
    setLocationDetails("")
    setRequiredTime("")
    setSpecialInstructions("")
    setIsSubmitting(false)
    setCreateDialogOpen(false)

    toast.success("Request created!", {
      description: "A fellow student will help you soon.",
    })
  }

  const handleAcceptRequest = async (requestId: string) => {
    if (!user) return

    const stored = JSON.parse(localStorage.getItem("unimate_food_requests") || "[]")
    const updatedStored = stored.map((r: FoodRequest) =>
      r.id === requestId
        ? { ...r, status: "accepted", helperId: user.id, helperName: user.name, helperContact: user.contactPhone }
        : r
    )
    localStorage.setItem("unimate_food_requests", JSON.stringify(updatedStored))

    setRequests(
      requests.map((r) =>
        r.id === requestId
          ? { ...r, status: "accepted" as FoodRequestStatus, helperId: user.id, helperName: user.name, helperContact: user.contactPhone }
          : r
      )
    )

    toast.success("Request accepted!", {
      description: "Contact the requester to coordinate delivery.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Food Assistance</h1>
          <p className="text-muted-foreground mt-1">
            Help fellow students get meals or request food assistance
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[oklch(0.60_0.18_40)] hover:bg-[oklch(0.55_0.18_40)]">
              <Plus className="mr-2 h-4 w-4" />
              Request Food
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Request Food Assistance</DialogTitle>
              <DialogDescription>
                A fellow student will help you get your food and deliver it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Meal Type */}
              <div className="space-y-2">
                <Label>Meal Type</Label>
                <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Food Items */}
              <div className="space-y-2">
                <Label>Food Items</Label>
                <div className="space-y-2">
                  {foodItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Item name (e.g., Rice and Curry)"
                        value={item.item}
                        onChange={(e) => updateFoodItem(index, "item", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateFoodItem(index, "quantity", parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      {foodItems.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeFoodItem(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addFoodItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {/* Delivery Location */}
              <div className="space-y-2">
                <Label>Delivery Location</Label>
                <Select value={locationType} onValueChange={setLocationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_LOCATIONS.map((loc) => (
                      <SelectItem key={loc.type} value={loc.type}>
                        {loc.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {locationType && (
                  <Input
                    placeholder={
                      DELIVERY_LOCATIONS.find((l) => l.type === locationType)?.placeholder ||
                      "Enter details"
                    }
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                  />
                )}
              </div>

              {/* Required Time */}
              <div className="space-y-2">
                <Label>Required By</Label>
                <Input
                  type="datetime-local"
                  value={requiredTime}
                  onChange={(e) => setRequiredTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label>Special Instructions (optional)</Label>
                <Textarea
                  placeholder="Any dietary requirements or special requests..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRequest} disabled={isSubmitting}>
                {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                Create Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">
            <Package className="mr-2 h-4 w-4" />
            My Requests
            {myRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {myRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="help">
            <HandHelping className="mr-2 h-4 w-4" />
            Help Others
            {availableRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-[oklch(0.60_0.18_40)]/10 text-[oklch(0.50_0.18_40)]">
                {availableRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6">
          {myRequests.length > 0 ? (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <RequestCard key={request.id} request={request} isOwner />
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <Utensils className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No requests yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Need help getting food? Create a request and a fellow student will assist you.
                </p>
                <Button
                  className="mt-4 bg-[oklch(0.60_0.18_40)] hover:bg-[oklch(0.55_0.18_40)]"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Request
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="help" className="mt-6">
          {availableRequests.length > 0 ? (
            <div className="space-y-4">
              {availableRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={() => handleAcceptRequest(request.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <HandHelping className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No requests available</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Check back later to help fellow students with their food needs.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function RequestCard({
  request,
  isOwner = false,
  onAccept,
}: {
  request: FoodRequest
  isOwner?: boolean
  onAccept?: () => void
}) {
  const status = statusConfig[request.status]
  const StatusIcon = status.icon

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.60_0.18_40)]/10 flex-shrink-0">
            <Utensils className="h-6 w-6 text-[oklch(0.60_0.18_40)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-semibold">{request.requestNumber}</span>
              <Badge variant="outline" className={status.color}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {status.label}
              </Badge>
              <Badge variant="secondary">{request.mealType}</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap gap-2">
                {request.foodItems.map((item, i) => (
                  <Badge key={i} variant="outline">
                    {item.item} x{item.quantity}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {request.deliveryLocation.type}: {request.deliveryLocation.details}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(request.requiredTime).toLocaleString()}
                </span>
              </div>

              {!isOwner && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User className="h-4 w-4" />
                  Requested by {request.requesterName}
                </div>
              )}

              {isOwner && request.helperName && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HandHelping className="h-4 w-4" />
                  <span>Helper: {request.helperName}</span>
                  {request.helperContact && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {request.helperContact}
                    </span>
                  )}
                </div>
              )}

              {request.specialInstructions && (
                <p className="text-muted-foreground italic">
                  Note: {request.specialInstructions}
                </p>
              )}
            </div>
          </div>

          {!isOwner && request.status === "pending" && onAccept && (
            <Button
              onClick={onAccept}
              className="flex-shrink-0 bg-[oklch(0.60_0.18_40)] hover:bg-[oklch(0.55_0.18_40)]"
            >
              <HandHelping className="mr-2 h-4 w-4" />
              Accept Request
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
