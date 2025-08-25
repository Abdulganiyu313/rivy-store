// web/src/components/SidebarFilters.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, type Product } from "../api";
import styles from "./SidebarFilters.module.css";

const NAIRA_MIN = 100_000;
const NAIRA_MAX = 10_000_000;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    n
  );

// UI options
const DURATION_OPTIONS = ["", "3", "6", "9", "12", "18", "24", "36"]; // months
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];
// warranty in months
const WARRANTY_OPTIONS = ["", "6", "12", "24", "36", "48", "60"];
// capacity buckets (kWh)
const CAPACITY_OPTIONS = [
  { value: "", label: "Any" },
  { value: "<=1000", label: "≤ 1 kWh" },
  { value: "1000-3000", label: "1–3 kWh" },
  { value: "3000-5000", label: "3–5 kWh" },
  { value: "5000-10000", label: "5–10 kWh" },
  { value: ">=10000", label: "≥ 10 kWh" },
];

export default function SidebarFilters() {
  const [sp, setSp] = useSearchParams();

  // URL -> local (kept in sync)
  const urlMin = Number(sp.get("min") ?? NAIRA_MIN);
  const urlMax = Number(sp.get("max") ?? NAIRA_MAX);
  const urlPayment = sp.get("payment") ?? ""; // "installmental" | "full" | ""
  const urlDuration = sp.get("duration") ?? "";
  const urlSort = sp.get("sort") ?? "relevance";
  const urlWarranty = sp.get("warrantyMonths") ?? "";
  const urlCapacity = sp.get("capacity") ?? "";

  const [minV, setMinV] = useState(clamp(urlMin, NAIRA_MIN, NAIRA_MAX));
  const [maxV, setMaxV] = useState(clamp(urlMax, NAIRA_MIN, NAIRA_MAX));
  const [payment, setPayment] = useState<"" | "installmental" | "full">(
    urlPayment as any
  );
  const [duration, setDuration] = useState(urlDuration);
  const [sortBy, setSortBy] = useState(urlSort);
  const [warranty, setWarranty] = useState(urlWarranty);
  const [capacity, setCapacity] = useState(urlCapacity);

  // Suggestions (brands from current results)
  const [brandOpts, setBrandOpts] = useState<string[]>([]);
  const [brandOpen, setBrandOpen] = useState(false);
  const [warrantyOpen, setWarrantyOpen] = useState(false);
  const [capacityOpen, setCapacityOpen] = useState(false);

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
  useEffect(() => setMinV(clamp(urlMin, NAIRA_MIN, NAIRA_MAX)), [urlMin]);
  useEffect(() => setMaxV(clamp(urlMax, NAIRA_MIN, NAIRA_MAX)), [urlMax]);
  useEffect(() => setPayment((urlPayment as any) || ""), [urlPayment]);
  useEffect(() => setDuration(urlDuration), [urlDuration]);
  useEffect(() => setSortBy(urlSort), [urlSort]);
  useEffect(() => setWarranty(urlWarranty), [urlWarranty]);
  useEffect(() => setCapacity(urlCapacity), [urlCapacity]);

  // Slider maths (min thumb may not cross max)
  const minSafe = useMemo(() => Math.min(minV, maxV - 10_000), [minV, maxV]);
  const maxSafe = useMemo(() => Math.max(maxV, minV + 10_000), [minV, maxV]);

  // Apply button (sync to URL)
  const apply = () => {
    const next = new URLSearchParams(sp);
    const setOrDel = (k: string, v: string | null) => {
      if (v && v.trim().length) next.set(k, v.trim());
      else next.delete(k);
    };
    setOrDel("payment", payment);
    setOrDel("duration", duration);
    setOrDel("sort", sortBy);
    setOrDel("warrantyMonths", warranty);
    setOrDel("capacity", capacity);
    next.set("min", String(minSafe));
    next.set("max", String(maxSafe));
    next.delete("page");
    // clean up any legacy keys
    next.delete("minDuration");
    setSp(next);
  };

  const clear = () => {
    setPayment("");
    setDuration("");
    setSortBy("relevance");
    setWarranty("");
    setCapacity("");
    setMinV(NAIRA_MIN);
    setMaxV(NAIRA_MAX);

    const next = new URLSearchParams(sp);
    [
      "payment",
      "duration",
      "sort",
      "warrantyMonths",
      "capacity",
      "min",
      "max",
      "page",
      "minDuration",
      "categoryId", // also clear any category filter if present
    ].forEach((k) => next.delete(k));
    setSp(next);
  };

  return (
    <aside className={styles.aside} aria-labelledby="filters-heading">
      <div className={styles.header}>
        <h3 id="filters-heading" className={styles.title}>
          Filters
        </h3>
      </div>

      {/* Payment type segmented control */}
      <div
        className={styles.segmented}
        role="radiogroup"
        aria-label="Payment type"
      >
        <button
          type="button"
          role="radio"
          aria-checked={payment === "installmental"}
          className={styles.segment}
          data-active={payment === "installmental" || undefined}
          onClick={() =>
            setPayment(payment === "installmental" ? "" : "installmental")
          }
        >
          Instalmental
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={payment === "full"}
          className={styles.segment}
          data-active={payment === "full" || undefined}
          onClick={() => setPayment(payment === "full" ? "" : "full")}
        >
          Full Payment
        </button>
      </div>

      {/* Sort by */}
      <div className={styles.block}>
        <div className={styles.blockHead}>Sort by</div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sortBy">
            Sort results
          </label>
          <select
            id="sortBy"
            className={styles.select}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payment Duration (single select) */}
      <div className={styles.block}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="paymentDuration">
            Payment Duration
          </label>
          <select
            id="paymentDuration"
            className={styles.select}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            {DURATION_OPTIONS.map((m) => (
              <option key={m || "any"} value={m}>
                {m ? `${m} months` : "Any"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Price Range (removed the “₦100,000 – ₦10,000,000” header label) */}
      <div className={styles.block}>
        <div className={styles.blockHead}>Price Range</div>

        <div className={styles.rangeWrap}>
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
            aria-label="Minimum price"
            className={styles.range}
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
            aria-label="Maximum price"
            className={styles.range}
          />

          {/* Active track highlight */}
          <div
            className={styles.rangeTrack}
            style={{
              left: `${
                ((minSafe - NAIRA_MIN) / (NAIRA_MAX - NAIRA_MIN)) * 100
              }%`,
              right: `${
                (1 - (maxSafe - NAIRA_MIN) / (NAIRA_MAX - NAIRA_MIN)) * 100
              }%`,
            }}
            aria-hidden="true"
          />
        </div>

        {/* keep the small hints under the slider */}
        <div className={styles.priceHints}>
          <span className={styles.muted}>{fmt(minSafe)}</span>
          <span className={styles.muted}>{fmt(maxSafe)}</span>
        </div>
      </div>

      {/* Warranty Period (dropdown in collapsible) */}
      <button
        type="button"
        className={styles.rowButton}
        aria-expanded={warrantyOpen}
        aria-controls="warranty"
        onClick={() => setWarrantyOpen((v) => !v)}
      >
        <span>Warranty Period</span>
        <span className={styles.chev} aria-hidden="true">
          ›
        </span>
      </button>
      <div
        id="warranty"
        className={styles.collapse}
        data-open={warrantyOpen || undefined}
      >
        <div className={styles.field}>
          <label className={styles.label} htmlFor="warrantySelect">
            Warranty
          </label>
          <select
            id="warrantySelect"
            className={styles.select}
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
          >
            {WARRANTY_OPTIONS.map((m) => (
              <option key={m || "any"} value={m}>
                {m ? `${m} months` : "Any"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Brand (collapsible) */}
      <button
        type="button"
        className={styles.rowButton}
        aria-expanded={brandOpen}
        aria-controls="brand"
        onClick={() => setBrandOpen((v) => !v)}
      >
        <span>Brand</span>
        <span className={styles.chev} aria-hidden="true">
          ›
        </span>
      </button>
      <div
        id="brand"
        className={styles.collapse}
        data-open={brandOpen || undefined}
      >
        <div className={styles.field}>
          <label className={styles.label} htmlFor="brandSelect">
            Choose brand
          </label>
          <select
            id="brandSelect"
            className={styles.select}
            disabled={brandOpts.length === 0}
          >
            <option value="">
              {brandOpts.length ? "All" : "No brands found"}
            </option>
            {brandOpts.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Energy Capacity (dropdown in collapsible) */}
      <button
        type="button"
        className={styles.rowButton}
        aria-expanded={capacityOpen}
        aria-controls="capacity"
        onClick={() => setCapacityOpen((v) => !v)}
      >
        <span>Energy Capacity</span>
        <span className={styles.chev} aria-hidden="true">
          ›
        </span>
      </button>
      <div
        id="capacity"
        className={styles.collapse}
        data-open={capacityOpen || undefined}
      >
        <div className={styles.field}>
          <label className={styles.label} htmlFor="capacitySelect">
            Capacity
          </label>
          <select
            id="capacitySelect"
            className={styles.select}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          >
            {CAPACITY_OPTIONS.map((c) => (
              <option key={c.value || "any"} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button type="button" className={styles.btnReset} onClick={clear}>
          Reset
        </button>
        <button type="button" className={styles.btnApply} onClick={apply}>
          Apply
        </button>
      </div>
    </aside>
  );
}
