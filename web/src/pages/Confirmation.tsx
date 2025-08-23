import { Link, useLocation } from "react-router-dom";

export default function Confirmation() {
  const params = new URLSearchParams(useLocation().search);
  const orderId = params.get("orderId");
  return (
    <div className="confirm">
      <h1>Order Confirmed</h1>
      <p>
        Order ID: <strong>{orderId}</strong>
      </p>
      <Link to="/store">Back to Store</Link>
    </div>
  );
}
