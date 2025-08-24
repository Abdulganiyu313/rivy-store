import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProduct, type Product } from "../api";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import SafePrice from "../components/SafePrice";
import { useCartStore } from "../stores/useCart";
import { toast } from "../hooks/useToast";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [p, setP] = useState<Product | null>(null);
  const [err, setErr] = useState<Error | null>(null);
  const add = useCartStore((s) => s.add);

  useEffect(() => {
    if (!id) return;
    fetchProduct(Number(id)).then(setP).catch(setErr);
  }, [id]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/catalog");
    }
  };

  const handleAdd = () => {
    if (!p) return;
    add(p, 1);
    toast.success(`Added ${p.name} to cart`);
  };

  if (err) {
    return (
      <div className="container" style={{ padding: "24px 0" }}>
        <ErrorMessage error={err} />
      </div>
    );
  }
  if (!p) return <Loader full />;

  return (
    <div className="container" style={{ padding: "24px 0" }}>
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to previous page"
          style={{
            padding: "6px 10px",
            fontSize: 14,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <img src={p.imageUrl || "/placeholder.png"} alt={p.name} />
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h1 style={{ marginTop: 0 }}>{p.name}</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <strong style={{ fontSize: 20 }}>
              <SafePrice kobo={p.priceKobo ?? 0} />
            </strong>
            {p.financingEligible && (
              <span className="badge">Financing eligible</span>
            )}
          </div>
          <p style={{ color: "var(--muted)" }}>
            {p.description || "No description provided."}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn primary"
              onClick={handleAdd}
              aria-label={`Add ${p.name} to cart`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
