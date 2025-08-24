import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../api";

type CartItem = { product: Product; qty: number };
type State = {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clear: () => void;
  totalKobo: () => number;
};

export const useCartStore = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product, qty = 1) => {
        const items = Array.isArray(get().items) ? [...get().items] : [];
        const i = items.findIndex((x) => x.product.id === product.id);
        if (i >= 0) items[i] = { ...items[i], qty: items[i].qty + qty };
        else items.push({ product, qty });
        set({ items });
      },
      remove: (id) =>
        set({ items: (get().items || []).filter((i) => i.product.id !== id) }),
      setQty: (id, qty) =>
        set({
          items: (get().items || []).map((i) =>
            i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i
          ),
        }),
      clear: () => set({ items: [] }),
      totalKobo: () =>
        get().items.reduce((sum, i) => {
          const price =
            typeof i.product.priceKobo === "number" ? i.product.priceKobo : 0;
          return sum + price * i.qty;
        }, 0),
    }),
    {
      // new storage key so we don't read any old/stale shapes
      name: "cart:v2",
      // only persist what's needed
      partialize: (s) => ({ items: s.items }),
    }
  )
);

// allow both default and named imports
export default useCartStore;
