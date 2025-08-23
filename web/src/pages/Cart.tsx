import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import "./Cart.css";

/** Currency helper: expects kobo (integer) */
const money = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    (Number.isFinite(kobo) ? kobo : 0) / 100
  );

/** Shapes we can get from the store */
type RawLine = {
  id?: string | number;
  product?: any;
  name?: string;
  image?: string;
  priceKobo?: number; // preferred
  price?: number; // fallback (naira)
  minOrder?: number;
  qty?: number;
};

type Line = {
  id: string;
  name: string;
  image: string;
  priceKobo: number;
  minOrder: number;
  qty: number;
};

/** Normalize a raw line from the store into a consistent shape */
function normalizeLine(raw: RawLine): Line {
  const p = raw?.product ?? {};
  const id = String(raw?.id ?? p?.id ?? "");
  const name = String(raw?.name ?? p?.name ?? "Unnamed");
  const image = (raw?.image ??
    p?.images?.[0] ??
    p?.imageUrl ??
    "/vite.svg") as string;

  const minOrderCandidate = Number(raw?.minOrder ?? p?.minOrder ?? 1);
  const minOrder =
    Number.isFinite(minOrderCandidate) && minOrderCandidate > 0
      ? minOrderCandidate
      : 1;

  let priceKobo = Number(raw?.priceKobo ?? p?.priceKobo);
  if (!(Number.isFinite(priceKobo) && priceKobo > 0)) {
    const naira = Number(raw?.price ?? p?.price ?? 0);
    priceKobo = Math.round(naira * 100);
  }

  const qtyCandidate = Number(raw?.qty ?? 0);
  const qty =
    Number.isFinite(qtyCandidate) && qtyCandidate > 0 ? qtyCandidate : 0;

  return { id, name, image, priceKobo, minOrder, qty };
}

/** Empty cart card */
function EmptyCart({ onStart }: { onStart: () => void }) {
  return (
    <div className="empty-wrap">
      <div className="empty-icon" aria-hidden>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="#10b981"
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="5" fill="#a7f3d0" />
          <text
            x="12"
            y="13.5"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="#065f46"
          >
            !
          </text>
        </svg>
      </div>
      <h4>No cart items</h4>
      <p className="muted">You have added no items to cart</p>
      <button className="btn-primary-lg" onClick={onStart}>
        Start Shopping
      </button>
    </div>
  );
}

/** One cart line */
function CartLine({
  line,
  setQty,
  remove,
}: {
  line: Line;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
}) {
  const step = line.minOrder || 1;

  const inc = () => setQty(line.id, Math.max(step, line.qty + step));
  const dec = () => setQty(line.id, Math.max(0, line.qty - step));
  const onQtyBlur = (val: string) => {
    const n = Math.max(0, Math.floor((Number(val) || 0) / step) * step);
    setQty(line.id, n);
  };

  return (
    <article className="cart-item" key={line.id}>
      <div className="cart-item-img">
        <img
          src={line.image}
          alt={line.name}
          onError={(e) =>
            ((e.currentTarget as HTMLImageElement).src = "/vite.svg")
          }
        />
      </div>

      <div className="cart-item-info">
        <div className="cart-item-name">{line.name}</div>
        <div className="cart-item-price">{money(line.priceKobo)}</div>

        <div className="cart-qty">
          <button onClick={dec} aria-label="decrease">
            −
          </button>
          <input
            inputMode="numeric"
            defaultValue={line.qty}
            onBlur={(e) => onQtyBlur(e.currentTarget.value)}
          />
          <button onClick={inc} aria-label="increase">
            +
          </button>
          <span className="cart-qty-hint">step {step}</span>
        </div>

        <button className="link-danger" onClick={() => remove(line.id)}>
          Remove
        </button>
      </div>

      <div className="cart-line-subtotal">
        {money(line.qty * line.priceKobo)}
      </div>
    </article>
  );
}

/** Cart page */
export default function Cart() {
  const navigate = useNavigate();

  // Safe access to the cart store (works even if keys are missing)
  const store = (useCart?.() as any) || {};
  const rawLinesMap = store?.lines ?? {};
  const setQty: (id: string, qty: number) => void = store?.setQty ?? (() => {});
  const remove: (id: string) => void = store?.remove ?? (() => {});
  const clear: () => void = store?.clear ?? (() => {});

  // Map -> array and normalize
  const rawArray: RawLine[] = Array.isArray(rawLinesMap)
    ? (rawLinesMap as RawLine[])
    : Object.values(rawLinesMap as Record<string, RawLine>);
  const items: Line[] = rawArray.map(normalizeLine).filter((l) => l.qty > 0);

  const itemCount = items.reduce((n, l) => n + l.qty, 0);
  const subtotalKobo = items.reduce((n, l) => n + l.qty * l.priceKobo, 0);

  return (
    <div className="cart-page">
      <div className="cart-body">
        <div className="back-row">
          <Link to="/" className="back-link">
            ← Back
          </Link>
        </div>

        <h2 className="cart-title">Cart</h2>

        <div className="cart-grid">
          {/* LEFT: items or empty state */}
          <section className="card cart-left">
            {items.length === 0 ? (
              <EmptyCart onStart={() => navigate("/")} />
            ) : (
              <div className="cart-items">
                {items.map((line) => (
                  <CartLine
                    key={line.id}
                    line={line}
                    setQty={setQty}
                    remove={remove}
                  />
                ))}

                <div className="cart-actions">
                  <button className="btn-ghost" onClick={clear}>
                    Clear cart
                  </button>
                  <Link to="/" className="btn-link">
                    Continue shopping
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT: order summary */}
          <aside className="card cart-right">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span className="muted">
                ({itemCount} {itemCount === 1 ? "Item" : "Items"})
              </span>
              <span className="summary-value">{money(subtotalKobo)}</span>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <span className="summary-value">{money(subtotalKobo)}</span>
            </div>

            <button
              className="btn-primary-lg block"
              disabled={items.length === 0}
              onClick={() => navigate("/checkout")}
            >
              Go to Checkout →
            </button>
          </aside>
        </div>

        {items.length === 0 && (
          <div className="cart-footer-note">
            ©2025 Rivy. All rights reserved. • Read our Terms – Privacy – FAQs
          </div>
        )}
      </div>
    </div>
  );
}
