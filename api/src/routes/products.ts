// api/src/routes/products.ts
import { Router, Request, Response } from "express";
import { Op, WhereOptions, literal, fn, col } from "sequelize";
import { z } from "zod";
import { Product } from "../models";
import { CATEGORY_LIST, isCategory } from "../constants/categories";

const router = Router();

/**
 * Validation for query parameters
 * - Accepts your fixed category names exactly (enum)
 * - Supports search, price range (kobo), stock, financing, pagination, and sort
 */
const QuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z
    .enum(CATEGORY_LIST as unknown as [string, ...string[]])
    .optional(),
  minPriceKobo: z.coerce.number().int().nonnegative().optional(),
  maxPriceKobo: z.coerce.number().int().nonnegative().optional(),
  inStock: z.coerce.boolean().optional(),
  financingEligible: z.coerce.boolean().optional(),
  brand: z.string().trim().optional(),
  sort: z
    .enum(["relevance", "price_asc", "price_desc", "newest"])
    .default("relevance"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(48).default(12),
});

router.get("/", async (req: Request, res: Response) => {
  // Validate inputs
  const {
    q,
    category,
    minPriceKobo,
    maxPriceKobo,
    inStock,
    financingEligible,
    brand,
    sort,
    page,
    limit,
  } = QuerySchema.parse(req.query);

  // Build WHERE
  const where: WhereOptions = {};

  if (q) {
    const ilike = { [Op.iLike]: `%${q}%` };
    Object.assign(where, {
      [Op.or]: [{ name: ilike }, { description: ilike }, { brand: ilike }],
    });
  }

  if (brand) Object.assign(where, { brand });

  if (typeof minPriceKobo === "number" || typeof maxPriceKobo === "number") {
    Object.assign(where, {
      priceKobo: {
        ...(typeof minPriceKobo === "number" ? { [Op.gte]: minPriceKobo } : {}),
        ...(typeof maxPriceKobo === "number" ? { [Op.lte]: maxPriceKobo } : {}),
      },
    });
  }

  if (inStock) Object.assign(where, { stock: { [Op.gt]: 0 } });
  if (typeof financingEligible === "boolean")
    Object.assign(where, { financingEligible });

  // Category filter (exact match from fixed list)
  if (category && isCategory(category)) {
    Object.assign(where, { category });
  }

  // Pagination & sort
  const offset = (page - 1) * limit;
  const order =
    sort === "price_asc"
      ? [["priceKobo", "ASC"]]
      : sort === "price_desc"
      ? [["priceKobo", "DESC"]]
      : sort === "newest"
      ? [["createdAt", "DESC"]]
      : [
          [literal(`CASE WHEN "stock" > 0 THEN 0 ELSE 1 END`), "ASC"],
          ["createdAt", "DESC"],
        ];

  // Query
  const { rows, count } = await Product.findAndCountAll({
    where,
    order: order as any,
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

/**
 * GET /products/brands
 * Optional helper: returns distinct brand list for filters
 */
router.get("/brands", async (_req, res) => {
  const rows = await Product.findAll({
    attributes: [[fn("DISTINCT", col("brand")), "brand"]],
    where: { brand: { [Op.ne]: null } },
    order: [["brand", "ASC"]],
    raw: true,
  });
  res.json(rows.map((r: any) => r.brand).filter(Boolean));
});

/**
 * GET /products/:id
 */
router.get("/:id", async (req, res) => {
  const p = await Product.findByPk(req.params.id);
  if (!p) return res.status(404).json({ message: "Product not found" });
  res.json(p);
});

export default router;
