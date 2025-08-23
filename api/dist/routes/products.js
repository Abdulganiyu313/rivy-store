"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sequelize_1 = require("sequelize");
const models_1 = require("../models"); // assumes index.ts exports Product
const router = (0, express_1.Router)();
/**
 * GET /api/products
 * Supports: q, category, brand, min, max, page (1-based), pageSize
 * Returns: { items, total, page, pageSize }
 */
router.get("/", async (req, res, next) => {
    try {
        const { q = "", category = "all", brand = "all", min = "", max = "", page = "1", pageSize = "12", } = req.query;
        const where = {};
        if (q) {
            where[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.iLike]: `%${q}%` } },
                { description: { [sequelize_1.Op.iLike]: `%${q}%` } },
            ];
        }
        if (category && category !== "all")
            where.category = category;
        if (brand && brand !== "all")
            where.brand = brand;
        const minK = min ? Number(min) * 100 : undefined;
        const maxK = max ? Number(max) * 100 : undefined;
        if (minK || maxK) {
            where.priceKobo = {};
            if (minK)
                where.priceKobo[sequelize_1.Op.gte] = minK;
            if (maxK)
                where.priceKobo[sequelize_1.Op.lte] = maxK;
        }
        const pageNum = Math.max(1, Number(page));
        const sizeNum = Math.min(48, Math.max(1, Number(pageSize)));
        const offset = (pageNum - 1) * sizeNum;
        const { rows, count } = await models_1.Product.findAndCountAll({
            where,
            order: [["createdAt", "DESC"]],
            limit: sizeNum,
            offset,
        });
        res.json({
            items: rows,
            total: count,
            page: pageNum,
            pageSize: sizeNum,
        });
    }
    catch (e) {
        next(e);
    }
});
/**
 * GET /api/products/:id
 */
router.get("/:id", async (req, res, next) => {
    try {
        const product = await models_1.Product.findByPk(req.params.id);
        if (!product)
            return res.status(404).json({ error: "Not found" });
        res.json(product);
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
