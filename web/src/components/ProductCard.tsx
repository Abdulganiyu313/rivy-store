import { Link } from "react-router-dom";
import type { Product } from "../api";
import styles from "./ProductCard.module.css";
import { useCartStore } from "../stores/useCart";
import { toast } from "../hooks/useToast";

type Props = {
  product: Product;
  view?: "grid" | "list";
  onAdd?: (p: Product) => void;
};

const fmtNaira = (kobo?: number | null) =>
  typeof kobo === "number" && !Number.isNaN(kobo)
    ? `₦${(kobo / 100).toLocaleString()}`
    : "—";

export default function ProductCard({ product, view = "grid", onAdd }: Props) {
  const list = view === "list";
  const descId = `pdesc-${product.id}`;
  const add = useCartStore((s) => s.add);

  const handleAdd = () => {
    if (onAdd) {
      onAdd(product);
      return;
    }
    add(product, 1);
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <li
      className={`${styles.card} ${list ? styles.list : ""}`}
      data-testid="product-card"
      aria-describedby={product.description ? descId : undefined}
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

        {product.description && (
          <p id={descId} className={styles.desc} title={product.description}>
            {product.description}
          </p>
        )}

        <div className={styles.meta}>
          <span className={styles.price}>{fmtNaira(product.priceKobo)}</span>
          <span>Min. order: {(product as any).minOrder || 1} unit</span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn--primary btn-sm"
            onClick={handleAdd}
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
