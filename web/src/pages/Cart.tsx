import { useCartStore } from "../stores/useCart";
import SafePrice from "../components/SafePrice";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { items, remove, setQty, totalKobo, clear } = useCartStore();
  const nav = useNavigate();

  const checkout = async () => {
    const payload = {
      items: items.map((i) => ({ productId: i.product.id, qty: i.qty })),
    };
    try {
      const res = await api.checkout(payload);
      clear();
      nav(`/checkout-success?orderId=${encodeURIComponent(res.orderId)}`);
    } catch (e: any) {
      alert(e.message || "Checkout failed");
    }
  };

  return (
    <div className="container" style={{ padding: "24px 0" }}>
      <h1>Cart</h1>
      {items.length === 0 ? (
        <div className="card" style={{ padding: 16 }}>
          Your cart is empty.
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 16 }}>
          <div className="card" style={{ padding: 0 }}>
            {items.map((i) => (
              <div
                key={i.product.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 100px 100px",
                  gap: 12,
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <img
                    src={i.product.imageUrl || "/placeholder.png"}
                    alt=""
                    width={64}
                    height={64}
                    style={{ borderRadius: 8 }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{i.product.name}</div>
                    <div className="badge">
                      {i.product.financingEligible ? "Financing" : "Standard"}
                    </div>
                  </div>
                </div>
                <div>
                  <SafePrice kobo={i.product.priceKobo} />
                </div>
                <div>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={i.qty}
                    onChange={(e) =>
                      setQty(i.product.id, Math.max(1, Number(e.target.value)))
                    }
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button className="btn" onClick={() => remove(i.product.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span>Subtotal</span>
              <strong>
                <SafePrice kobo={totalKobo()} />
              </strong>
            </div>
            <button
              className="btn primary"
              onClick={checkout}
              aria-label="Proceed to checkout"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
