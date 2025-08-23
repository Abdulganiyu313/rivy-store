import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6h15l-2 9H8L6 3H3"
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

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // cart count (defensive)
  const linesMap = useCart((s) => s.lines ?? {});
  const count = Object.values(linesMap as Record<string, any>).reduce(
    (n, l: any) => n + (Number(l?.qty ?? 0) || 0),
    0
  );

  // auth
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "#fff",
        borderBottom: "1px solid #eee",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          justifyContent: "space-between",
        }}
      >
        {/* left: logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span aria-hidden style={{ fontSize: 22 }}>
            🛒
          </span>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "#111",
              fontWeight: 800,
              fontSize: 20,
            }}
          >
            energystack{" "}
            <span style={{ color: "#0f766e", fontWeight: 700, fontSize: 14 }}>
              by rivy
            </span>
          </Link>
        </div>

        {/* right actions */}
        <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Cart chip */}
          <button
            onClick={() => navigate("/cart")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <CartIcon />
            <span>Cart</span>
            <span
              style={{
                minWidth: 18,
                height: 18,
                lineHeight: "18px",
                borderRadius: 999,
                padding: "0 6px",
                fontSize: 12,
                fontWeight: 700,
                background: "#10b981",
                color: "#fff",
                textAlign: "center",
              }}
            >
              {count}
            </span>
          </button>

          {/* Auth */}
          {user ? (
            <>
              <span style={{ color: "#6b7280" }}>Hi, {user.name}</span>
              <button
                onClick={logout}
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                state={{ from: pathname }}
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  textDecoration: "none",
                  color: "#111",
                  fontWeight: 600,
                }}
              >
                Login
              </Link>

              <Link
                to="/signup"
                state={{ from: pathname }}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "#10b981",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 800,
                }}
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
