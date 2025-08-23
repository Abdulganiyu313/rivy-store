import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { apiPost } from "../api";
import "./checkout.css";

const money = (k: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    k / 100
  );

export default function Checkout() {
  const { lines, totalKobo, clear } = useCart();
  const items = Object.values(lines);
  const nav = useNavigate();

  if (items.length === 0)
    return <div className="cart-empty">Cart is empty.</div>;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const customer = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      address: String(fd.get("address") || ""),
    };

    const payload = {
      customer,
      lines: items.map((l) => ({ productId: l.id, qty: l.qty })),
    };

    const key =
      (crypto as any)?.randomUUID?.() ||
      Math.random().toString(36).slice(2) + Date.now().toString(36);

    const res = await apiPost<{ orderId: string }>("/api/checkout", payload, {
      "Idempotency-Key": key,
    });

    clear();
    nav(`/confirmation?orderId=${res.orderId}`);
  }

  return (
    <div className="checkout">
      <h1>Checkout</h1>
      <form onSubmit={onSubmit} className="checkout-form">
        <label>
          Name
          <input name="name" required minLength={2} />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Address
          <textarea name="address" required minLength={5} />
        </label>
        <div className="summary">
          <div>Total</div>
          <strong>{money(totalKobo())}</strong>
        </div>
        <button className="primary">Place Order</button>
      </form>
    </div>
  );
}
