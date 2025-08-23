import { useSearchParams } from "react-router-dom";

export default function ViewToggle() {
  const [sp, setSp] = useSearchParams();
  const view = sp.get("view") ?? "grid";

  const set = (v: "grid" | "list") => {
    const next = new URLSearchParams(sp);
    next.set("view", v);
    setSp(next);
  };

  return (
    <div className="view-toggle">
      <button
        className={view === "grid" ? "active" : ""}
        onClick={() => set("grid")}
      >
        ▦
      </button>
      <button
        className={view === "list" ? "active" : ""}
        onClick={() => set("list")}
      >
        ≣
      </button>
    </div>
  );
}
