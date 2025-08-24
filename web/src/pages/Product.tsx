import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProduct, type Product } from "../api";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import SafePrice from "../components/SafePrice";
import { useCartStore } from "../stores/useCart";
import { toast } from "../hooks/useToast";
import styles from "./ProductPage.module.css";

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
    <div className={`container ${styles.page}`}>
      <div className={styles.topBar}>
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to previous page"
          className={styles.backBtn}
        >
          <svg
            className={styles.backIcon}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M15 18l-6-6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
      </div>

      <div className={`grid ${styles.shell}`}>
        <div className={`card ${styles.cardPad}`}>
          <img
            className={styles.media}
            src={p.imageUrl || "/placeholder.png"}
            alt={p.name}
          />
        </div>

        <div className={`card ${styles.cardPad}`}>
          <h1 className={styles.title}>{p.name}</h1>

          <div className={styles.priceRow}>
            <span className={styles.price}>
              <SafePrice kobo={p.priceKobo ?? 0} />
            </span>
            {p.financingEligible && (
              <span className="badge">Financing eligible</span>
            )}
          </div>

          <p className={styles.desc}>
            {p.description || "No description provided."}
          </p>

          <div className={styles.actions}>
            <button
              className={`btn primary ${styles.addBtn}`}
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
