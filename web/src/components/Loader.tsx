// web/src/components/Loader.tsx
export default function Loader({ full = false }: { full?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: full ? 240 : 0,
        padding: full ? "24px 0" : 0,
      }}
    >
      <span
        style={{
          padding: "6px 10px",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          fontSize: 12,
          color: "#6b7280",
        }}
      >
        Loading…
      </span>
    </div>
  );
}
