import { create } from "zustand";

export type CartItem = {
  id: string;
  name: string;
  priceKobo: number; // integer (kobo)
  minOrder: number; // step size
  imageUrl: string;
  quantity: number; // must be multiples of minOrder
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  update: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: () => number; // total line items count (not sum of qty)
};

export const useCart = create<CartState>((set, get) => ({
  items: [],

  add: (item) =>
    set((state) => {
      const min = Math.max(1, item.minOrder || 1);
      const qty = Math.max(min, Math.floor((item.quantity ?? min) / min) * min);
      const idx = state.items.findIndex((x) => x.id === item.id);
      if (idx >= 0) {
        const next = [...state.items];
        const newQty = next[idx].quantity + qty;
        // snap to step
        next[idx] = { ...next[idx], quantity: Math.floor(newQty / min) * min };
        return { items: next };
      }
      return { items: [...state.items, { ...item, quantity: qty }] };
    }),

  update: (id, quantity) =>
    set((state) => {
      const next = state.items.map((it) => {
        if (it.id !== id) return it;
        const min = Math.max(1, it.minOrder || 1);
        const q = Math.max(min, Math.floor(quantity / min) * min);
        return { ...it, quantity: q };
      });
      return { items: next };
    }),

  remove: (id) =>
    set((state) => ({ items: state.items.filter((it) => it.id !== id) })),
  clear: () => set({ items: [] }),

  count: () => get().items.length,
}));

export default useCart;
