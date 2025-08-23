// path: web/src/components/ProductCard.tsx
import React from "react";
import { type Product } from "../api";

type Props = { product: Product; view?: "grid" | "list" };

const cardBase: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#fff",
  overflow: "hidden",
  display: "grid",
  gridTemplateRows: "auto 1fr",
};

const cardList: React.CSSProperties = {
  gridTemplateColumns: "160px 1fr",
  gridTemplateRows: "auto",
};

const mediaImg: React.CSSProperties = {
  width: "100%",
  aspectRatio: "4 / 3",
  objectFit: "cover",
  display: "block",
};

const body: React.CSSProperties = { padding: 10, display: "grid", gap: 8 };
const title: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.3,
  fontWeight: 600,
};
const badges: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};
const badge: React.CSSProperties = {
  fontSize: 12,
  border: "1px solid #e5e7eb",
  padding: "2px 6px",
  borderRadius: 999,
};
const badgeAlt: React.CSSProperties = {
  ...badge,
  background: "#eefdf6",
  borderColor: "#10b981",
};
const meta: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 13,
  color: "#6b7280",
};
const actions: React.CSSProperties = { display: "flex", gap: 8 };

const fmtNaira = (kobo?: number | null) =>
  typeof kobo === "number" && !Number.isNaN(kobo)
    ? `₦${(kobo / 100).toLocaleString()}`
    : "—";

export default function ProductCard({ product, view = "grid" }: Props) {
  const list = view === "list";
  return (
    <li style={{ ...cardBase, ...(list ? cardList : {}) }}>
      <div>
        <img
          style={mediaImg}
          src={product.imageUrl || "https://picsum.photos/seed/x/640/480"}
          alt={product.name}
        />
      </div>
      <div style={body}>
        <h3 style={title}>{product.name}</h3>
        <div style={badges}>
          {product.stock > 0 && <span style={badge}>In Stock</span>}
          {product.financingEligible && <span style={badgeAlt}>Financing</span>}
        </div>
        <div style={meta}>
          <span>{fmtNaira(product.priceKobo)}</span>
          <span>Min. order: {product.minOrder || 1} unit</span>
        </div>
        <div style={actions}>
          <button className="btn btn--primary btn-sm">Add</button>
          <a className="btn btn--ghost btn-sm" href={`/p/${product.id}`}>
            View
          </a>
        </div>
      </div>
    </li>
  );
}
