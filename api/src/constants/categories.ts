// api/src/constants/categories.ts
export const CATEGORY_LIST = [
  "Batteries",
  "Inverters",
  "Solar Panels",
  "Solar Kits / Solutions",
  "Portable / Outdoor Power",
  "Accessories / Controllers",
] as const;

export type Category = (typeof CATEGORY_LIST)[number];

// Optional helper: ensure incoming values match exactly one of the allowed strings.
export function isCategory(x: string | null | undefined): x is Category {
  return !!x && CATEGORY_LIST.includes(x as Category);
}
