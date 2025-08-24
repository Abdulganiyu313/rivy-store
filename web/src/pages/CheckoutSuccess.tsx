import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SafePrice from "../components/SafePrice";

/* ---------------- Types ---------------- */
type OrderItem = {
  productId: number;
  name: string;
  imageUrl?: string | null;
  priceKobo?: number | null;
  qty: number;
};

type Order = {
  id: string;
  status?: string;
  createdAt?: string;
  items: OrderItem[];
  subtotalKobo?: number | null;
  taxKobo?: number | null;
  totalKobo?: number | null;
};

/* -------------- Normalizer -------------- */
function normalizeOrder(raw: any, idFallback: string): Order {
  const lines: any[] = raw?.items ?? raw?.lines ?? [];

  const items: OrderItem[] = (Array.isArray(lines) ? lines : []).map(
    (l: any, idx: number) => ({
      productId:
        Number(l?.productId ?? l?.id ?? l?.product?.id ?? idx + 1) || idx + 1,
      name: String(l?.name ?? l?.product?.name ?? `Item ${idx + 1}`),
      imageUrl: l?.imageUrl ?? l?.product?.imageUrl ?? null,
      priceKobo:
        typeof l?.priceKobo === "number"
          ? l.priceKobo
          : typeof l?.unitPriceKobo === "number"
          ? l.unitPriceKobo
          : typeof l?.price_kobo === "number"
          ? l.price_kobo
          : null,
      qty: Number(l?.qty ?? l?.quantity ?? l?.qtyOrdered ?? 0) || 0,
    })
  );

  return {
    id: String(raw?.id ?? idFallback),
    status: raw?.status,
    createdAt: raw?.createdAt ?? raw?.created_at,
    items,
    subtotalKobo:
      typeof raw?.subtotalKobo === "number"
        ? raw.subtotalKobo
        : (raw as any)?.subtotal_kobo,
    taxKobo:
      typeof raw?.taxKobo === "number" ? raw.taxKobo : (raw as any)?.tax_kobo,
    totalKobo:
      typeof raw?.totalKobo === "number"
        ? raw.totalKobo
        : (raw as any)?.total_kobo,
  };
}

