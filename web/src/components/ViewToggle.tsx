import { useSearchParams } from "react-router-dom";
import styles from "./ViewToggle.module.css";

export default function ViewToggle() {
  const [sp, setSp] = useSearchParams();
  const view = (sp.get("view") as "grid" | "list") ?? "grid";

  const set = (v: "grid" | "list") => {
    const next = new URLSearchParams(sp);
    next.set("view", v);
    next.delete("page"); // keep UX consistent: reset pagination when layout changes
    setSp(next);
  };

  return (
    <div className={styles.wrap} role="group" aria-label="View mode">
      <button
        type="button"
        className={`${styles.btn} ${view === "grid" ? styles.active : ""}`}
        onClick={() => set("grid")}
        aria-label="Grid view"
      >
        ▦
      </button>
      <button
        type="button"
        className={`${styles.btn} ${view === "list" ? styles.active : ""}`}
        onClick={() => set("list")}
        aria-label="List view"
      >
        ≣
      </button>
    </div>
  );
}
