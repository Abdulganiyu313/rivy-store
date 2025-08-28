"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const checkout_1 = require("../validation/checkout");
const router = (0, express_1.Router)();
/**
 * POST /api/checkout
 * Create an order and return { orderId }
 */
router.post("/checkout", async (req, res) => {
    try {
        const { customer, lines } = (0, checkout_1.validateCheckout)(req.body);
        // Load products for all line items
        const ids = [...new Set(lines.map((l) => l.productId))];
        const products = await models_1.Product.findAll({ where: { id: ids } });
        // Map products by id for quick lookup
        const byId = new Map(products.map((p) => [p.id, p]));
        let subtotal = 0;
        const items = lines.map((l) => {
            const p = byId.get(l.productId);
            if (!p) {
                // consistent error format
                throw new Error(`PRODUCT_NOT_FOUND:${l.productId}`);
            }
            const unit = typeof p.priceKobo === "number" ? p.priceKobo : 0;
            subtotal += unit * l.qty;
            return {
                productId: p.id,
                name: p.name,
                unitPriceKobo: unit,
                qty: l.qty,
            };
        });
        const tax = Math.round(subtotal * 0.075);
        const total = subtotal + tax;
        // Transactional create
        const tx = await models_1.sequelize.transaction();
        try {
            const order = await models_1.Order.create({
                status: "placed",
                subtotalKobo: subtotal,
                taxKobo: tax,
                totalKobo: total,
                name: customer.name,
                email: customer.email,
                address: customer.address,
            }, { transaction: tx });
            for (const it of items) {
                await models_1.OrderItem.create({
                    orderId: order.id,
                    productId: it.productId,
                    name: it.name,
                    unitPriceKobo: it.unitPriceKobo,
                    qty: it.qty,
                    subtotalKobo: it.unitPriceKobo * it.qty,
                }, { transaction: tx });
            }
            await tx.commit();
            return res.status(201).json({ orderId: String(order.id) });
        }
        catch (err) {
            await tx.rollback();
            throw err;
        }
    }
    catch (e) {
        // map known errors
        if (typeof e?.message === "string" &&
            e.message.startsWith("PRODUCT_NOT_FOUND:")) {
            const id = e.message.split(":")[1];
            return res.status(400).json({
                error: {
                    code: "PRODUCT_NOT_FOUND",
                    message: `Product ${id} not found`,
                },
            });
        }
        return res.status(400).json({
            error: {
                code: "BAD_REQUEST",
                message: e?.message ?? "Invalid request",
            },
        });
    }
});
/**
 * GET /api/orders
 * Paginated list of orders
 */
router.get("/orders", async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const { rows, count } = await models_1.Order.findAndCountAll({
        attributes: [
            "id",
            "status",
            "createdAt",
            "subtotalKobo",
            "taxKobo",
            "totalKobo",
            "name",
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
    });
    return res.json({
        data: rows.map((r) => r.toJSON()),
        total: count,
        totalPages: Math.ceil(count / limit),
    });
});
/**
 * GET /api/orders/:id
 * Single order with items
 */
router.get("/orders/:id", async (req, res) => {
    const order = await models_1.Order.findByPk(req.params.id, {
        include: [{ model: models_1.OrderItem, as: "items" }],
    });
    if (!order) {
        return res
            .status(404)
            .json({ error: { code: "NOT_FOUND", message: "Order not found" } });
    }
    return res.json(order.toJSON());
});
exports.default = router;
//# sourceMappingURL=orders.js.map