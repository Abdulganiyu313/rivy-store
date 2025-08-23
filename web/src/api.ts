// Centralized API helpers + types. Safe if VITE_API_URL is missing.

const RAW = (import.meta as any).env?.VITE_API_URL as string | undefined;
const CLEAN = (RAW || "").replace(/\/+$/, "");
export const API_URL = CLEAN || "";
export const API_URL_OK = Boolean(CLEAN);
export const API_URL_DISPLAY = RAW ?? "(unset)";

function resolveUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  if (API_URL_OK) {
    return path.startsWith("/") ? `${API_URL}${path}` : `${API_URL}/${path}`;
  }
  // Fallback to same-origin (dev only). This will likely fail with HTML,
  // but we’ll surface a readable error via ensureJson.
  return path.startsWith("/") ? path : `/${path}`;
}

async function ensureJson(res: Response, url: string) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text().catch(() => "");
  const snippet = text.slice(0, 200).replace(/\s+/g, " ").trim();
  throw new Error(
    `Expected JSON from ${url} but got ${
      ct || "unknown"
    }. First bytes: ${snippet}`
  );
}

export async function apiGet<T = any>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = resolveUrl(path);
  const res = await fetch(url, { ...(init || {}), method: "GET" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GET ${url} failed (${res.status}). ${body.slice(0, 160)}`);
  }
  return ensureJson(res, url);
}

export async function apiPost<T = any>(
  path: string,
  body?: any,
  init?: RequestInit
): Promise<T> {
  const url = resolveUrl(path);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...(init || {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `POST ${url} failed (${res.status}). ${text.slice(0, 160)}`
    );
  }
  return ensureJson(res, url);
}

// --- Types and typed helpers ---
export type Product = {
  id: string;
  name: string;
  description?: string;
  priceKobo: number;
  stock: number;
  minOrder: number;
  imageUrl?: string | null;
  brand?: string | null;
  categoryId?: string | null;
  financingEligible?: boolean | null;
  createdAt?: string;
};

export type Paged<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ProductQuery = {
  q?: string;
  categoryId?: string;
  brand?: string;
  minPriceKobo?: number;
  maxPriceKobo?: number;
  inStock?: boolean;
  financingEligible?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest";
  page?: number;
  limit?: number;
  view?: "grid" | "list";
};

export async function fetchProducts(
  params: ProductQuery
): Promise<Paged<Product>> {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
  });
  return apiGet(`/products?${usp.toString()}`);
}

export async function fetchProductById(id: string): Promise<Product> {
  return apiGet(`/products/${id}`);
}

export type CheckoutItem = { productId: string; quantity: number };
export type CheckoutPayload = {
  idempotencyKey: string;
  customer: { name: string; email: string; address: string };
  items: CheckoutItem[];
};
export type CheckoutResponse = {
  orderId: string;
  subtotalKobo: number;
  currency: "NGN";
};
export async function checkout(
  payload: CheckoutPayload
): Promise<CheckoutResponse> {
  return apiPost("/checkout", payload);
}

export async function fetchBrands(): Promise<string[]> {
  return apiGet("/products/brands");
}
export type Category = { id: string; name: string };
export async function fetchCategories(): Promise<Category[]> {
  return apiGet("/categories");
}
export function formatKobo(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;
}
