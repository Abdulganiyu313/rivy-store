// web/src/pages/Catalog.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchProducts,
  fetchCategories,
  type Product,
  type ProductQuery,
} from "../api";
import ScopedStyles from "../components/ScopedStyles";
import ProductCard from "../components/ProductCard";
import ViewToggle from "../components/ViewToggle";
import PriceRange from "../components/PriceRange";

const SCOPE_ID = "catalog-root";
const PRICE_MIN = 100_000;
const PRICE_MAX = 10_000_000;

type Option = { id: string; name: string };

/* ---------- tiny style helpers ---------- */
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

  // URL state (category = NAME)
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? ""; // name (e.g., "Batteries")
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

  // categories as objects
  const [categories, setCategories] = useState<Option[]>([]);
  const [catSel, setCatSel] = useState<string>(category); // selected NAME
  useEffect(() => setCatSel(category), [category]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories) // Option[]
      .catch(() => setCategories([]));
  }, []);

  // fetch products (send category NAME)
  useEffect(() => {
    setLoading(true);
    setErr(null);
    fetchProducts({
      q: q || undefined,
      category: category || undefined, // send name
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
    category,
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

  // apply category immediately (write ?category=<NAME>)
  const onSelectCategory = (name: string) => {
    setCatSel(name);
    set({ category: name || undefined, page: "1" });
  };

  const onApplyFilters = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const min = fd.get("min") ? Math.round(Number(fd.get("min")) * 100) : "";
    const max = fd.get("max") ? Math.round(Number(fd.get("max")) * 100) : "";
    const inS = fd.get("inStock") === "on" ? "true" : "";
    const fin = fd.get("financingEligible") === "on" ? "true" : "";
    set({
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

      {/* Top search */}
      <div style={{ maxWidth: 760 }}>
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
      </div>

      <div className="shell">
        {/* Sidebar / Filters */}
        <aside className="filters" aria-label="Filters">
          <div
            className="filters-head"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18 }}>Filters</h2>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                set({
                  q: q || undefined,
                  category: undefined,
                  minPriceKobo: undefined,
                  maxPriceKobo: undefined,
                  inStock: undefined,
                  financingEligible: undefined,
                  page: "1",
                });
                setCatSel("");
              }}
              style={{ height: 30, padding: "0 10px" }}
            >
              Clear Filters
            </button>
          </div>

          <form className="card" onSubmit={onApplyFilters}>
            {/* Categories (radio list, auto-apply) */}
            <div>
              <div style={ui.section}>Categories</div>
              <div
                className="cat-list"
                role="radiogroup"
                aria-label="Categories"
              >
                <label className="radio">
                  <input
                    type="radio"
                    name="categoryRadios"
                    checked={!catSel}
                    onChange={() => onSelectCategory("")}
                  />
                  <span>All</span>
                </label>
                {categories.map((c) => (
                  <label key={c.id} className="radio">
                    <input
                      type="radio"
                      name="categoryRadios"
                      checked={catSel === c.name}
                      onChange={() => onSelectCategory(c.name)}
                    />
                    <span style={{ textTransform: "uppercase" }}>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <div style={ui.section}>Price</div>
              <PriceRange
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={10_000}
                defaultMin={
                  minPriceKobo ? Number(minPriceKobo) / 100 : PRICE_MIN
                }
                defaultMax={
                  maxPriceKobo ? Number(maxPriceKobo) / 100 : PRICE_MAX
                }
                nameMin="min"
                nameMax="max"
              />
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
          <div className="toolbar" role="region" aria-label="View and sort">
            <ViewToggle />
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
