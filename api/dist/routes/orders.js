"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db"); // <-- use your db.ts
const models_1 = require("../models"); // keep your model exports
const orders_1 = require("../validation/orders");
// Simple in-memory idempotency (dev-only). Replace with DB table later.
const IDEMPOTENCY = new Map();
const router = (0, express_1.Router)();
/**
 * POST /checkout  (also available at /api/checkout via app.ts)
 * Headers: Idempotency-Key
 * Body: { customer:{name,email,address}, lines:[{productId, qty}] }
 * Returns: { orderId, items, totals }
 */
router.post("/checkout", async (req, res, next) => {
    const key = req.get("Idempotency-Key");
    if (!key)
        return res.status(400).json({ error: "Missing Idempotency-Key header" });
    try {
        // Fast path for duplicate submissions
        if (IDEMPOTENCY.has(key)) {
            return res.json(IDEMPOTENCY.get(key));
        }
        const parsed = (0, orders_1.validateCheckout)(req.body); // throws on bad shape
        const t = await db_1.sequelize.transaction();
        try {
            // Validate lines against DB & lock rows
            const productMap = new Map();
            for (const line of parsed.lines) {
                const p = await models_1.Product.findByPk(line.productId, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });
                if (!p)
                    throw new Error("Product not found");
                const minOrder = p.minOrder ?? 1;
                const stock = p.stock ?? 0;
                if (line.qty % minOrder !== 0)
                    throw new Error("Qty must be in minOrder increments");
                if (line.qty > stock)
                    throw new Error("Insufficient stock");
                productMap.set(line.productId, p);
            }
            // Create order
            const order = await models_1.Order.create({
                name: parsed.customer.name,
                email: parsed.customer.email,
                address: parsed.customer.address,
                currency: "NGN",
            }, { transaction: t });
            const orderId = order.id ?? order.get?.("id");
            // Items + decrement stock
            let totalKobo = 0;
            const itemsPayload = [];
            for (const line of parsed.lines) {
                const p = productMap.get(line.productId);
                const priceKobo = p.priceKobo ?? p.priceKobo ?? 0;
                const lineTotal = priceKobo * line.qty;
                totalKobo += lineTotal;
                itemsPayload.push({
                    orderId,
                    productId: p.id,
                    name: p.name,
                    unitPriceKobo: priceKobo,
                    qty: line.qty,
                    subtotalKobo: lineTotal,
                });
                // decrement stock
                p.stock = (p.stock ?? 0) - line.qty;
                await p.save({ transaction: t });
            }
            await models_1.OrderItem.bulkCreate(itemsPayload, { transaction: t });
            const response = {
                orderId,
                items: itemsPayload.map(({ productId, name, qty, unitPriceKobo, subtotalKobo }) => ({
                    productId,
                    name,
                    qty,
                    unitPriceKobo,
                    subtotalKobo,
                })),
                totals: { totalKobo },
            };
            // Save idempotent response (in-memory)
            IDEMPOTENCY.set(key, response);
            await t.commit();
            res.json(response);
        }
        catch (e) {
            await t.rollback();
            throw e;
        }
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
