export default function ViewToggle({
  view,
  setView,
}: {
  view: "grid" | "list";
  setView: (v: any) => void;
}) {
  return (
    <div className="view-toggle" role="group" aria-label="View mode">
      <button aria-pressed={view === "grid"} onClick={() => setView("grid")}>
        ▦
      </button>
      <button aria-pressed={view === "list"} onClick={() => setView("list")}>
        ☰
      </button>
    </div>
  );
}