/* -------------- Fetch with fallbacks -------------- */
async function fetchOrder(orderId: string): Promise<Order | null> {
  async function tryJson(url: string) {
    const res = await fetch(url, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const ctype = res.headers.get("content-type") || "";
    if (!ctype.includes("application/json")) return null;
    const data = await res.json();
    return normalizeOrder(data, orderId);
  }

  const urls = [
    `/api/orders/${encodeURIComponent(orderId)}`,
    `/api/order/${encodeURIComponent(orderId)}`,
    `/api/orders?id=${encodeURIComponent(orderId)}`,
    `/api/order?id=${encodeURIComponent(orderId)}`,
  ];

  for (const u of urls) {
    try {
      const o = await tryJson(u);
      if (o) return o;
    } catch {
      /* continue */
    }
  }
  return null; // detail endpoint not available yet
}

/* -------------- Local snapshot helpers -------------- */
function readSnapshot(orderId: string): Order | null {
  // 1) persistent order:<id>
  try {
    const raw = localStorage.getItem(`order:${orderId}`);
    if (raw) {
      const o = JSON.parse(raw);
      return {
        id: String(o.id ?? orderId),
        status: o.status ?? "placed",
        createdAt: o.createdAt ?? new Date().toISOString(),
        items: (o.items ?? []).map((i: any, idx: number) => ({
          productId: Number(i?.productId ?? idx + 1) || idx + 1,
          name: String(i?.name ?? `Item ${idx + 1}`),
          imageUrl: i?.imageUrl ?? null,
          priceKobo:
            typeof i?.priceKobo === "number"
              ? i.priceKobo
              : Number(i?.priceKobo) || 0,
          qty: Number(i?.qty ?? 0) || 0,
        })),
        subtotalKobo: typeof o?.subtotalKobo === "number" ? o.subtotalKobo : 0,
        taxKobo: typeof o?.taxKobo === "number" ? o.taxKobo : 0,
        totalKobo: typeof o?.totalKobo === "number" ? o.totalKobo : 0,
      };
    }
  } catch {}

  // 2) lastOrderSnapshot (session)
  try {
    const raw = sessionStorage.getItem("lastOrderSnapshot");
    if (raw) {
      const snap = JSON.parse(raw);
      return {
        id: String(snap?.id ?? orderId),
        status: snap?.status ?? "placed",
        createdAt: snap?.createdAt ?? new Date().toISOString(),
        items: (snap?.items ?? []).map((i: any, idx: number) => ({
          productId: Number(i?.productId ?? idx + 1) || idx + 1,
          name: String(i?.name ?? `Item ${idx + 1}`),
          imageUrl: i?.imageUrl ?? null,
          priceKobo:
            typeof i?.priceKobo === "number"
              ? i.priceKobo
              : Number(i?.priceKobo) || 0,
          qty: Number(i?.qty ?? 0) || 0,
        })),
        subtotalKobo:
          typeof snap?.subtotalKobo === "number" ? snap.subtotalKobo : 0,
        taxKobo: typeof snap?.taxKobo === "number" ? snap.taxKobo : 0,
        totalKobo: typeof snap?.totalKobo === "number" ? snap.totalKobo : 0,
      };
    }
  } catch {}

  return null;
}

function persistOrderLocal(o: Order) {
  try {
    localStorage.setItem(`order:${o.id}`, JSON.stringify(o));
    const raw = localStorage.getItem("orders");
    const list = raw ? (JSON.parse(raw) as any[]) : [];
    const next = [o, ...list.filter((x) => String(x.id) !== String(o.id))];
    localStorage.setItem("orders", JSON.stringify(next.slice(0, 50)));
  } catch {
    // ignore storage errors
  }
}

/* -------------- Minimal inline styles -------------- */
const ui = {
  page: { padding: "24px 0" },
  hero: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    background: "var(--brand,#10b981)",
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  shell: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 24,
  } as React.CSSProperties,
  panel: {
    background: "#fff",
    border: "1px solid var(--border)",
    borderRadius: 14,
    overflow: "hidden",
  },
  head: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
  },
  pad: { padding: 16 },
  muted: { color: "var(--muted)" },
  itemsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 220px",
    gap: 12,
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid var(--border)",
  } as React.CSSProperties,
  info: { display: "flex", gap: 12, alignItems: "center", minWidth: 0 },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    objectFit: "cover",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },
  title: {
    fontWeight: 700,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  money: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    justifyItems: "end",
  } as React.CSSProperties,
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  hr: { height: 1, background: "var(--border)", margin: "12px 0 16px" },
  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 14,
  },
  ghostBtn: {
    height: 42,
    borderRadius: 12,
    background: "#fff",
    border: "1px solid var(--brand,#10b981)",
    color: "var(--brand,#10b981)",
    fontWeight: 700,
    cursor: "pointer",
  },
  filledBtn: {
    height: 42,
    borderRadius: 12,
    background: "var(--brand,#10b981)",
    color: "#fff",
    border: "none",
    fontWeight: 700,
    cursor: "pointer",
  },
} satisfies Record<string, React.CSSProperties>;

