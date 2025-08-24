import { useSearchParams } from "react-router-dom";
import styles from "./ViewToggle.module.css";

export default function ViewToggle() {
  const [sp, setSp] = useSearchParams();
  const view = (sp.get("view") as "grid" | "list") ?? "grid";

  const setView = (v: "grid" | "list") => {
    const next = new URLSearchParams(sp);
    next.set("view", v);
    next.delete("page"); // reset pagination when layout changes
    setSp(next);
  };

  return (
    <div className={styles.wrap} role="group" aria-label="View mode">
      <button
        type="button"
        className={`${styles.btn} ${view === "grid" ? styles.active : ""}`}
        onClick={() => setView("grid")}
        aria-pressed={view === "grid"}
      >
        Grid
      </button>
      <button
        type="button"
        className={`${styles.btn} ${view === "list" ? styles.active : ""}`}
        onClick={() => setView("list")}
        aria-pressed={view === "list"}
      >
        List
      </button>
    </div>
  );
}
