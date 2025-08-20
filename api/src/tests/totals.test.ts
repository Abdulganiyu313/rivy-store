import { calculateTotals } from "../utils/totals";
test("calculates subtotal, tax, total", () => {
  const res = calculateTotals([{ unitPrice: 1000, quantity: 2 }, { unitPrice: 500, quantity: 1 }], 0.1);
  expect(res.subtotal).toBe(2500);
  expect(res.tax).toBe(250);
  expect(res.total).toBe(2750);
});
