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

/** Deterministic seed from id */
function seedFrom(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h << 5) + h + str.charCodeAt(i);
  return h >>> 0;
}
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function ProductCard({ product, view = "grid", onAdd }: Props) {
  const list = view === "list";
  const descId = `pdesc-${product.id}`;
  const add = useCartStore((s) => s.add);

  // deterministic “random” payment type; stock from product
  const idSeed = seedFrom(String((product as any)?.id ?? product.name ?? ""));
  const rand = mulberry32(idSeed);
  const paymentType: "Instalmental" | "Full payment" =
    rand() < 0.5 ? "Instalmental" : "Full payment";

  const inStock = Number((product as any).stock ?? 0) > 0;

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
          {/* Payment type */}
          <span
            className={`${styles.badge} ${styles.badgeSolid}`}
            aria-label={`${paymentType} payment type`}
          >
            {paymentType}
          </span>

          {/* In stock (only if true) */}
          {inStock && (
            <span
              className={`${styles.badge} ${styles.badgeSolid}`}
              aria-label="In Stock"
            >
              In Stock
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
