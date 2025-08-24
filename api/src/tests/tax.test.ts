function calcVat(kobo: number) {
  return Math.round(kobo * 0.075);
}

test("VAT rounding", () => {
  expect(calcVat(10000)).toBe(750);
  expect(calcVat(999)).toBe(75); // 74.925 -> 75
});
