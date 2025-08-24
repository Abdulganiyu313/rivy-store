import { Link, useLocation, useNavigate } from "react-router-dom";
import useCartStore from "../stores/useCart";
import { useAuth } from "../hooks/useAuth";

function CartSvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <path
        d="M6 6h15l-2 9H8L6 3H3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.8" fill="currentColor" />
      <circle cx="18" cy="20" r="1.8" fill="currentColor" />
    </svg>
  );
}

function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
      <path
        d="M4 17h13l2-8H6L5 5H2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.6" fill="currentColor" />
      <circle cx="17" cy="20" r="1.6" fill="currentColor" />
    </svg>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // tolerant cart count (works with any persisted shape)
  const count = useCartStore((s: any) => {
    if (Array.isArray(s?.items)) {
      return s.items.reduce(
        (a: number, i: any) => a + (Number(i?.qty ?? 0) || 0),
        0
      );
    }
    const lines = s?.lines || {};
    return Object.values(lines).reduce(
      (n: number, l: any) => n + (Number(l?.qty ?? 0) || 0),
      0
    );
  });

  const { user, logout } = useAuth();

  return (
    <header className="site-header" role="banner">
      <div className="container site-header__bar">
        {/* brand (icon + stacked text like staging) */}
        <Link to="/catalog" className="brand" aria-label="energystack home">
          <span className="brand__icon">
            <BrandMark />
          </span>
          <span className="brand__stack">
            <span className="brand__name">energystack</span>
            <span className="brand__by">by rivy</span>
          </span>
        </Link>

        <nav className="site-header__nav" aria-label="Primary">
          {/* cart link with floating count badge */}
          <button
            type="button"
            className="cartLink"
            onClick={() => navigate("/cart")}
            aria-label={`Open cart (${count})`}
          >
            <span className="cartIconWrap">
              <CartSvg />
              <span className="cartBadge" aria-live="polite">
                {count}
              </span>
            </span>
            <span>Cart</span>
          </button>

          {user ? (
            <>
              <span className="hello">Hi, {user.name}</span>
              <button
                type="button"
                className="btn btn--outline"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                state={{ from: pathname }}
                className="btn btn--outline"
              >
                Login
              </Link>
              <Link
                to="/signup"
                state={{ from: pathname }}
                className="btn btn--primary btn--nowrap"
              >
                Create Account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
