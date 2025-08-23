// Full replacement: adds inStock & financingEligible filters, keeps search/sort/pagination.

import { Router, Request, Response } from "express";
import { Op, WhereOptions, fn, col, literal } from "sequelize";
import { Product } from "../models";
import type { Order } from "sequelize";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const {
    q,
    categoryId,
    brand,
    minPriceKobo,
    maxPriceKobo,
    inStock,
    financingEligible,
    sort = "relevance",
    page = "1",
    limit = "12",
  } = req.query as Record<string, string>;

  const where: WhereOptions = {};
  if (q) {
    const ilike = { [Op.iLike]: `%${q}%` };
    Object.assign(where, {
      [Op.or]: [{ name: ilike }, { description: ilike }, { brand: ilike }],
    });
  }
  if (categoryId) Object.assign(where, { categoryId });
  if (brand) Object.assign(where, { brand });
  if (minPriceKobo || maxPriceKobo) {
    Object.assign(where, {
      priceKobo: {
        ...(minPriceKobo ? { [Op.gte]: Number(minPriceKobo) } : {}),
        ...(maxPriceKobo ? { [Op.lte]: Number(maxPriceKobo) } : {}),
      },
    });
  }
  if (inStock === "true") Object.assign(where, { stock: { [Op.gt]: 0 } });
  if (financingEligible === "true")
    Object.assign(where, { financingEligible: true });

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(
    100,
    Math.max(1, parseInt(String(limit), 10) || 12)
  );
  const offset = (pageNum - 1) * limitNum;

  const order: Order =
    sort === "price_asc"
      ? [["priceKobo", "ASC"]]
      : sort === "price_desc"
      ? [["priceKobo", "DESC"]]
      : sort === "newest"
      ? [["createdAt", "DESC"]]
      : [
          [literal(`CASE WHEN stock > 0 THEN 0 ELSE 1 END`), "ASC"],
          ["createdAt", "DESC"],
        ];

  const { rows, count } = await Product.findAndCountAll({
    where,
    order,
    limit: limitNum,
    offset,
  });
  res.json({
    data: rows,
    page: pageNum,
    limit: limitNum,
    total: count,
    totalPages: Math.max(1, Math.ceil(count / limitNum)),
  });
});

router.get("/brands", async (_req, res) => {
  const rows = await Product.findAll({
    attributes: [[fn("DISTINCT", col("brand")), "brand"]],
    where: { brand: { [Op.ne]: null } },
    order: [["brand", "ASC"]],
    raw: true,
  });
  res.json(rows.map((r: any) => r.brand).filter(Boolean));
});

router.get("/:id", async (req, res) => {
  const p = await Product.findByPk(req.params.id);
  if (!p) return res.status(404).json({ message: "Product not found" });
  res.json(p);
});

export default router;
