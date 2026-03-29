"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Shirt } from "lucide-react"
import { toast } from "sonner"

export default function AddLaundryServicePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    businessName: "",
    location: "",
    contactNumber: "",
    openTime: "08:00",
    closeTime: "18:00",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      const response = await fetch('http://localhost:5000/api/laundry/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('unimate_token')}`
        },
        body: JSON.stringify({
          ...formData,
          operatingHours: {
            open: formData.openTime,
            close: formData.closeTime
          },
          clothesCategories: [
            { name: "Regular/Daily Wear", pricePerItem: 50 },
            { name: "Delicate Clothes", pricePerItem: 100 },
            { name: "Heavy Clothes", pricePerItem: 75 }
          ],
          serviceTypes: [
            { name: "Wash & Dry", price: 200 },
            { name: "Iron", price: 100 },
            { name: "Wash Only", price: 150 }
          ],
          serviceDurations: [
            { duration: "24-hour", hours: 24, price: 0 },
            { duration: "12-hour", hours: 12, price: 100 },
            { duration: "48-hour", hours: 48, price: 0 }
          ]
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Service created successfully!")
        router.push("/laundry?tab=my-services")
      } else {
        toast.error(data.message || "Failed to create service")
      }
    } catch (error) {
      console.error("Error creating service:", error)
      toast.error("Failed to create service")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Laundry Service</h1>
        <p className="text-muted-foreground mt-1">
          Set up your laundry service details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="h-5 w-5" />
            Service Information
          </CardTitle>
          <CardDescription>
            Enter your business details and operating hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g., Campus Clean Laundry"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., 123 Main St, Colombo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="e.g., 0771234567"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openTime">Opening Time *</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={formData.openTime}
                  onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closeTime">Closing Time *</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={formData.closeTime}
                  onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Service"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
