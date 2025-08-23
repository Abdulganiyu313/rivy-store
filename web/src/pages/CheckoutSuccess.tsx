import { useLocation, Link } from "react-router-dom";
import "./checkout.css";

export default function CheckoutSuccessPage() {
  const usp = new URLSearchParams(useLocation().search);
  const orderId = usp.get("orderId");

  return (
    <div className="checkout-success">
      <h1>Thank you!</h1>
      <p>Your order has been placed successfully.</p>
      {orderId && (
        <p className="order-id">
          Order ID: <strong>{orderId}</strong>
        </p>
      )}
      <Link to="/" className="btn">
        Continue shopping
      </Link>
    </div>
  );
}
