"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const models_1 = require("../models");
const categories_1 = require("../constants/categories");
const router = (0, express_1.Router)();
const QuerySchema = zod_1.z.object({
    q: zod_1.z.string().trim().max(100).optional(),
    category: zod_1.z
        .enum(categories_1.CATEGORY_LIST)
        .optional(),
    minPriceKobo: zod_1.z.coerce.number().int().nonnegative().optional(),
    maxPriceKobo: zod_1.z.coerce.number().int().nonnegative().optional(),
    inStock: zod_1.z.coerce.boolean().optional(),
    financingEligible: zod_1.z.coerce.boolean().optional(),
    brand: zod_1.z.string().trim().optional(),
    sort: zod_1.z
        .enum(["relevance", "price_asc", "price_desc", "newest"])
        .default("relevance"),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(48).default(12),
});
router.get("/", async (req, res) => {
    // Validate inputs
    const { q, category, minPriceKobo, maxPriceKobo, inStock, financingEligible, brand, sort, page, limit, } = QuerySchema.parse(req.query);
    // Build WHERE
    const where = {};
    if (q) {
        const ilike = { [sequelize_1.Op.iLike]: `%${q}%` };
        Object.assign(where, {
            [sequelize_1.Op.or]: [{ name: ilike }, { description: ilike }, { brand: ilike }],
        });
    }
    if (brand)
        Object.assign(where, { brand });
    if (typeof minPriceKobo === "number" || typeof maxPriceKobo === "number") {
        Object.assign(where, {
            priceKobo: {
                ...(typeof minPriceKobo === "number" ? { [sequelize_1.Op.gte]: minPriceKobo } : {}),
                ...(typeof maxPriceKobo === "number" ? { [sequelize_1.Op.lte]: maxPriceKobo } : {}),
            },
        });
    }
    if (inStock)
        Object.assign(where, { stock: { [sequelize_1.Op.gt]: 0 } });
    if (typeof financingEligible === "boolean")
        Object.assign(where, { financingEligible });
    // Category filter
    if (category && (0, categories_1.isCategory)(category)) {
        Object.assign(where, { category });
    }
    // Pagination & sort
    const offset = (page - 1) * limit;
    const order = sort === "price_asc"
        ? [["priceKobo", "ASC"]]
        : sort === "price_desc"
            ? [["priceKobo", "DESC"]]
            : sort === "newest"
                ? [["createdAt", "DESC"]]
                : [
                    [(0, sequelize_1.literal)(`CASE WHEN "stock" > 0 THEN 0 ELSE 1 END`), "ASC"],
                    ["createdAt", "DESC"],
                ];
    // Query
    const { rows, count } = await models_1.Product.findAndCountAll({
        where,
        order: order,
        limit,
        offset,
    });
    res.json({
        data: rows,
        page,
        limit,
        total: count,
        totalPages: Math.max(1, Math.ceil(count / limit)),
    });
});
router.get("/brands", async (_req, res) => {
    const rows = await models_1.Product.findAll({
        attributes: [[(0, sequelize_1.fn)("DISTINCT", (0, sequelize_1.col)("brand")), "brand"]],
        where: { brand: { [sequelize_1.Op.ne]: null } },
        order: [["brand", "ASC"]],
        raw: true,
    });
    res.json(rows.map((r) => r.brand).filter(Boolean));
});
router.get("/:id", async (req, res) => {
    const p = await models_1.Product.findByPk(req.params.id);
    if (!p)
        return res.status(404).json({ message: "Product not found" });
    res.json(p);
});
exports.default = router;
//# sourceMappingURL=products.js.map