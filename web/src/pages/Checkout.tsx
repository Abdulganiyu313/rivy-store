import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { createOrder } from "../api";

export default function Checkout() {
  const { items, clear } = useCart();
  const nav = useNavigate();

  if (!items.length) return <p>Your cart is empty.</p>;

  const submit = async () => {
    const body = { items: items.map(i=>({ productId: i.productId, quantity: i.quantity })) };
    const res = await createOrder(body);
    clear();
    nav(`/order/${res.data.id}`);
  };

  return (
    <div>
      <h1>Checkout</h1>
      <p>Review your items and place order.</p>
      <button onClick={submit}>Place Order</button>
    </div>
  );
}
