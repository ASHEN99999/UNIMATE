"use client"

import { useState, useEffect, use, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { mockLaundryProviders } from "@/lib/mock-data"
import { generateOrderNumber } from "@/lib/mock-data"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Shirt,
  MapPin,
  Clock,
  Star,
  Phone,
  Calendar as CalendarIcon,
  Plus,
  Minus,
  Check,
  ChevronRight,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

type BookingStep = "clothes" | "services" | "schedule" | "review"

interface ClothesSelection {
  category: string
  quantity: number
  pricePerPiece: number
}

export default function LaundryProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [provider, setProvider] = useState(mockLaundryProviders.find((p) => p.id === id))
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState<BookingStep>("clothes")
  const [clothesSelection, setClothesSelection] = useState<ClothesSelection[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedDuration, setSelectedDuration] = useState("")
  const [collectionDate, setCollectionDate] = useState<Date>()
  const [contactPhone, setContactPhone] = useState(user?.contactPhone || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const found = mockLaundryProviders.find((p) => p.id === id)
    setProvider(found)
    if (found) {
      // Initialize clothes selection
      setClothesSelection(
        found.clothesCategories.map((cat) => ({
          category: cat.name,
          quantity: 0,
          pricePerPiece: cat.pricePerPiece,
        }))
      )
    }
  }, [id])

  // Calculate totals
  const totals = useMemo(() => {
    if (!provider) return { clothes: 0, services: 0, duration: 0, total: 0, itemCount: 0 }

    const clothesTotal = clothesSelection.reduce(
      (acc, item) => acc + item.quantity * item.pricePerPiece,
      0
    )
    const itemCount = clothesSelection.reduce((acc, item) => acc + item.quantity, 0)
    
    const servicesTotal = provider.serviceTypes
      .filter((s) => selectedServices.includes(s.name))
      .reduce((acc, s) => acc + s.price, 0)
    
    const durationExtra = provider.serviceDurations.find(
      (d) => d.name === selectedDuration
    )?.price || 0

    return {
      clothes: clothesTotal,
      services: servicesTotal,
      duration: durationExtra,
      total: clothesTotal + servicesTotal + durationExtra,
      itemCount,
    }
  }, [provider, clothesSelection, selectedServices, selectedDuration])

  const updateQuantity = (category: string, delta: number) => {
    setClothesSelection((prev) =>
      prev.map((item) =>
        item.category === category
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    )
  }

  const canProceed = () => {
    switch (currentStep) {
      case "clothes":
        return totals.itemCount > 0
      case "services":
        return selectedServices.length > 0 && selectedDuration !== ""
      case "schedule":
        return collectionDate && contactPhone
      default:
        return true
    }
  }

  const handleNext = () => {
    const steps: BookingStep[] = ["clothes", "services", "schedule", "review"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const steps: BookingStep[] = ["clothes", "services", "schedule", "review"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleSubmit = async () => {
    if (!provider || !collectionDate || !user) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const booking = {
      id: `booking_${Date.now()}`,
      orderNumber: generateOrderNumber("LND"),
      providerId: provider.id,
      studentId: user.id,
      studentName: user.name,
      studentContact: contactPhone,
      clothesItems: clothesSelection
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          category: item.category,
          quantity: item.quantity,
          price: item.quantity * item.pricePerPiece,
        })),
      selectedServices,
      serviceDuration: selectedDuration,
      totalPrice: totals.total,
      collectionDate: format(collectionDate, "yyyy-MM-dd"),
      status: "requested",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
    }

    const bookings = JSON.parse(localStorage.getItem("unimate_laundry_bookings") || "[]")
    bookings.push(booking)
    localStorage.setItem("unimate_laundry_bookings", JSON.stringify(bookings))

    setIsSubmitting(false)
    toast.success("Booking confirmed!", {
      description: `Your order ${booking.orderNumber} has been submitted.`,
    })
    router.push("/laundry?tab=bookings")
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Shirt className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Provider not found</h2>
        <Button className="mt-4" asChild>
          <Link href="/laundry">Browse Providers</Link>
        </Button>
      </div>
    )
  }

  const steps: { key: BookingStep; label: string }[] = [
    { key: "clothes", label: "Select Clothes" },
    { key: "services", label: "Choose Services" },
    { key: "schedule", label: "Schedule" },
    { key: "review", label: "Review & Book" },
  ]

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to providers
      </Button>

      {/* Provider Info */}
      <Card>
        <CardContent className="flex flex-col md:flex-row items-start gap-4 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[oklch(0.55_0.16_280)]/10 flex-shrink-0">
            <Shirt className="h-8 w-8 text-[oklch(0.55_0.16_280)]" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{provider.businessName}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {provider.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {provider.operatingHours.open} - {provider.operatingHours.close}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {provider.contactNumber}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                {provider.rating} ({provider.totalReviews} reviews)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepIndex = steps.findIndex((s) => s.key === currentStep)
          const isCompleted = index < stepIndex
          const isCurrent = step.key === currentStep

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium hidden sm:block",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step: Clothes */}
          {currentStep === "clothes" && (
            <Card>
              <CardHeader>
                <CardTitle>Select Your Clothes</CardTitle>
                <CardDescription>Choose the categories and quantities of clothes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {clothesSelection.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{item.category}</p>
                      <p className="text-sm text-muted-foreground">
                        Rs. {item.pricePerPiece}/piece
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.category, -1)}
                        disabled={item.quantity === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.category, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Step: Services */}
          {currentStep === "services" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Services</CardTitle>
                  <CardDescription>Select the services you need</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {provider.serviceTypes.map((service) => (
                    <div
                      key={service.name}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                        selectedServices.includes(service.name)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => {
                        if (selectedServices.includes(service.name)) {
                          setSelectedServices(selectedServices.filter((s) => s !== service.name))
                        } else {
                          setSelectedServices([...selectedServices, service.name])
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedServices.includes(service.name)} />
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <span className="font-semibold">Rs. {service.price}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Duration</CardTitle>
                  <CardDescription>How quickly do you need your laundry?</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedDuration} onValueChange={setSelectedDuration}>
                    {provider.serviceDurations.map((duration) => (
                      <div
                        key={duration.name}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                          selectedDuration === duration.name
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedDuration(duration.name)}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={duration.name} id={duration.name} />
                          <Label htmlFor={duration.name} className="cursor-pointer font-medium">
                            {duration.name}
                          </Label>
                        </div>
                        <span className="font-semibold">
                          {duration.price > 0 ? `+Rs. ${duration.price}` : "Free"}
                        </span>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step: Schedule */}
          {currentStep === "schedule" && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule Pickup</CardTitle>
                <CardDescription>Choose when you want to drop off your clothes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Collection Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !collectionDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {collectionDate ? format(collectionDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={collectionDate}
                        onSelect={setCollectionDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    type="tel"
                    placeholder="Your contact number"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    The provider will contact you on this number
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step: Review */}
          {currentStep === "review" && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Order</CardTitle>
                <CardDescription>Make sure everything looks correct before booking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Clothes</h4>
                  <div className="space-y-2">
                    {clothesSelection
                      .filter((item) => item.quantity > 0)
                      .map((item) => (
                        <div key={item.category} className="flex justify-between text-sm">
                          <span>
                            {item.category} x {item.quantity}
                          </span>
                          <span>Rs. {(item.quantity * item.pricePerPiece).toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedServices.map((service) => (
                      <Badge key={service} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{selectedDuration}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Schedule</h4>
                  <p className="text-sm">
                    Collection: {collectionDate && format(collectionDate, "PPP")}
                  </p>
                  <p className="text-sm">Contact: {contactPhone}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Clothes ({totals.itemCount} items)</span>
                  <span>Rs. {totals.clothes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Services</span>
                  <span>Rs. {totals.services.toLocaleString()}</span>
                </div>
                {totals.duration > 0 && (
                  <div className="flex justify-between">
                    <span>Express Fee</span>
                    <span>Rs. {totals.duration.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rs. {totals.total.toLocaleString()}</span>
              </div>

              <div className="flex gap-2 pt-4">
                {currentStep !== "clothes" && (
                  <Button variant="outline" className="flex-1" onClick={handleBack}>
                    Back
                  </Button>
                )}
                {currentStep !== "review" ? (
                  <Button className="flex-1" onClick={handleNext} disabled={!canProceed()}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canProceed()}
                  >
                    {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
                    Confirm Booking
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
