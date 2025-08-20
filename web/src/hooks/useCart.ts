import { useEffect, useState } from "react";
export type CartItem = { productId: number; name: string; unitPrice: number; quantity: number };
const KEY = "rivy_cart";
export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem(KEY) || "[]"));
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);
  const add = (it: CartItem) => setItems(prev => {
    const i = prev.findIndex(p => p.productId === it.productId);
    if (i >= 0) { const copy = [...prev]; copy[i] = { ...copy[i], quantity: copy[i].quantity + it.quantity }; return copy; }
    return [...prev, it];
  });
  const remove = (id: number) => setItems(prev => prev.filter(p => p.productId !== id));
  const updateQty = (id: number, q: number) => setItems(prev => prev.map(p => p.productId === id ? { ...p, quantity: q } : p));
  const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const tax = Math.round(subtotal * 0.075); const total = subtotal + tax;
  return { items, add, remove, updateQty, subtotal, tax, total, clear: () => setItems([]) };
}
