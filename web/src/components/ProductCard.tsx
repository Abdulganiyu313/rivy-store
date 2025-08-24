import { Link } from "react-router-dom";
import type { Product } from "../api";
import styles from "./ProductCard.module.css";

type Props = {
  product: Product;
  view?: "grid" | "list";
  onAdd?: (p: Product) => void;
};

// local price formatter (kept from your version)
const fmtNaira = (kobo?: number | null) =>
  typeof kobo === "number" && !Number.isNaN(kobo)
    ? `₦${(kobo / 100).toLocaleString()}`
    : "—";

export default function ProductCard({ product, view = "grid", onAdd }: Props) {
  const list = view === "list";

  return (
    <li
      className={`${styles.card} ${list ? styles.list : ""}`}
      data-testid="product-card"
    >
      <div className={styles.media}>
        <img
          src={product.imageUrl || "https://picsum.photos/seed/x/640/480"}
          alt={product.name}
          loading="lazy"
        />
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{product.name}</h3>

        <div className={styles.badges} aria-label="product badges">
          {(product as any).stock > 0 && (
            <span className={styles.badge}>In Stock</span>
          )}
          {product.financingEligible && (
            <span className={`${styles.badge} ${styles.badgeAlt}`}>
              Financing
            </span>
          )}
        </div>

        <div className={styles.meta}>
          <span className={styles.price}>{fmtNaira(product.priceKobo)}</span>
          <span>Min. order: {(product as any).minOrder || 1} unit</span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn--primary btn-sm"
            onClick={() => onAdd?.(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            Add
          </button>

          <Link
            className="btn btn--ghost btn-sm"
            to={`/products/${product.id}`}
            aria-label={`View ${product.name}`}
          >
            View
          </Link>
        </div>
      </div>
    </li>
  );
}
