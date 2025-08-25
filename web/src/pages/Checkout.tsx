import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { checkout } from "../api";
import SafePrice from "../components/SafePrice";
import { useCartStore } from "../stores/useCart";
import { toast } from "../hooks/useToast";

const VAT_RATE = 0.075;

export default function Checkout() {
  const nav = useNavigate();
  const { items, totalKobo, clear } = useCartStore();

  const { subtotalKobo, vatKobo, grandTotalKobo, itemCount } = useMemo(() => {
    const raw = totalKobo();
    const subtotal = Number.isFinite(raw)
      ? (raw as number)
      : items.reduce((sum, i) => {
          const unit =
            typeof i.product.priceKobo === "number" ? i.product.priceKobo : 0;
          return sum + unit * i.qty;
        }, 0);
    const vat = Math.round(subtotal * VAT_RATE);
    return {
      subtotalKobo: subtotal,
      vatKobo: vat,
      grandTotalKobo: subtotal + vat,
      itemCount: items.reduce((n, it) => n + it.qty, 0),
    };
  }, [items, totalKobo]);

  const placeOrder = async () => {
    if (!items.length) return;
    try {
      const res = await checkout({
        items: items.map((i) => ({ productId: i.product.id, qty: i.qty })),
      });
      toast.success("Order placed!");
      clear();
      nav(`/checkout-success?orderId=${encodeURIComponent(res.orderId)}`);
    } catch (e: any) {
      toast.error(e?.message || "Checkout failed");
    }
  };

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) nav(-1);
    else nav("/cart");
  };

  return (
    <div className="container" style={{ padding: "24px 0" }}>
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          style={{
            padding: "8px 12px",
            fontSize: 14,
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </div>

      <h1 style={{ marginTop: 0 }}>Review & Checkout</h1>

      {items.length === 0 ? (
        <div className="card" style={{ padding: 16 }}>
          Your cart is empty.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 24,
          }}
        >
          {/* Cart details */}
          <section
            style={{
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {items.map((i) => {
              const unit =
                typeof i.product.priceKobo === "number"
                  ? i.product.priceKobo
                  : 0;
              const line = unit * i.qty;
              return (
                <div
                  key={i.product.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 140px 140px",
                    gap: 12,
                    alignItems: "center",
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
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
                      width={56}
                      height={56}
                      style={{ borderRadius: 10, objectFit: "cover" }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {i.product.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        Qty {i.qty}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, justifySelf: "end" }}>
                    <SafePrice kobo={unit} />
                  </div>
                  <div style={{ fontWeight: 600, justifySelf: "end" }}>
                    <SafePrice kobo={line} />
                  </div>
                </div>
              );
            })}
          </section>

          {/* Summary */}
          <aside
            aria-label="Order summary"
            style={{
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 16,
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Order Summary</h3>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span>Subtotal</span>
              <span style={{ color: "var(--muted)" }}>
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span />
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
                margin: "12px 0 16px",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <strong>Total</strong>
              <strong>
                <SafePrice kobo={grandTotalKobo} />
              </strong>
            </div>

            <button
              type="button"
              onClick={placeOrder}
              className="btn primary"
              style={{
                width: "100%",
                height: 46,
                borderRadius: 12,
                fontWeight: 700,
              }}
            >
              Place Order
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
