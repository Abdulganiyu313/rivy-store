export default function Empty({
  title = "Nothing here",
  hint,
}: {
  title?: string;
  hint?: string;
}) {
  return (
    <div className="card" style={{ padding: "24px", textAlign: "center" }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {hint && <div style={{ color: "var(--muted)" }}>{hint}</div>}
    </div>
  );
}
