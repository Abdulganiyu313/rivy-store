import { useEffect, useState } from "react";
import { getOrder } from "../api";
import { useParams, Link } from "react-router-dom";

export default function Confirmation() {
  const { id } = useParams();
  const [o, setO] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(()=>{ (async()=>{
    try { setLoading(true); const res = await getOrder(Number(id)); setO(res.data); setErr(""); }
    catch(e:any){ setErr(e.message || "Failed"); }
    finally{ setLoading(false); }
  })(); },[id]);

  if (loading) return <p>Loading…</p>;
  if (err) return <p role="alert">Error: {err}</p>;

  return (
    <div>
      <h1>Order Confirmed</h1>
      <p>Order ID: {o.id}</p>
      <p>Total: ₦{(o.total/100).toLocaleString()}</p>
      <Link to="/">Continue shopping</Link>
    </div>
  );
}
