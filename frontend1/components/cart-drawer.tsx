"use client"

import { useState } from "react"
import Image from "next/image"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { secondhandService } from "@/lib/services/secondhand.service"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  ShoppingCart,
  Trash2,
  CreditCard,
  Banknote,
  CheckCircle,
  Lock,
  X,
} from "lucide-react"
import { toast } from "sonner"

export function CartDrawer() {
  const { cartItems, removeFromCart, clearCart, cartCount, cartTotal } = useCart()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "payment" | "success">("cart")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successItems, setSuccessItems] = useState<string[]>([])

  // Card fields
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cardName, setCardName] = useState("")
  const [contactPhone, setContactPhone] = useState("")

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16)
    return digits.replace(/(.{4})/g, "$1 ").trim()
  }

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2)
    return digits
  }

  const resetCheckout = () => {
    setCheckoutStep("cart")
    setCardNumber("")
    setCardExpiry("")
    setCardCvv("")
    setCardName("")
    setContactPhone("")
    setSuccessItems([])
  }

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please log in to checkout")
      return
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    // Validate phone always required
    if (!contactPhone || !/^\d{10}$/.test(contactPhone)) {
      toast.error("Please enter a valid 10-digit contact number")
      return
    }

    // Card validation
    if (paymentMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        toast.error("Please fill in all card details")
        return
      }
      if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
        toast.error("Card number must be 16 digits")
        return
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        toast.error("Expiry must be in MM/YY format")
        return
      }
      if (!/^\d{3,4}$/.test(cardCvv)) {
        toast.error("CVV must be 3 or 4 digits")
        return
      }
    }

    setIsSubmitting(true)
    const purchased: string[] = []
    const failed: string[] = []

    for (const cartItem of cartItems) {
      try {
        if (paymentMethod === "card") {
          await secondhandService.purchaseItem(cartItem.item.id, {
            buyerName: user.name || "User",
            buyerContact: contactPhone,
          })
        } else {
          // Cash: reserve the item so seller knows buyer is coming
          await secondhandService.reserveItem(cartItem.item.id, {
            buyerName: user.name || "User",
            buyerContact: contactPhone,
          })
        }
        purchased.push(cartItem.item.title)
      } catch (err: any) {
        failed.push(cartItem.item.title)
      }
    }

    setIsSubmitting(false)

    if (purchased.length > 0) {
      setSuccessItems(purchased)
      // Remove purchased items from cart
      purchased.forEach((title) => {
        const cartItem = cartItems.find((c) => c.item.title === title)
        if (cartItem) removeFromCart(cartItem.item.id)
      })
      setCheckoutStep("success")
    }

    if (failed.length > 0) {
      toast.error(`Failed: ${failed.join(", ")} — may already be sold/reserved.`)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetCheckout() }}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-[oklch(0.50_0.15_145)] text-white text-xs flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
          <span className="ml-2 hidden sm:inline">Cart</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {checkoutStep === "success" ? "Order Confirmed!" : `My Cart (${cartCount})`}
          </SheetTitle>
        </SheetHeader>

        {/* SUCCESS SCREEN */}
        {checkoutStep === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 text-center">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold mb-1">
                {paymentMethod === "card" ? "Payment Successful!" : "Order Placed!"}
              </p>
              <p className="text-sm text-muted-foreground">
                {paymentMethod === "card"
                  ? "Your items have been purchased. Contact the sellers to arrange pickup."
                  : "Items reserved. Contact each seller to arrange meetup and cash payment."}
              </p>
            </div>
            <div className="w-full space-y-2">
              {successItems.map((title) => (
                <div key={title} className="flex items-center gap-2 text-sm p-2 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-green-800 truncate">{title}</span>
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={() => { resetCheckout(); setOpen(false) }}>
              Done
            </Button>
          </div>
        )}

        {/* CART ITEMS */}
        {checkoutStep === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                    Browse Items
                  </Button>
                </div>
              ) : (
                cartItems.map((cartItem) => (
                  <div key={cartItem.item.id} className="flex gap-3 p-3 border rounded-lg">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                      <Image
                        src={cartItem.item.images?.[0] || "/placeholder.svg?height=64&width=64"}
                        alt={cartItem.item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{cartItem.item.title}</p>
                      <p className="text-xs text-muted-foreground">{cartItem.item.condition} · {cartItem.item.category}</p>
                      <p className="text-sm font-bold text-[oklch(0.50_0.15_145)] mt-1">
                        Rs. {cartItem.item.price.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(cartItem.item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-[oklch(0.50_0.15_145)]">Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-11" onClick={clearCart}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Cart
                  </Button>
                  <Button
                    className="flex-1 h-11 bg-[oklch(0.50_0.15_145)] hover:bg-[oklch(0.45_0.15_145)]"
                    onClick={() => setCheckoutStep("payment")}
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* PAYMENT STEP */}
        {checkoutStep === "payment" && (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-5 px-1">
              {/* Order summary */}
              <div className="rounded-lg border p-4 space-y-2 bg-muted/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Order Summary ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
                </p>
                {cartItems.map((c) => (
                  <div key={c.item.id} className="flex justify-between text-sm">
                    <span className="truncate flex-1 mr-2">{c.item.title}</span>
                    <span className="font-medium whitespace-nowrap">Rs. {c.item.price.toLocaleString()}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-[oklch(0.50_0.15_145)]">Rs. {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment method tabs */}
              <div className="space-y-4">
                <p className="text-sm font-medium">Payment Method</p>
                <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "card" | "cash")}>
                  <TabsList className="w-full h-11">
                    <TabsTrigger value="card" className="flex-1 h-full text-sm">
                      <CreditCard className="mr-2 h-4 w-4 shrink-0" />
                      Pay by Card
                    </TabsTrigger>
                    <TabsTrigger value="cash" className="flex-1 h-full text-sm">
                      <Banknote className="mr-2 h-4 w-4 shrink-0" />
                      Pay by Cash
                    </TabsTrigger>
                  </TabsList>

                  {/* CARD PAYMENT */}
                  <TabsContent value="card" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Card Number</Label>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        className="h-11"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Expiry (MM/YY)</Label>
                        <Input
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          maxLength={5}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">CVV</Label>
                        <Input
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          maxLength={4}
                          className="h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Name on Card</Label>
                      <Input
                        placeholder="Full name as on card"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-muted rounded-lg">
                      <Lock className="h-3 w-3 flex-shrink-0" />
                      Simulated payment — no real charges will be made.
                    </div>
                  </TabsContent>

                  {/* CASH PAYMENT */}
                  <TabsContent value="cash" className="mt-4">
                    <Card className="bg-amber-50 border-amber-200">
                      <CardContent className="p-4 space-y-2">
                        <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          How Cash Payment Works
                        </p>
                        <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                          <li>Items will be reserved for you</li>
                          <li>Contact each seller to arrange a meetup</li>
                          <li>Bring exact cash when you meet</li>
                          <li>Total to pay: <strong>Rs. {cartTotal.toLocaleString()}</strong></li>
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Contact number — always required */}
              <div className="space-y-2">
                <Label className="text-sm">Your Contact Number *</Label>
                <Input
                  type="tel"
                  placeholder="0771234567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">Sellers will contact you on this number (10 digits)</p>
              </div>
            </div>

            <div className="border-t pt-4 flex gap-3">
              <Button variant="outline" className="flex-1 h-11" onClick={() => setCheckoutStep("cart")}>
                Back
              </Button>
              <Button
                className="flex-1 h-11 bg-[oklch(0.50_0.15_145)] hover:bg-[oklch(0.45_0.15_145)]"
                onClick={handleCheckout}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : paymentMethod === "card" ? (
                  <CreditCard className="mr-2 h-4 w-4" />
                ) : (
                  <Banknote className="mr-2 h-4 w-4" />
                )}
                {paymentMethod === "card"
                  ? `Pay Rs. ${cartTotal.toLocaleString()}`
                  : `Reserve & Pay Cash`}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
