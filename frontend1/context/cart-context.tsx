"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { SecondHandItem } from "@/lib/types"

export interface CartItem {
  item: SecondHandItem
  addedAt: string
}

interface CartContextValue {
  cartItems: CartItem[]
  addToCart: (item: SecondHandItem) => void
  removeFromCart: (itemId: string) => void
  clearCart: () => void
  isInCart: (itemId: string) => boolean
  cartCount: number
  cartTotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

const CART_STORAGE_KEY = "unimate_marketplace_cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) setCartItems(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = useCallback((item: SecondHandItem) => {
    setCartItems((prev) => {
      if (prev.some((c) => c.item.id === item.id)) return prev
      return [...prev, { item, addedAt: new Date().toISOString() }]
    })
  }, [])

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems((prev) => prev.filter((c) => c.item.id !== itemId))
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const isInCart = useCallback(
    (itemId: string) => cartItems.some((c) => c.item.id === itemId),
    [cartItems]
  )

  const cartCount = cartItems.length
  const cartTotal = cartItems.reduce((sum, c) => sum + c.item.price, 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, isInCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
}
