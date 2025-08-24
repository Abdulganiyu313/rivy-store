import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import type { Product } from "../api";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import SafePrice from "../components/SafePrice";
import { useCartStore } from "../stores/useCart";

export default function ProductPage() {
  const { id } = useParams();
  const [p, setP] = useState<Product | null>(null);
  const [err, setErr] = useState<Error | null>(null);
  const add = useCartStore((s) => s.add);

  useEffect(() => {
    let cancel = false;
    api.getProduct(Number(id)).then(setP).catch(setErr);
    return () => {
      cancel = true;
    };
  }, [id]);

  if (err)
    return (
      <div className="container" style={{ padding: "24px 0" }}>
        <ErrorMessage error={err} />
      </div>
    );
  if (!p) return <Loader full />;

  return (
    <div className="container" style={{ padding: "24px 0" }}>
      <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <img src={p.imageUrl || "/placeholder.png"} alt="" />
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h1 style={{ marginTop: 0 }}>{p.name}</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <strong style={{ fontSize: 20 }}>
              <SafePrice kobo={p.priceKobo} />
            </strong>
            {p.financingEligible && (
              <span className="badge">Financing eligible</span>
            )}
          </div>
          <p style={{ color: "var(--muted)" }}>
            {p.description || "No description provided."}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn primary" onClick={() => add(p, 1)}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
