"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  addOns: { label: string; price: number }[];
  notes?: string;
  img?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  removePartialFromCart: (id: number, quantity: number, addOns: { label: string; price: number }[], notes?: string) => void;
  paidAmount: number;
  setPaidAmount: (amt: number) => void;
  paidPercent: number;
  setPaidPercent: (pct: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paidAmount, setPaidAmount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const val = sessionStorage.getItem('paidAmount');
      return val ? parseFloat(val) : 0;
    }
    return 0;
  });
  const [paidPercent, setPaidPercent] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const val = sessionStorage.getItem('paidPercent');
      return val ? parseFloat(val) : 0;
    }
    return 0;
  });

  useEffect(() => {
    sessionStorage.setItem('paidAmount', paidAmount.toString());
  }, [paidAmount]);
  useEffect(() => {
    sessionStorage.setItem('paidPercent', paidPercent.toString());
  }, [paidPercent]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      // If same id and addOns/notes, increase quantity
      const idx = prev.findIndex(
        i => i.id === item.id && JSON.stringify(i.addOns) === JSON.stringify(item.addOns) && i.notes === item.notes
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => setCart([]);

  const removePartialFromCart = (id: number, quantity: number, addOns: { label: string; price: number }[], notes?: string) => {
    setCart(prev => prev.filter(i => i.id !== id || i.quantity !== quantity || JSON.stringify(i.addOns) !== JSON.stringify(addOns) || i.notes !== notes));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, removePartialFromCart, paidAmount, setPaidAmount, paidPercent, setPaidPercent }}>
      {children}
    </CartContext.Provider>
  );
} 