"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kobo = kobo;
exports.calculateTotals = calculateTotals;
function kobo(n) { return Math.round(n); }
function calculateTotals(items, taxRate = 0.075) {
    const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const tax = kobo(subtotal * taxRate);
    const total = subtotal + tax;
    return { subtotal, tax, total };
}
//# sourceMappingURL=totals.js.map