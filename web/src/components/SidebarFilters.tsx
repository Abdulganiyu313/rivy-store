// web/src/components/SidebarFilters.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet } from "../api";

type Option = { id: string; name: string };

const NAIRA_MIN = 100_000;
const NAIRA_MAX = 10_000_000;
const STEP = 10_000;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const toNaira = (v: any, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    n
  );

export default function SidebarFilters() {
  const [sp, setSp] = useSearchParams();

  // read URL → local state (with sane defaults)
  const urlQ = sp.get("q") ?? "";
  const urlCat = sp.get("category") ?? ""; // <-- NAME
  const urlBrand = sp.get("brand") ?? "";
  const urlMin = toNaira(sp.get("min"), NAIRA_MIN);
  const urlMax = toNaira(sp.get("max"), NAIRA_MAX);

  const [search, setSearch] = useState(urlQ);
  const [category, setCategory] = useState(urlCat);
  const [brand, setBrand] = useState(urlBrand);
  const [minV, setMinV] = useState(clamp(urlMin, NAIRA_MIN, NAIRA_MAX));
  const [maxV, setMaxV] = useState(clamp(urlMax, NAIRA_MIN, NAIRA_MAX));

  // options
  const [catOpts, setCatOpts] = useState<Option[]>([]);
  const [brandOpts, setBrandOpts] = useState<string[]>([]);

  // fetch categories — backend: GET /categories -> { data: string[] }
  useEffect(() => {
    let alive = true;
    apiGet<{ data: string[] }>("/categories")
      .then((res) => {
        const list = res?.data ?? [];
        if (alive) setCatOpts(list.map((x) => ({ id: x, name: x })));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // infer brands from current /api/products response
  useEffect(() => {
    let alive = true;
    const qs = new URLSearchParams();
    if (urlQ) qs.set("q", urlQ);
    if (urlCat) qs.set("category", urlCat); // pass NAME

    apiGet<any>(`/api/products${qs.toString() ? `?${qs.toString()}` : ""}`)
      .then((raw) => {
        const items = Array.isArray(raw) ? raw : raw?.data || raw?.items || [];
        const set = new Set<string>();
        for (const p of items) {
          const name = (p?.brand ?? "").toString().trim();
          if (name) set.add(name);
        }
        if (alive) setBrandOpts([...set].sort());
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQ, urlCat]);

  // keep local state in sync if URL changes elsewhere
  useEffect(() => setSearch(urlQ), [urlQ]);
  useEffect(() => setCategory(urlCat), [urlCat]);
  useEffect(() => setBrand(urlBrand), [urlBrand]);
  useEffect(() => setMinV(clamp(urlMin, NAIRA_MIN, NAIRA_MAX)), [urlMin]);
  useEffect(() => setMaxV(clamp(urlMax, NAIRA_MIN, NAIRA_MAX)), [urlMax]);

  // slider safety (thumbs never cross)
  const minSafe = useMemo(() => Math.min(minV, maxV - STEP), [minV, maxV]);
  const maxSafe = useMemo(() => Math.max(maxV, minV + STEP), [minV, maxV]);

  // write filters to URL (Apply button)
  const apply = () => {
    const next = new URLSearchParams(sp);
    const setOrDel = (k: string, v: string | null) => {
      if (v && v.trim()) next.set(k, v.trim());
      else next.delete(k);
    };
    setOrDel("q", search);
    setOrDel("category", category); // <-- NAME
    setOrDel("brand", brand);
    next.set("min", String(minSafe));
    next.set("max", String(maxSafe));
    next.delete("page"); // reset pagination
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

  return (
    <aside className="filters card" aria-label="Filters">
      <div className="filters-head">
        <h3 style={{ margin: 0 }}>Filters</h3>
        <button className="btn-clear" onClick={clear} type="button">
          Clear Filters
        </button>
      </div>

      {/* Search */}
      <div className="section">
        <label className="label" htmlFor="f-q">
          Search
        </label>
        <input
          id="f-q"
          className="input"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="section">
        <label className="label" htmlFor="f-cat">
          Categories
        </label>
        <select
          id="f-cat"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="select"
        >
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
        <label className="label" htmlFor="f-brand">
          Brands
        </label>
        <select
          id="f-brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="select"
        >
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
        <div className="range-wrap" aria-label="Price range">
          <input
            type="range"
            min={NAIRA_MIN}
            max={NAIRA_MAX}
            step={STEP}
            value={minSafe}
            onChange={(e) =>
              setMinV(
                clamp(Number(e.currentTarget.value), NAIRA_MIN, NAIRA_MAX)
              )
            }
            aria-label="Minimum price"
          />
          <input
            type="range"
            min={NAIRA_MIN}
            max={NAIRA_MAX}
            step={STEP}
            value={maxSafe}
            onChange={(e) =>
              setMaxV(
                clamp(Number(e.currentTarget.value), NAIRA_MIN, NAIRA_MAX)
              )
            }
            aria-label="Maximum price"
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

      <button className="btn-apply" onClick={apply} type="button">
        Apply Filters
      </button>
    </aside>
  );
}
