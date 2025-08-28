// ========= Types =========
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

// ========= Utils =========
const rawBase =
  (import.meta as any)?.env?.VITE_API_URL ??
  (import.meta as any)?.env?.VITE_API_BASE_URL ??
  "";
const API_BASE = String(rawBase).replace(/\/+$/, ""); // trim trailing slash

function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}
async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    credentials: "include",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    let msg = "";
    try {
      const j = await res.clone().json();
      msg =
        (j as any)?.error?.message ||
        (j as any)?.message ||
        (typeof j === "string" ? j : JSON.stringify(j));
    } catch {
      try {
        msg = await res.text();
      } catch {
        /* ignore */
      }
    }
    throw new Error(msg || `Request failed with ${res.status}`);
  }

  // If there's no JSON body (204), return undefined as T
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function asNaira(kobo?: number | null): string {
  if (typeof kobo !== "number" || Number.isNaN(kobo)) return "₦0";
  return `₦${(kobo / 100).toLocaleString()}`;
}

// ========= API: Products =========
export async function fetchProducts(
  query: ProductQuery
): Promise<{ data: Product[]; total: number; totalPages: number }> {
  const usp = new URLSearchParams();
  if (query.q) usp.set("q", query.q);
  if (query.categoryId != null) usp.set("categoryId", String(query.categoryId));
  if (typeof query.minPriceKobo === "number")
    usp.set("minPriceKobo", String(query.minPriceKobo));
  if (typeof query.maxPriceKobo === "number")
    usp.set("maxPriceKobo", String(query.maxPriceKobo));
  if (typeof query.inStock === "boolean")
    usp.set("inStock", String(query.inStock));
  if (typeof query.financingEligible === "boolean")
    usp.set("financingEligible", String(query.financingEligible));
  if (query.sort) usp.set("sort", query.sort);
  if (typeof query.page === "number") usp.set("page", String(query.page));
  if (typeof query.limit === "number") usp.set("limit", String(query.limit));

  return apiFetch(`/api/products${usp.toString() ? `?${usp.toString()}` : ""}`);
}

export async function fetchProduct(id: number): Promise<Product> {
  return apiFetch(`/api/products/${id}`);
}

export async function fetchCategories(): Promise<
  { id: string; name: string }[]
> {
  // Some envs may not expose /api/categories; treat 404 as empty.
  const res = await fetch(apiUrl("/api/categories"), {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (res.status === 404) return [];
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Failed to fetch categories (${res.status})`);
  }
  return res.json();
}

// ========= API: Checkout (server expects { customer, lines }) =========
export function newIdempotencyKey(): string {
  const g: any =
    typeof globalThis !== "undefined" ? globalThis : (window as any);
  if (g?.crypto?.randomUUID) return g.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// helper to enforce non-empty strings
const nonEmpty = (v: unknown, fallback: string) =>
  typeof v === "string" && v.trim().length > 0 ? v.trim() : fallback;

type CheckoutLine = { productId: number; qty: number; quantity?: number };
type CheckoutCustomer = {
  name: string;
  email?: string;
  phone?: string;
  address: string; // required by server
};

type CheckoutRequest =
  | {
      items: { productId: number; qty: number }[];
      customer?: Partial<CheckoutCustomer>;
    }
  | { lines: CheckoutLine[]; customer: Partial<CheckoutCustomer> };

export async function checkout(
  payload: CheckoutRequest,
  opts: { idempotencyKey?: string } = {}
): Promise<{ orderId: string }> {
  // normalize lines
  const rawLines: CheckoutLine[] = Array.isArray((payload as any).lines)
    ? (payload as any).lines
    : Array.isArray((payload as any).items)
    ? (payload as any).items.map((i: any) => ({
        productId: Number(i?.productId),
        qty: Math.max(1, Math.floor(Number(i?.qty))),
      }))
    : [];

  const lines = rawLines
    .filter(
      (l) => Number.isFinite(l.productId) && Number.isFinite(l.qty) && l.qty > 0
    )
    .map((l) => ({
      productId: Number(l.productId),
      qty: Math.max(1, Math.floor(Number(l.qty))),
      quantity: Math.max(1, Math.floor(Number(l.qty))), // compatibility
    }));

  if (lines.length === 0) throw new Error("No valid items to checkout.");

  // ensure required non-empty strings for Zod
  const from = ((payload as any).customer ?? {}) as Partial<CheckoutCustomer>;
  const customer: CheckoutCustomer = {
    name: nonEmpty(from.name, "Guest"),
    email: nonEmpty(from.email, "guest@example.com"),
    phone: nonEmpty(from.phone, "N/A"),
    address: nonEmpty(from.address, "Guest address"), // <- not empty anymore
  };

  const key =
    opts.idempotencyKey ??
    (typeof globalThis !== "undefined" && (globalThis as any).crypto?.randomUUID
      ? (globalThis as any).crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

  const res = await fetch(apiUrl("/api/checkout"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Idempotency-Key": key,
    },
    body: JSON.stringify({ customer, lines }),
  });

  if (!res.ok) {
    let msg = "";
    try {
      const j = await res.clone().json();
      msg =
        (j as any)?.error?.message || (j as any)?.message || JSON.stringify(j);
    } catch {
      try {
        msg = await res.text();
      } catch {}
    }
    throw new Error(msg || `Checkout failed (${res.status})`);
  }

  return res.json();
}
