// web/src/api.ts
// Minimal HTTP helper (no axios) + shared types/utilities + product/checkout helpers.

const BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "";

// Build URL with query params
function withQuery(path: string, params?: Record<string, any>): string {
  const url = new URL((BASE || "") + path, window.location.origin);
  if (params) {
    const usp = new URLSearchParams(url.search);
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      usp.set(k, String(v));
    });
    url.search = usp.toString();
  }
  return url.toString();
}

/* -------------------- tiny HTTP client -------------------- */
export const api = {
  async get<T = any>(path: string, opts?: { params?: Record<string, any> }) {
    const res = await fetch(withQuery(path, opts?.params), {
      credentials: "include",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `GET ${path} failed (${res.status})`);
    }
    const data = (await res.json()) as T;
    return { data };
  },

  async post<T = any>(
    path: string,
    body?: any,
    headers?: Record<string, string>
  ) {
    const res = await fetch((BASE || "") + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(headers || {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `POST ${path} failed (${res.status})`);
    }
    const data = (await res.json()) as T;
    return { data };
  },
};

// Convenience wrapper used around the app
export async function apiGet<T = any>(
  url: string,
  params?: Record<string, any>
) {
  const { data } = await api.get<T>(url, { params });
  return data as T;
}

/* ------------------------- Types ------------------------- */
export type Product = {
  id: number;
  name: string;
  description?: string;
  priceKobo: number;
  stock: number;
  imageUrl?: string | null;
  brand?: string | null;
  category?: string | null; // category NAME (e.g. "Batteries")
  financingEligible?: boolean | null;
};

export type ProductQuery = {
  q?: string;
  category?: string; // filter by NAME
  minPriceKobo?: number;
  maxPriceKobo?: number;
  inStock?: boolean;
  financingEligible?: boolean;
  brand?: string;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest";
  page?: number;
  limit?: number;
};

export type CheckoutLine = { productId: number | string; qty: number };
export type CheckoutRequest = {
  customer: { name: string; email: string; address: string };
  lines: CheckoutLine[];
};
export type CheckoutResponse = {
  orderId: number | string;
  items: Array<{
    productId: number | string;
    name: string;
    qty: number;
    unitPriceKobo: number;
    subtotalKobo: number;
  }>;
  totals: { totalKobo: number };
};

/* ---------------------- API helpers ---------------------- */
export async function fetchProducts(params: ProductQuery) {
  // backend exposes /api/products (alias to /products)
  return apiGet<{
    data: Product[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }>("/api/products", params);
}

// Returns category NAMES (strings) from { data: string[] } or a raw string[]
export async function fetchCategories(): Promise<
  Array<{ id: string; name: string }>
> {
  const res = await apiGet<any>("/categories");
  const arr: any[] = Array.isArray(res?.data)
    ? res.data
    : Array.isArray(res)
    ? res
    : [];
  return arr.map((x) =>
    typeof x === "string"
      ? { id: x, name: x }
      : { id: String(x.id ?? x.name), name: String(x.name ?? x.id) }
  );
}

/* --------- product detail + checkout (new helpers) --------- */
export async function getProduct(id: number | string) {
  // mounted at /api/products/:id
  const { data } = await api.get<Product>(`/api/products/${id}`);
  return data;
}

export async function checkout(
  payload: CheckoutRequest,
  idempotencyKey?: string
) {
  const headers: Record<string, string> = {};
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const { data } = await api.post<CheckoutResponse>(
    "/api/checkout",
    payload,
    headers
  );
  return data;
}

/* -- attach to api object for backward-compatible imports -- */
// So code like `api.getProduct(id)` / `api.checkout(body)` keeps working.
(api as any).getProduct = getProduct;
(api as any).checkout = checkout;

/* ----------------------- Utilities ----------------------- */
export function asNaira(kobo: number | null | undefined) {
  const naira = (Number(kobo ?? 0) || 0) / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(naira);
}

// Optional alias if some files import { http }
export const http = api;
