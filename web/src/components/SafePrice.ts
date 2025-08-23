// path: web/src/components/SafePrice.ts
export function fmtNaira(kobo?: number | null) {
  if (typeof kobo !== "number" || Number.isNaN(kobo)) return "—";
  return `₦${(kobo / 100).toLocaleString()}`;
}
