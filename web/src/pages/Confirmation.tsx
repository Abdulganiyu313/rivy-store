import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SafePrice from "../components/SafePrice";
import { fetchOrders, OrderSummary } from "../api";

export default function ConfirmationPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<OrderSummary[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    fetchOrders({ page: 1, limit: 20 })
      .then(({ data, total }) => {
        if (!alive) return;
        setItems(data);
        setTotal(total);
      })
      .catch((e: any) => {
        if (!alive) return;
        setErr(e?.message || "Failed to load orders");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const title = useMemo(() => "Orders", []);
  const ordersCountLabel = useMemo(
    () => `${total} ${total === 1 ? "order" : "orders"}`,
    [total]
  );

  return (
    <div className="container" style={{ padding: "24px 0" }}>
      <button
        type="button"
        className="btn"
        onClick={() => (window.history.length > 1 ? nav(-1) : nav("/catalog"))}
        aria-label="Go back"
        style={{ marginBottom: 16 }}
      >
        ← Back
      </button>

      <h1 style={{ marginTop: 0 }}>{title}</h1>

      <div
        className="card"
        style={{
          padding: 0,
          border: "1px solid var(--border, #e5e7eb)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid var(--border, #e5e7eb)",
          }}
        >
          <strong>Recent Orders</strong>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: "var(--muted, #6b7280)" }}>
              {ordersCountLabel}
            </span>
            <button
              className="btn btn--ghost"
              onClick={() => {
                const blob = new Blob([JSON.stringify(items, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "orders.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export JSON
            </button>
          </div>
        </div>

        <div style={{ padding: 16 }}>
          {loading && <div>Loading orders…</div>}

          {err && (
            <div style={{ color: "crimson" }}>
              {err} — please try again shortly.
            </div>
          )}

          {!loading && !err && items.length === 0 && (
            <div style={{ color: "var(--muted, #6b7280)" }}>
              You don’t have any orders yet.
            </div>
          )}

          {!loading && !err && items.length > 0 && (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {items.map((o) => (
                <li
                  key={o.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr auto",
                    gap: 12,
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>Order #{o.id}</div>
                    <div style={{ color: "var(--muted, #6b7280)" }}>
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "var(--muted, #6b7280)" }}>Status</div>
                    <strong>{o.status}</strong>
                  </div>
                  <div>
                    <div style={{ color: "var(--muted, #6b7280)" }}>Total</div>
                    <strong>
                      <SafePrice kobo={o.totalKobo ?? 0} />
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      className="btn primary"
                      onClick={() =>
                        nav(
                          `/checkout-success?orderId=${encodeURIComponent(
                            o.id
                          )}`
                        )
                      }
                    >
                      View
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
