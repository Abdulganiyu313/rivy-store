import { useEffect, useState } from "react";
import { getProduct } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";

export default function Product() {
  const { id } = useParams();
  const [p, setP] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const { add } = useCart();

  useEffect(()=>{ (async()=>{
    try { setLoading(true); const res = await getProduct(Number(id)); setP(res.data); setErr(""); }
    catch(e:any){ setErr(e.message || "Failed"); }
    finally{ setLoading(false); }
  })(); },[id]);

  if (loading) return <p>Loading…</p>;
  if (err) return <p role="alert">Error: {err}</p>;
  if (!p) return <p>Not found</p>;

  return (
    <div>
      <button onClick={()=>nav(-1)}>← Back</button>
      <h1>{p.name}</h1>
      <img src={p.imageUrl || "https://via.placeholder.com/600x300"} alt={p.name} style={{ maxWidth: "100%" }}/>
      <p>₦{(p.price/100).toLocaleString()}</p>
      <p>{p.description}</p>
      <label>Qty <input type="number" min={1} value={qty} onChange={e=>setQty(Number(e.target.value))}/></label>{" "}
      <button onClick={()=>{
        add({ productId: p.id, name: p.name, unitPrice: p.price, quantity: qty });
        nav("/cart");
      }}>Add to Cart</button>
    </div>
  );
}
