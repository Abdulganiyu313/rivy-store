// web/src/api.ts
export type Product = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  priceKobo?: number | null;
  minOrder?: number | null;
  stock?: number | null;
  financingEligible?: boolean | null;
  categoryId?: string | number | null;
  // ...anything else you already have
};

export type ProductQuery = {
  q?: string;
  categoryId?: string | number;
  minPriceKobo?: number;
  maxPriceKobo?: number;
  inStock?: boolean;
  financingEligible?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest";
  page?: number;
  limit?: number;
};

const API_BASE = "/api";

// existing functions you already use elsewhere
export async function fetchProducts(query: ProductQuery) {
  const usp = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
  });
  const res = await fetch(`${API_BASE}/products?${usp.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch products`);
  return res.json(); // { data, total, totalPages }
}

export async function fetchCategories(): Promise<
  { id: string; name: string }[]
> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) return []; // be forgiving in dev
  return res.json();
}

// NEW: fetch a single product
export async function fetchProduct(id: number): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch product #${id}`);
  return res.json();
}

// NEW: checkout
export async function checkout(payload: {
  items: { productId: number; qty: number }[];
}): Promise<{ orderId: string }> {
  const res = await fetch(`${API_BASE}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Checkout failed");
  }
  return res.json();
}

// (optional) currency helper used by SafePrice
export function asNaira(kobo?: number | null) {
  if (typeof kobo !== "number" || Number.isNaN(kobo)) return "—";
  return `₦${(kobo / 100).toLocaleString()}`;
}