/* -------------- Component -------------- */
export default function CheckoutSuccess() {
  const [sp] = useSearchParams();
  const orderId = sp.get("orderId") || "";
  const nav = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const goCatalog = () => nav("/catalog");
  const goOrders = () => nav("/confirmation");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        if (!orderId) throw new Error("No orderId in URL");
        const remote = await fetchOrder(orderId);
        if (!mounted) return;
        if (remote) {
          setOrder(remote);
          persistOrderLocal(remote);
          return;
        }
        const snap = readSnapshot(orderId);
        if (snap) {
          setOrder(snap);
          persistOrderLocal(snap);
          return;
        }
        setError("Order details aren’t available yet.");
      } catch {
        const snap = readSnapshot(orderId);
        if (mounted && snap) {
          setOrder(snap);
          persistOrderLocal(snap);
        } else if (mounted) {
          setError("Order details aren’t available yet.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const itemCount = useMemo(
    () => order?.items?.reduce((n, it) => n + (it.qty || 0), 0) || 0,
    [order]
  );

  const totals = useMemo(() => {
    if (!order) return { subtotal: 0, vat: 0, total: 0 };
    const subtotal =
      typeof order.subtotalKobo === "number"
        ? order.subtotalKobo
        : order.items.reduce((sum, it) => {
            const unit = typeof it.priceKobo === "number" ? it.priceKobo : 0;
            return sum + unit * (it.qty || 0);
          }, 0);
    const vat =
      typeof order.taxKobo === "number"
        ? order.taxKobo
        : Math.round(subtotal * 0.075);
    const total =
      typeof order.totalKobo === "number" ? order.totalKobo : subtotal + vat;
    return { subtotal, vat, total };
  }, [order]);

  const dateStr = order?.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div className="container" style={ui.page}>
      {/* Hero */}
      <div style={ui.hero}>
        <div style={ui.icon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              d="M20 6L9 17l-5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "clamp(20px,2.6vw,28px)" }}>
            Order confirmed
          </h1>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Order <strong>#{orderId || "—"}</strong>
            {order?.status ? ` • ${order.status}` : ""} • {dateStr}
          </p>
        </div>
      </div>

      <div style={ui.shell}>
        {/* Items panel */}
        <section style={ui.panel} aria-label="Order items">
          <div style={ui.head}>
            <h3 style={{ margin: 0 }}>Items</h3>
            <span style={ui.muted}>
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>

          {loading && <div style={ui.pad}>Loading…</div>}

          {!loading && error && !order && (
            <div style={{ ...ui.pad, color: "#b91c1c" }}>
              {error} — you can still return to the catalog.
            </div>
          )}

          {!loading && order && order.items.length === 0 && (
            <div style={ui.pad}>No items found for this order.</div>
          )}

          {!loading && order && order.items.length > 0 && (
            <div>
              {order.items.map((it) => {
                const unit =
                  typeof it.priceKobo === "number" ? it.priceKobo : 0;
                const line = unit * (it.qty || 0);
                return (
                  <div key={`${it.productId}-${it.name}`} style={ui.itemsRow}>
                    <div style={ui.info}>
                      <img
                        style={ui.thumb}
                        src={it.imageUrl || "/placeholder.png"}
                        alt=""
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={ui.title}>{it.name}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          Qty {it.qty || 0}
                        </div>
                      </div>
                    </div>
                    <div style={ui.money}>
                      <div style={{ fontWeight: 600 }}>
                        <SafePrice kobo={unit} />
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        <SafePrice kobo={line} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Summary panel */}
        <aside style={ui.panel} aria-label="Order summary">
          <div style={ui.pad}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Summary</h3>

            <div style={ui.row}>
              <span>Subtotal</span>
              <strong>
                <SafePrice kobo={totals.subtotal} />
              </strong>
            </div>
            <div style={ui.row}>
              <span>VAT (7.5%)</span>
              <strong>
                <SafePrice kobo={totals.vat} />
              </strong>
            </div>
            <div style={ui.hr} />
            <div style={{ ...ui.row, fontSize: 18 }}>
              <strong>Total</strong>
              <strong>
                <SafePrice kobo={totals.total} />
              </strong>
            </div>

            <div style={ui.actions}>
              <button type="button" style={ui.ghostBtn} onClick={goCatalog}>
                Continue Shopping
              </button>
              <button type="button" style={ui.filledBtn} onClick={goOrders}>
                View Orders
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
