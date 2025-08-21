import { useEffect, useState } from "react";

type Props = {
  search: string;
  setSearch: (v: string) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
};

export default function SidebarFilters({
  search,
  setSearch,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  categoryId,
  setCategoryId,
  onApply,
  onClear,
}: Props) {
  const [cats, setCats] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(
          (import.meta.env.VITE_API_URL || "http://localhost:4000") +
            "/categories"
        );
        if (r.ok) {
          const j = await r.json();
          setCats(j.data || []);
        }
      } catch {}
    })();
  }, []);

  return (
    <aside className="sidebar" aria-label="Filters">
      <div className="sidebar-head">
        <h2>Filters</h2>
        <button className="link" onClick={onClear}>
          Clear Filters
        </button>
      </div>

      <label className="block">
        <span>Search</span>
        <input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>

      <details open>
        <summary>Categories</summary>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">All</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </details>

      {/* Brand filter optional; you can keep as placeholder */}
      <details>
        <summary>Brands</summary>
        <select disabled>
          <option>— Coming soon —</option>
        </select>
      </details>

      <details open>
        <summary>Price</summary>
        <div className="price-row">
          <input
            inputMode="numeric"
            placeholder="Min ₦"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            inputMode="numeric"
            placeholder="Max ₦"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </details>

      <button className="primary" onClick={onApply}>
        Apply Filters
      </button>
    </aside>
  );
}
