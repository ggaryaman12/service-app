"use client";

import { useEffect, useState } from "react";
import type { CartState } from "@/lib/cart-store";
import { addToCart, clearCart, getCart, removeFromCart, setQuantity, subscribe } from "@/lib/cart-store";

export function useCart() {
  const [cart, setCart] = useState<CartState>(() => ({ items: [] }));

  useEffect(() => {
    setCart(getCart());
    return subscribe(() => setCart(getCart()));
  }, []);

  return {
    cart,
    addToCart,
    removeFromCart,
    setQuantity,
    clearCart
  };
}

