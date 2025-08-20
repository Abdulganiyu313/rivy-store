export type Item = { unitPrice: number; quantity: number };
export function kobo(n: number) { return Math.round(n); }
export function calculateTotals(items: Item[], taxRate = 0.075) {
  const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const tax = kobo(subtotal * taxRate);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}
