import { useMemo, useState } from "react";
import styles from "./PriceRange.module.css";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    n
  );

type Props = {
  min: number;
  max: number;
  step?: number;
  defaultMin?: number;
  defaultMax?: number;
  nameMin?: string;
  nameMax?: string; // names for hidden inputs
};

export default function PriceRange({
  min,
  max,
  step = 10_000,
  defaultMin,
  defaultMax,
  nameMin = "min",
  nameMax = "max",
}: Props) {
  const [lo, setLo] = useState<number>(
    typeof defaultMin === "number" ? defaultMin : min
  );
  const [hi, setHi] = useState<number>(
    typeof defaultMax === "number" ? defaultMax : max
  );

  const loSafe = useMemo(
    () => Math.min(Math.max(lo, min), hi - step),
    [lo, hi, min, step]
  );
  const hiSafe = useMemo(
    () => Math.max(Math.min(hi, max), lo + step),
    [hi, lo, max, step]
  );

  const leftPct = ((loSafe - min) / (max - min)) * 100;
  const rightPct = 100 - ((hiSafe - min) / (max - min)) * 100;

  return (
    <div className={styles.wrap} aria-label="Price range">
      <div className={styles.readout}>
        <span>{fmt(loSafe)}</span>
        <span>{fmt(hiSafe)}</span>
      </div>

      <div className={styles.sliders}>
        <div className={styles.track} />
        <div
          className={styles.trackActive}
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />
        <input
          type="range"
          className={styles.range}
          min={min}
          max={max}
          step={step}
          value={loSafe}
          onChange={(e) => setLo(Number(e.currentTarget.value))}
          aria-label="Minimum price"
        />
        <input
          type="range"
          className={styles.range}
          min={min}
          max={max}
          step={step}
          value={hiSafe}
          onChange={(e) => setHi(Number(e.currentTarget.value))}
          aria-label="Maximum price"
        />
      </div>

      {/* submit values as ₦ (not kobo); your form handler multiplies by 100 */}
      <input type="hidden" name={nameMin} value={loSafe} />
      <input type="hidden" name={nameMax} value={hiSafe} />
    </div>
  );
}
