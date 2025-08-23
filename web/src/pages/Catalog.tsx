// path: web/src/pages/Catalog.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchProducts,
  fetchCategories,
  type Product,
  type ProductQuery,
} from "../api";
import ScopedStyles from "../components/ScopedStyles";
import { fmtNaira } from "../components/SafePrice";

const SCOPE_ID = "catalog-root";

/* ---------- tiny style helpers (consistent UI controls) ---------- */
const ui = {
  input: {
    width: "100%",
    height: 38,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "0 10px",
    outline: "none",
  } as React.CSSProperties,
  select: {
    width: "100%",
    height: 38,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "0 8px",
    background: "#fff",
  } as React.CSSProperties,
  btn: {
    height: 38,
    borderRadius: 8,
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    padding: "0 12px",
    cursor: "pointer",
  } as React.CSSProperties,
  btnGhost: {
    height: 32,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#111827",
    padding: "0 10px",
    cursor: "pointer",
  } as React.CSSProperties,
  label: { display: "grid", gap: 6 } as React.CSSProperties,
  section: { fontWeight: 600, marginBottom: 6 } as React.CSSProperties,
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
  const categoryId = params.get("categoryId") ?? "";
  const minPriceKobo = params.get("minPriceKobo") ?? "";
  const maxPriceKobo = params.get("maxPriceKobo") ?? "";
  const inStock = params.get("inStock") === "true";
  const financingEligible = params.get("financingEligible") === "true";
  const sort = (params.get("sort") as ProductQuery["sort"]) || "relevance";
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
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

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
      sort,
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

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    set({ q: String(fd.get("q") || ""), page: "1" });
  };

  const onApplyFilters = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const min = fd.get("min") ? Math.round(Number(fd.get("min")) * 100) : "";
    const max = fd.get("max") ? Math.round(Number(fd.get("max")) * 100) : "";
    const category = String(fd.get("category") || "");
    const inS = fd.get("inStock") === "on" ? "true" : "";
    const fin = fd.get("financingEligible") === "on" ? "true" : "";
    set({
      categoryId: category || undefined,
      minPriceKobo: min ? String(min) : undefined,
      maxPriceKobo: max ? String(max) : undefined,
      inStock: inS || undefined,
      financingEligible: fin || undefined,
      page: "1",
    });
  };

  return (
    <div id={SCOPE_ID}>
      <ScopedStyles scopeId={SCOPE_ID} />

      {/* Top search (styled) */}
      <form
        className="search"
        onSubmit={onSearchSubmit}
        role="search"
        aria-label="Product search"
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

      {/* Shell */}
      <div className="shell">
        {/* Sidebar / Filters */}
        <aside className="filters" aria-label="Filters">
          <h2 style={{ margin: "0 0 8px 0", fontSize: 18 }}>Filters</h2>

          <form className="card" onSubmit={onApplyFilters}>
            {/* Header row with Clear */}
            <div className="row">
              <button
                type="button"
                style={ui.btnGhost}
                onClick={() =>
                  set({
                    q: q || undefined,
                    categoryId: undefined,
                    minPriceKobo: undefined,
                    maxPriceKobo: undefined,
                    inStock: undefined,
                    financingEligible: undefined,
                    page: "1",
                  })
                }
              >
                Clear
              </button>
            </div>

            {/* Category */}
            <label style={ui.label}>
              Category
              <select
                name="category"
                defaultValue={categoryId}
                style={ui.select}
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Price */}
            <div>
              <div style={ui.section}>Price</div>
              <div className="range">
                <input
                  name="min"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Min ₦"
                  defaultValue={minPriceKobo ? Number(minPriceKobo) / 100 : ""}
                  style={ui.input}
                />
                <input
                  name="max"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Max ₦"
                  defaultValue={maxPriceKobo ? Number(maxPriceKobo) / 100 : ""}
                  style={ui.input}
                />
              </div>
            </div>

            {/* Toggles */}
            <label className="checkbox">
              <input name="inStock" type="checkbox" defaultChecked={inStock} />
              <span>In stock</span>
            </label>
            <label className="checkbox">
              <input
                name="financingEligible"
                type="checkbox"
                defaultChecked={financingEligible}
              />
              <span>Financing eligible</span>
            </label>

            <button type="submit" style={{ ...ui.btn, width: "100%" }}>
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Results */}
        <main>
          {/* Toolbar */}
          <div className="toolbar" role="region" aria-label="View and sort">
            <div className="tabs" role="tablist" aria-label="View">
              <button
                aria-selected={view === "grid"}
                className={`tab ${view === "grid" ? "active" : ""}`}
                onClick={() => set({ view: "grid" })}
              >
                Grid
              </button>
              <button
                aria-selected={view === "list"}
                className={`tab ${view === "list" ? "active" : ""}`}
                onClick={() => set({ view: "list" })}
              >
                List
              </button>
            </div>
            <label style={ui.label}>
              Sort by
              <select
                value={sort}
                onChange={(e) => set({ sort: e.target.value, page: "1" })}
                style={ui.select}
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
                <option value="newest">Newest</option>
              </select>
            </label>
          </div>

          {/* States */}
          {loading && <p>Loading products…</p>}
          {err && <p style={{ color: "crimson" }}>Error: {err}</p>}
          {!loading && !err && data && data.items.length === 0 && (
            <p>No products found.</p>
          )}

          {/* Grid */}
          {!loading && !err && data && data.items.length > 0 && (
            <>
              <ul className={`grid ${view === "list" ? "list" : ""}`}>
                {data.items.map((p) => (
                  <li
                    key={p.id}
                    className={`card ${view === "list" ? "list" : ""}`}
                  >
                    <div className="media">
                      <img
                        src={
                          p.imageUrl || "https://picsum.photos/seed/x/640/480"
                        }
                        alt={p.name}
                      />
                    </div>
                    <div className="body">
                      <h3 className="title">{p.name}</h3>
                      <div className="badges">
                        {p.stock > 0 && <span className="badge">In Stock</span>}
                        {p.financingEligible && (
                          <span className="badge alt">Financing</span>
                        )}
                      </div>
                      <div className="meta">
                        <span>{fmtNaira(p.priceKobo)}</span>
                        <span>Min. order: {p.minOrder || 1} unit</span>
                      </div>
                      <div className="actions">
                        <button className="btn btn--primary btn-sm">Add</button>
                        <a
                          className="btn btn--ghost btn-sm"
                          href={`/p/${p.id}`}
                        >
                          View
                        </a>
                      </div>
                    </div>
                  </li>
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
