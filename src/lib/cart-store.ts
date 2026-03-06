"use client";

export type CartItem = {
  serviceId: string;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};

const KEY = "jammuserve_cart_v1";

function read(): CartState {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed?.items || !Array.isArray(parsed.items)) return { items: [] };
    return {
      items: parsed.items
        .map((i) => ({
          serviceId: String((i as any).serviceId ?? ""),
          quantity: Number((i as any).quantity ?? 0)
        }))
        .filter((i) => i.serviceId && i.quantity > 0)
    };
  } catch {
    return { items: [] };
  }
}

function write(next: CartState) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("jammuserve:cart"));
}

export function getCart(): CartState {
  return read();
}

export function clearCart() {
  write({ items: [] });
}

export function addToCart(serviceId: string, qty = 1) {
  const id = String(serviceId);
  if (!id) return;
  const state = read();
  const items = [...state.items];
  const idx = items.findIndex((i) => i.serviceId === id);
  if (idx >= 0) items[idx] = { ...items[idx], quantity: items[idx].quantity + qty };
  else items.push({ serviceId: id, quantity: qty });
  write({ items });
}

export function removeFromCart(serviceId: string, qty = 1) {
  const id = String(serviceId);
  const state = read();
  const items = [...state.items];
  const idx = items.findIndex((i) => i.serviceId === id);
  if (idx < 0) return;
  const nextQty = items[idx].quantity - qty;
  if (nextQty <= 0) items.splice(idx, 1);
  else items[idx] = { ...items[idx], quantity: nextQty };
  write({ items });
}

export function setQuantity(serviceId: string, quantity: number) {
  const id = String(serviceId);
  const q = Math.max(0, Math.floor(quantity));
  const state = read();
  const items = [...state.items];
  const idx = items.findIndex((i) => i.serviceId === id);
  if (idx < 0 && q > 0) items.push({ serviceId: id, quantity: q });
  else if (idx >= 0 && q === 0) items.splice(idx, 1);
  else if (idx >= 0) items[idx] = { ...items[idx], quantity: q };
  write({ items });
}

export function subscribe(callback: () => void) {
  const onEvent = () => callback();
  window.addEventListener("storage", onEvent);
  window.addEventListener("jammuserve:cart", onEvent);
  return () => {
    window.removeEventListener("storage", onEvent);
    window.removeEventListener("jammuserve:cart", onEvent);
  };
}

