import { useSearchParams, Link } from "react-router-dom";

export default function CheckoutSuccess() {
  const [sp] = useSearchParams();
  const orderId = sp.get("orderId");
  return (
    <div className="container" style={{ padding: "24px 0" }}>
      <div className="card" style={{ padding: 24, textAlign: "center" }}>
        <h1>Thank you!</h1>
        <p>Your order has been placed successfully.</p>
        {orderId && (
          <p style={{ color: "var(--muted)" }}>
            Order ID: <strong>{orderId}</strong>
          </p>
        )}
        <Link to="/catalog" className="btn">
          Back to Catalog
        </Link>
      </div>
    </div>
  );
}
