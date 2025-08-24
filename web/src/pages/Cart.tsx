import { useNavigate } from "react-router-dom";
import { checkout } from "../api";
import SafePrice from "../components/SafePrice";
import { useCartStore } from "../stores/useCart";
import { toast } from "../hooks/useToast";
import styles from "./Cart.module.css";

export default function Cart() {
  const { items, remove, setQty, totalKobo, clear } = useCartStore();
  const nav = useNavigate();

  const goOrders = () => nav("/confirmation");
  const goCatalog = () => nav("/catalog");

  // ---- compute summary (subtotal + VAT + total) ----
  const subtotalKobo = totalKobo();
  const vatKobo = Math.round(subtotalKobo * 0.075);
  const grandTotalKobo = subtotalKobo + vatKobo;

  const doCheckout = async () => {
    if (!items.length) return;

    const simulatePayment = async (): Promise<"success" | "fail"> => {
      await new Promise((r) => setTimeout(r, 900));
      return Math.random() < 0.85 ? "success" : "fail";
    };

    const payment = await simulatePayment();
    if (payment !== "success") {
      toast.error("Payment failed (simulated). Please try again.");
      return;
    }

    const safe = (n?: number | null) =>
      typeof n === "number" && !Number.isNaN(n) ? n : 0;

    const snapshotItems = items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      imageUrl: i.product.imageUrl,
      priceKobo: safe(i.product.priceKobo),
      qty: i.qty,
    }));

    const baseSnapshot = {
      createdAt: new Date().toISOString(),
      status: "placed",
      items: snapshotItems,
      subtotalKobo,
      taxKobo: vatKobo,
      totalKobo: grandTotalKobo,
    };
    try {
      sessionStorage.setItem("lastOrderSnapshot", JSON.stringify(baseSnapshot));
    } catch {}

    try {
      const res = await checkout({
        items: items.map((i) => ({ productId: i.product.id, qty: i.qty })),
      });
      const orderId = String(res.orderId);

      // persist locally for /confirmation & success
      try {
        const fullOrder = { id: orderId, ...baseSnapshot };
        localStorage.setItem(`order:${orderId}`, JSON.stringify(fullOrder));
        const listRaw = localStorage.getItem("orders");
        const list = listRaw ? (JSON.parse(listRaw) as any[]) : [];
        const next = [
          fullOrder,
          ...list.filter((o) => String(o.id) !== orderId),
        ];
        localStorage.setItem("orders", JSON.stringify(next.slice(0, 50)));
        sessionStorage.setItem(
          "lastOrderSnapshot",
          JSON.stringify({ id: orderId, ...baseSnapshot })
        );
      } catch {}

      toast.success("Order placed!");
      clear();
      nav(`/checkout-success?orderId=${encodeURIComponent(orderId)}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Checkout failed";
      toast.error(msg);
    }
  };

  return (
    <div className="container" style={{ padding: "24px 0" }}>
      <h1>Cart</h1>

      {items.length === 0 ? (
        <div className="card" style={{ padding: 16 }}>
          <p style={{ marginTop: 0, marginBottom: 12 }}>Your cart is empty.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className={styles.ghostBtn} onClick={goCatalog}>
              Continue Shopping
            </button>
            <button className={styles.primaryBtn} onClick={goOrders}>
              View Orders
            </button>
          </div>
        </div>
      ) : (
        // two columns: items (left) + summary (right)
        <div
          className="grid"
          style={{
            gridTemplateColumns: "minmax(0, 1fr) 360px",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* ITEMS */}
          <div className="card" style={{ padding: 0 }}>
            {items.map((i) => {
              const unit =
                typeof i.product.priceKobo === "number"
                  ? i.product.priceKobo
                  : 0;
              const lineTotal = unit * i.qty;

              const dec = () => setQty(i.product.id, Math.max(1, i.qty - 1));
              const inc = () => setQty(i.product.id, i.qty + 1);

              return (
                <div
                  key={i.product.id}
                  className={styles.itemsRow}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 110px 150px 120px 90px", // info | unit | qty | line | remove
                    gap: 12,
                    alignItems: "center",
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {/* info */}
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      minWidth: 0,
                    }}
                  >
                    <img
                      src={i.product.imageUrl || "/placeholder.png"}
                      alt=""
                      width={64}
                      height={64}
                      style={{ borderRadius: 8, objectFit: "cover" }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {i.product.name}
                      </div>
                      <div className={`badge ${styles.muted}`}>
                        {i.product.financingEligible ? "Financing" : "Standard"}
                      </div>
                    </div>
                  </div>

                  {/* unit price */}
                  <div style={{ fontWeight: 600 }}>
                    <SafePrice kobo={unit} />
                  </div>

                  {/* qty controls */}
                  <div>
                    <div
                      className={styles.qtyWrap}
                      role="group"
                      aria-label={`Quantity for ${i.product.name}`}
                    >
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={dec}
                        aria-label={`Decrease ${i.product.name} quantity`}
                        disabled={i.qty <= 1}
                      >
                        –
                      </button>
                      <span className={styles.qtyVal} aria-live="polite">
                        {i.qty}
                      </span>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={inc}
                        aria-label={`Increase ${i.product.name} quantity`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* line total */}
                  <div style={{ fontWeight: 700, textAlign: "right" }}>
                    <SafePrice kobo={lineTotal} />
                  </div>

                  {/* remove */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      className="btn"
                      onClick={() => remove(i.product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SUMMARY */}
          <aside className="card" style={{ padding: 16 }}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Order Summary</h3>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span>Subtotal</span>
              <strong>
                <SafePrice kobo={subtotalKobo} />
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span>VAT (7.5%)</span>
              <strong>
                <SafePrice kobo={vatKobo} />
              </strong>
            </div>

            <div
              style={{
                height: 1,
                background: "var(--border)",
                margin: "10px 0",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
                fontSize: 18,
              }}
            >
              <strong>Total</strong>
              <strong>
                <SafePrice kobo={grandTotalKobo} />
              </strong>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <button className={styles.ghostBtn} onClick={goOrders}>
                View Orders
              </button>
              <button className={styles.primaryBtn} onClick={doCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
