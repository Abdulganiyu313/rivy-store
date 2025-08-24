export default function ErrorMessage({ error }: { error: Error }) {
  return (
    <div
      className="card"
      role="alert"
      style={{ padding: "16px", borderColor: "var(--danger)" }}
    >
      <div style={{ color: "var(--danger)", fontWeight: 600 }}>
        Something went wrong
      </div>
      <div
        style={{ color: "var(--muted)", marginTop: 4, whiteSpace: "pre-wrap" }}
      >
        {error.message}
      </div>
    </div>
  );
}
