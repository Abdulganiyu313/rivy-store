import { asNaira } from "../api";

export function fmtNaira(kobo?: number | null) {
  if (typeof kobo !== "number" || Number.isNaN(kobo)) return "—";
  return asNaira(kobo);
}

export default function SafePrice({ kobo }: { kobo: number }) {
  return <span aria-label="price">{fmtNaira(kobo)}</span>;
}
