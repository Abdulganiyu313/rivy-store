import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SafePrice from "../components/SafePrice";
import styles from "./Confirmation.module.css";

type OrderItem = {
  productId: number;
  name?: string;
  priceKobo?: number | null;
  qty: number;
  imageUrl?: string | null;
};

type OrderSummary = {
  id: string | number;
  status?: string;
  createdAt?: string;
  subtotalKobo?: number | null;
  taxKobo?: number | null;
  totalKobo?: number | null;
  items?: OrderItem[];
};

async function fetchOrdersServer(): Promise<OrderSummary[]> {
  const res = await fetch("/api/orders", {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (res.status === 404) return []; // backend not implemented in some envs
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function readOrdersLocal(): OrderSummary[] {
  try {
    const raw = localStorage.getItem("orders");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function computeTotal(order: OrderSummary) {
  const subtotal =
    typeof order.subtotalKobo === "number"
      ? order.subtotalKobo
      : (order.items ?? []).reduce((sum, it) => {
          const unit =
            typeof it.priceKobo === "number" && !Number.isNaN(it.priceKobo)
              ? it.priceKobo
              : 0;
          return sum + unit * (it.qty || 0);
        }, 0);
  const vat =
    typeof order.taxKobo === "number"
      ? order.taxKobo
      : Math.round(subtotal * 0.075);
  const total =
    typeof order.totalKobo === "number" ? order.totalKobo : subtotal + vat;
  return { subtotal, vat, total };
}

function copyOrderLink(id: string | number) {
  const url = `${
    window.location.origin
  }/checkout-success?orderId=${encodeURIComponent(String(id))}`;
  navigator.clipboard?.writeText(url).catch(() => {});
}

function exportOrdersJSON(orders: any[]) {
  const blob = new Blob([JSON.stringify(orders, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "orders.json";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Confirmation() {
  const nav = useNavigate();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const server = await fetchOrdersServer().catch(() => []);
        const local = readOrdersLocal();

        // merge & de-dupe by id; prefer server records when both exist
        const map = new Map<string, OrderSummary>();
        for (const o of [...local, ...server]) {
          map.set(String(o.id), o);
        }
        const merged = Array.from(map.values());

        // sort by createdAt desc (fallback: numeric id desc)
        merged.sort((a, b) => {
          const da = a.createdAt ? +new Date(a.createdAt) : NaN;
          const db = b.createdAt ? +new Date(b.createdAt) : NaN;
          if (!Number.isNaN(db) && !Number.isNaN(da)) return db - da;
          const ia = Number(a.id);
          const ib = Number(b.id);
          return Number.isFinite(ib) && Number.isFinite(ia) ? ib - ia : 0;
        });

        if (mounted) setOrders(merged);
      } catch (e: unknown) {
        if (mounted)
          setErr(e instanceof Error ? e.message : "Failed to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) nav(-1);
    else nav("/catalog");
  };

  return (
    <div className="container">
      <div className={styles.page}>
        {/* Back */}
        <div className={styles.backRow}>
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className={styles.backBtn}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15 18l-6-6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
        </div>

        <h1 style={{ marginTop: 0 }}>Orders</h1>

        {/* optional tools */}
        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.ghostSm}
            onClick={() => exportOrdersJSON(orders)}
            aria-label="Export orders JSON"
          >
            Export JSON
          </button>
        </div>

        <section className={styles.panel} aria-label="Orders list">
          <div className={styles.sectionHead}>
            <strong>Recent Orders</strong>
            <span className={styles.muted}>
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          </div>

          {loading && <div className={styles.pad}>Loading…</div>}

          {err && (
            <div className={`${styles.pad} ${styles.error}`}>
              {err}. Please try again shortly.
            </div>
          )}

          {!loading && !err && orders.length === 0 && (
            <div className={styles.pad}>You don’t have any orders yet.</div>
          )}

          {!loading &&
            !err &&
            orders.length > 0 &&
            orders.map((o) => {
              const d = o.createdAt ? new Date(o.createdAt) : null;
              const { total } = computeTotal(o);
              const orderHref = `/checkout-success?orderId=${encodeURIComponent(
                String(o.id)
              )}`;

              return (
                <div key={String(o.id)} className={styles.row}>
                  <div className={styles.info}>
                    <div className={styles.title}>
                      <Link to={orderHref} aria-label={`Open order #${o.id}`}>
                        Order #{o.id}
                      </Link>
                      {o.status ? (
                        <span className={styles.pill}>{o.status}</span>
                      ) : null}
                    </div>
                    <div className={styles.muted}>
                      {d ? d.toLocaleString() : "—"}
                    </div>
                  </div>

                  <div className={styles.total}>
                    <SafePrice kobo={total} />
                  </div>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={() => copyOrderLink(o.id)}
                      aria-label={`Copy link to order #${o.id}`}
                    >
                      Copy link
                    </button>
                    <Link className={styles.viewBtn} to={orderHref}>
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
        </section>
      </div>
    </div>
  );
}
