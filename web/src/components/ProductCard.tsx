import { Link } from "react-router-dom";

export default function ProductCard({ p }: { p: any }) {
  return (
    <li className="card">
      <div className="thumb">
        <img
          src={p.imageUrl || "https://via.placeholder.com/600x400"}
          alt={p.name}
        />
      </div>
      <div className="body">
        <h3 className="title">{p.name}</h3>
        <p className="desc">
          {(p.description || "").slice(0, 85)}
          {(p.description || "").length > 85 ? "…" : ""}
        </p>
        <div className="meta">
          <span className="price">₦{(p.price / 100).toLocaleString()}</span>
          <span className="min">Min. order: 1 units</span>
        </div>
      </div>
      <div className="actions">
        <Link to={`/product/${p.id}`}>View</Link>
      </div>
    </li>
  );
}
