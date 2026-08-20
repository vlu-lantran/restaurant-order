"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { MenuItem } from "../menu/MenuCard"

export interface CartItem extends MenuItem {
  cartItemId: string
  quantity: number
  notes?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: MenuItem, quantity: number, notes?: string) => void
  removeItem: (cartItemId: string) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (item: MenuItem, quantity: number, notes?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.notes === notes)
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === existing.cartItemId ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prev, { ...item, cartItemId: Date.now().toString() + Math.random(), quantity, notes }]
    })
  }

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId))
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
