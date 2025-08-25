import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchProducts, type Product, type ProductQuery } from "../api";
import ScopedStyles from "../components/ScopedStyles";
import ProductCard from "../components/ProductCard";
import ViewToggle from "../components/ViewToggle";
import Hero from "../components/Hero";
import SidebarFilters from "../components/SidebarFilters"; // ⬅ use the new sidebar

const SCOPE_ID = "catalog-root";

/* ---------- style helpers ---------- */
const ui = {
  input: {
    width: "100%",
    height: 38,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "0 10px",
    outline: "none",
  } as CSSProperties,
  btn: {
    height: 38,
    borderRadius: 8,
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    padding: "0 12px",
    cursor: "pointer",
  } as CSSProperties,
};

function useQueryState() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const set = (entries: Record<string, string | undefined>) => {
    const usp = new URLSearchParams(location.search);
    Object.entries(entries).forEach(([k, v]) =>
      v ? usp.set(k, v) : usp.delete(k)
    );
    navigate({ search: usp.toString() }, { replace: false });
  };
  return { params, set };
}

export default function CatalogPage() {
  const { params, set } = useQueryState();

  // URL state
  const q = params.get("q") ?? "";
  const categoryId = params.get("categoryId") ?? ""; // ID from /api/categories
  const minPriceKobo = params.get("minPriceKobo") ?? "";
  const maxPriceKobo = params.get("maxPriceKobo") ?? "";
  const inStock = params.get("inStock") === "true";
  const financingEligible = params.get("financingEligible") === "true";
  const sort = (params.get("sort") as ProductQuery["sort"]) || "relevance"; // UI removed, still supported
  const view = (params.get("view") as "grid" | "list") || "grid";
  const page = Number(params.get("page") || 1);
  const limit = Number(params.get("limit") || 12);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<{
    items: Product[];
    totalPages: number;
    total: number;
  }>();

  // fetch categories
  useEffect(() => {
    setLoading(true);
    setErr(null);
    fetchProducts({
      q: q || undefined,
      categoryId: categoryId || undefined,
      minPriceKobo: minPriceKobo ? Number(minPriceKobo) : undefined,
      maxPriceKobo: maxPriceKobo ? Number(maxPriceKobo) : undefined,
      inStock: inStock || undefined,
      financingEligible: financingEligible || undefined,
      sort, // still passed, default 'relevance'
      page,
      limit,
    })
      .then((res) =>
        setData({
          items: res.data,
          totalPages: res.totalPages,
          total: res.total,
        })
      )
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [
    q,
    categoryId,
    minPriceKobo,
    maxPriceKobo,
    inStock,
    financingEligible,
    sort,
    page,
    limit,
  ]);

  const onSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    set({ q: String(fd.get("q") || ""), page: "1" });
  };

  return (
    <div id={SCOPE_ID}>
      <ScopedStyles scopeId={SCOPE_ID} />

      {/* Hero */}
      <Hero align="center" secondaryHref="/contact" />

      {/* Shell: sidebar + results */}
      <div className="shell">
        {/* LEFT: Sidebar filters (CSS-module version) */}
        <aside className="filters" aria-label="Filters">
          <SidebarFilters />
        </aside>

        {/* RIGHT: Results */}
        <main id="catalog">
          {/* Top toolbar: search on the LEFT, grid/list on the RIGHT */}
          <div
            className="toolbar"
            role="region"
            aria-label="Search and view"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            {/* Search (moved here) */}
            <form
              onSubmit={onSearchSubmit}
              role="search"
              aria-label="Product search"
              style={{
                display: "flex",
                gap: 8,
                flex: "1 1 520px",
                maxWidth: 760,
              }}
            >
              <input
                name="q"
                defaultValue={q}
                placeholder="Search products"
                aria-label="Search products"
                style={ui.input}
              />
              <button type="submit" style={ui.btn}>
                Search
              </button>
            </form>

            {/* Grid/List (moved to top-right) */}
            <div style={{ flex: "0 0 auto" }}>
              <ViewToggle />
            </div>
          </div>

          {/* Results + states */}
          {loading && <p>Loading products…</p>}
          {err && <p style={{ color: "crimson" }}>Error: {err}</p>}
          {!loading && !err && data && data.items.length === 0 && (
            <p>No products found.</p>
          )}

          {!loading && !err && data && data.items.length > 0 && (
            <>
              <ul className={`grid ${view === "list" ? "list" : ""}`}>
                {data.items.map((p) => (
                  <ProductCard key={p.id} product={p} view={view} />
                ))}
              </ul>

              {/* Pagination */}
              <nav
                className="pagination"
                role="navigation"
                aria-label="Pagination"
              >
                <button
                  className="btn btn--ghost"
                  disabled={page <= 1}
                  onClick={() => set({ page: String(page - 1) })}
                >
                  Prev
                </button>
                <div className="pages">
                  {Array.from({ length: data.totalPages })
                    .slice(0, 7)
                    .map((_, i) => {
                      const n = i + 1;
                      return (
                        <button
                          key={n}
                          className={`pill ${n === page ? "active" : ""}`}
                          onClick={() => set({ page: String(n) })}
                        >
                          {n}
                        </button>
                      );
                    })}
                  {data.totalPages > 7 && (
                    <span style={{ color: "#6b7280" }}>…</span>
                  )}
                </div>
                <button
                  className="btn btn--ghost"
                  disabled={page >= data.totalPages}
                  onClick={() => set({ page: String(page + 1) })}
                >
                  Next
                </button>
              </nav>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
