import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet } from "../api";
import { useCart } from "../hooks/useCart";

type Product = {
  id: string;
  name: string;
  description?: string;
  priceKobo: number;
  minOrder: number;
  stock: number;
  images?: string[];
  imageUrl?: string;
};

const money = (k: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    k / 100
  );

export default function ProductPage() {
  const { id } = useParams();
  const [p, setP] = useState<Product | null>(null);
  const [qty, setQty] = useState(0);
  const [loading, setLoading] = useState(false);
  const add = useCart((s) => s.add);
  const nav = useNavigate();

  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    apiGet<Product>(`/products/${id}`, c.signal)
      .then((prod) => {
        setP(prod);
        setQty(prod.minOrder);
      })
      .finally(() => setLoading(false));
    return () => c.abort();
  }, [id]);

  if (loading || !p) return <div className="loading">Loading…</div>;

  const step = p.minOrder;
  const max = p.stock - (p.stock % step);
  const canAdd = p.stock >= p.minOrder;
  const img = p.images?.[0] || p.imageUrl || "/vite.svg";

  return (
    <div className="pdp">
      <img
        className="hero"
        src={img}
        onError={(e) =>
          ((e.currentTarget as HTMLImageElement).src = "/vite.svg")
        }
      />
      <div className="info">
        <h1>{p.name}</h1>
        <p className="price">{money(p.priceKobo)}</p>
        <p className="muted">
          In stock: {p.stock} • Min. order: {p.minOrder}
        </p>

        <div className="qty">
          <button
            disabled={qty <= step}
            onClick={() => setQty((q) => Math.max(step, q - step))}
          >
            -
          </button>
          <input
            value={qty}
            onChange={(e) => {
              const raw = Number(e.target.value || 0);
              const snapped = Math.max(step, Math.round(raw / step) * step);
              setQty(Math.min(snapped, max));
            }}
          />
          <button
            disabled={qty >= max}
            onClick={() => setQty((q) => Math.min(q + step, max))}
          >
            +
          </button>
        </div>

        <button
          className="primary"
          disabled={!canAdd}
          onClick={() => {
            add(
              {
                id: p.id,
                name: p.name,
                priceKobo: p.priceKobo,
                minOrder: p.minOrder,
                stock: p.stock,
                image: img,
              },
              qty
            );
            nav("/cart");
          }}
        >
          Add to Cart
        </button>

        {p.description && <p className="desc">{p.description}</p>}
      </div>
    </div>
  );
}
