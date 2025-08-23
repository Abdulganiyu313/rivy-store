import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import CatalogPage from "./pages/Catalog";
import ProductPage from "./pages/Product";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/Checkout";
import CheckoutSuccessPage from "./pages/CheckoutSuccess";
import ErrorBoundary from "./ErrorBoundary";
import { API_URL_OK, API_URL_DISPLAY } from "./api";
import "./styles/base.css";

function Header() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "10px 16px",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 12,
      }}
    >
      <Link
        to="/"
        aria-label="Go to home"
        style={{ fontWeight: 700, fontSize: 18 }}
      >
        energystack
      </Link>
      <nav style={{ display: "flex", gap: 12 }}>
        <NavLink to="/cart" className="btn btn--ghost">
          Cart
        </NavLink>
        <NavLink to="/login" className="btn btn--ghost">
          Login
        </NavLink>
        <NavLink to="/signup" className="btn btn--primary">
          Create Account
        </NavLink>
      </nav>
    </header>
  );
}

function DevApiBanner() {
  if (API_URL_OK) return null;
  return (
    <div
      style={{
        padding: 12,
        border: "1px solid #f59e0b",
        background: "#fffbeb",
        margin: 12,
        borderRadius: 8,
      }}
    >
      <strong>Heads up:</strong> <code>VITE_API_URL</code> is not set or looks
      wrong. It is currently:
      <code> {API_URL_DISPLAY} </code>. Set <code>web/.env</code> to{" "}
      <code>VITE_API_URL=http://localhost:4000</code> and restart{" "}
      <code>npm run dev</code>.
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Header />
        <DevApiBanner />
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route
            path="/login"
            element={<div style={{ padding: 16 }}>Login placeholder</div>}
          />
          <Route
            path="/signup"
            element={<div style={{ padding: 16 }}>Signup placeholder</div>}
          />
          <Route
            path="*"
            element={<div style={{ padding: 16 }}>Not found</div>}
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
