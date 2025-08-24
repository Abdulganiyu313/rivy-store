// web/src/components/SidebarFilters.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCategories, fetchProducts, type Product } from "../api";

type Option = { id: string | number; name: string };

const NAIRA_MIN = 100_000;
const NAIRA_MAX = 10_000_000;
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    n
  );

export default function SidebarFilters() {
  const [sp, setSp] = useSearchParams();

  // URL -> local (kept in sync)
  const urlQ = sp.get("q") ?? "";
  const urlCat = sp.get("categoryId") ?? ""; // use categoryId consistently
  const urlMin = Number(sp.get("min") ?? NAIRA_MIN);
  const urlMax = Number(sp.get("max") ?? NAIRA_MAX);

  const [search, setSearch] = useState(urlQ);
  const [category, setCategory] = useState(urlCat);
  const [minV, setMinV] = useState(clamp(urlMin, NAIRA_MIN, NAIRA_MAX));
  const [maxV, setMaxV] = useState(clamp(urlMax, NAIRA_MIN, NAIRA_MAX));

  // Suggestions
  const [catOpts, setCatOpts] = useState<Option[]>([]);
  const [brandOpts, setBrandOpts] = useState<string[]>([]);

  // Fetch categories
  useEffect(() => {
    let alive = true;
    fetchCategories()
      .then((list) => alive && setCatOpts(list))
      .catch(() => alive && setCatOpts([]));
    return () => {
      alive = false;
    };
  }, []);

  // Infer brands from current product result (optional)
  useEffect(() => {
    let alive = true;
    const q: Record<string, string> = {};
    const qVal = sp.get("q");
    const cVal = sp.get("categoryId");
    if (qVal) q.q = qVal;
    if (cVal) q.categoryId = cVal;

    fetchProducts(q as any)
      .then((raw: any) => {
        const items: Product[] = Array.isArray(raw?.data) ? raw.data : [];
        const set = new Set<string>();
        items.forEach((p) => {
          const name = (p as any)?.brand?.toString().trim();
          if (name) set.add(name);
        });
        if (alive) setBrandOpts(Array.from(set).sort());
      })
      .catch(() => alive && setBrandOpts([]));

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.get("q"), sp.get("categoryId")]);

  // Keep local state synced if URL changes elsewhere
  useEffect(() => setSearch(urlQ), [urlQ]);
  useEffect(() => setCategory(urlCat), [urlCat]);
  useEffect(() => setMinV(clamp(urlMin, NAIRA_MIN, NAIRA_MAX)), [urlMin]);
  useEffect(() => setMaxV(clamp(urlMax, NAIRA_MIN, NAIRA_MAX)), [urlMax]);

  // Apply button (mainly for price + search)
  const apply = () => {
    const next = new URLSearchParams(sp);
    const setOrDel = (k: string, v: string | null) => {
      if (v && v.trim().length) next.set(k, v.trim());
      else next.delete(k);
    };
    setOrDel("q", search);
    setOrDel("categoryId", category);
    next.set("min", String(minSafe));
    next.set("max", String(maxSafe));
    next.delete("page");
    setSp(next);
  };

  const clear = () => {
    setSearch("");
    setCategory("");
    setMinV(NAIRA_MIN);
    setMaxV(NAIRA_MAX);
    const next = new URLSearchParams(sp);
    ["q", "categoryId", "min", "max", "page"].forEach((k) => next.delete(k));
    setSp(next);
  };

  // Slider maths
  const minSafe = useMemo(() => Math.min(minV, maxV - 10_000), [minV, maxV]);
  const maxSafe = useMemo(() => Math.max(maxV, minV + 10_000), [minV, maxV]);

  // Minimal JSX (if you still render this component somewhere)
  return (
    <aside className="filters card">
      <div className="filters-head">
        <h3>Filters</h3>
        <button className="btn-clear" onClick={clear}>
          Clear Filters
        </button>
      </div>

      <div className="section">
        <label className="label">Categories</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All</option>
          {catOpts.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="section">
        <label className="label">Brands</label>
        <select>
          <option value="">All</option>
          {brandOpts.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="section">
        <div className="label">Price</div>
        <div className="range-wrap">
          <input
            type="range"
            min={NAIRA_MIN}
            max={NAIRA_MAX}
            step={10_000}
            value={minSafe}
            onChange={(e) =>
              setMinV(
                clamp(Number(e.currentTarget.value), NAIRA_MIN, NAIRA_MAX)
              )
            }
          />
          <input
            type="range"
            min={NAIRA_MIN}
            max={NAIRA_MAX}
            step={10_000}
            value={maxSafe}
            onChange={(e) =>
              setMaxV(
                clamp(Number(e.currentTarget.value), NAIRA_MIN, NAIRA_MAX)
              )
            }
          />
          <div
            className="range-track"
            style={{
              left: `${
                ((minSafe - NAIRA_MIN) / (NAIRA_MAX - NAIRA_MIN)) * 100
              }%`,
              right: `${
                (1 - (maxSafe - NAIRA_MIN) / (NAIRA_MAX - NAIRA_MIN)) * 100
              }%`,
            }}
          />
        </div>
        <div className="price-hints">
          <span className="muted">{fmt(NAIRA_MIN)}</span>
          <span className="muted">{fmt(NAIRA_MAX)}</span>
        </div>
      </div>

      <button className="btn-apply" onClick={apply}>
        Apply Filters
      </button>
    </aside>
  );
}
