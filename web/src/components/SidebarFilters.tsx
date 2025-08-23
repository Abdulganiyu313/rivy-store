import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet } from "../api";

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
  const urlCat = sp.get("category") ?? "";
  const urlBrand = sp.get("brand") ?? "";
  const urlMin = Number(sp.get("min") ?? NAIRA_MIN);
  const urlMax = Number(sp.get("max") ?? NAIRA_MAX);

  const [search, setSearch] = useState(urlQ);
  const [category, setCategory] = useState(urlCat);
  const [brand, setBrand] = useState(urlBrand);
  const [minV, setMinV] = useState(clamp(urlMin, NAIRA_MIN, NAIRA_MAX));
  const [maxV, setMaxV] = useState(clamp(urlMax, NAIRA_MIN, NAIRA_MAX));

  // Suggestions
  const [catOpts, setCatOpts] = useState<Option[]>([]);
  const [brandOpts, setBrandOpts] = useState<string[]>([]);

  // Fetch categories
  useEffect(() => {
    let alive = true;
    apiGet<any>("/categories")
      .then((res) => {
        const list: Option[] = Array.isArray(res)
          ? res.map((x: any) => ({
              id: x.id ?? x.name,
              name: x.name ?? String(x),
            }))
          : Array.isArray(res?.items)
          ? res.items.map((x: any) => ({
              id: x.id ?? x.name,
              name: x.name ?? String(x),
            }))
          : [];
        if (alive) setCatOpts(list);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Infer brands from products (replace with /brands if you add one)
  useEffect(() => {
    let alive = true;
    const qs = sp.toString();
    apiGet<any>(`/api/products${qs ? `?${qs}` : ""}`)
      .then((raw) => {
        const items = Array.isArray(raw) ? raw : raw?.items || [];
        const set = new Set<string>();
        for (const p of items) {
          const name = (p?.brand ?? "").toString().trim();
          if (name) set.add(name);
        }
        if (alive) setBrandOpts(Array.from(set).sort());
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.get("q"), sp.get("category")]);

  // Keep local state synced if URL changes elsewhere
  useEffect(() => setSearch(urlQ), [urlQ]);
  useEffect(() => setCategory(urlCat), [urlCat]);
  useEffect(() => setBrand(urlBrand), [urlBrand]);
  useEffect(() => setMinV(clamp(urlMin, NAIRA_MIN, NAIRA_MAX)), [urlMin]);
  useEffect(() => setMaxV(clamp(urlMax, NAIRA_MIN, NAIRA_MAX)), [urlMax]);

  // Helpers to write to URL (auto-apply on radio/select)
  // Removed unused setParam function

  // Apply button (mainly for price + search)
  const apply = () => {
    const next = new URLSearchParams(sp);
    const setOrDel = (k: string, v: string | null) => {
      if (v && v.trim().length) next.set(k, v.trim());
      else next.delete(k);
    };
    setOrDel("q", search);
    setOrDel("category", category);
    setOrDel("brand", brand);
    next.set("min", String(minSafe));
    next.set("max", String(maxSafe));
    next.delete("page");
    setSp(next);
  };

  const clear = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setMinV(NAIRA_MIN);
    setMaxV(NAIRA_MAX);
    setSp(new URLSearchParams());
  };

  // Slider maths
  const minSafe = useMemo(() => Math.min(minV, maxV - 10_000), [minV, maxV]);
  const maxSafe = useMemo(() => Math.max(maxV, minV + 10_000), [minV, maxV]);

  return (
    <aside className="filters card">
      <div className="filters-head">
        <h3>Filters</h3>
        <button className="btn-clear" onClick={clear}>
          Clear Filters
        </button>
      </div>

      {/* Categories */}
      <div className="section">
        <label className="label">Categories</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All</option>
          {catOpts.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brands */}
      <div className="section">
        <label className="label">Brands</label>
        <select value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">All</option>
          {brandOpts.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Price */}
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
