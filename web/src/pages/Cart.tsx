import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";

export default function Cart() {
  const { items, updateQty, remove, subtotal, tax, total } = useCart();

  if (!items.length) return <div><h1>Cart</h1><p>Your cart is empty.</p><Link to="/">Go shopping</Link></div>;

  return (
    <div>
      <h1>Cart</h1>
      <table>
        <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th><th/></tr></thead>
        <tbody>
          {items.map(it=>(
            <tr key={it.productId}>
              <td>{it.name}</td>
              <td>₦{(it.unitPrice/100).toLocaleString()}</td>
              <td><input type="number" min={1} value={it.quantity} onChange={e=>updateQty(it.productId, Number(e.target.value))}/></td>
              <td>₦{((it.unitPrice*it.quantity)/100).toLocaleString()}</td>
              <td><button onClick={()=>remove(it.productId)}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Subtotal: ₦{(subtotal/100).toLocaleString()}</p>
      <p>Tax: ₦{(tax/100).toLocaleString()}</p>
      <p><b>Total: ₦{(total/100).toLocaleString()}</b></p>
      <Link to="/checkout"><button>Proceed to Checkout</button></Link>
    </div>
  );
}
