import { Router } from "express";
import { Op } from "sequelize";
import { Product } from "../models";
const r = Router();

r.get("/", async (req, res) => {
  const { search = "", categoryId, minPrice, maxPrice, page = "1", limit = "12" } = req.query as Record<string, string>;
  const where: any = {};
  if (search) where.name = { [Op.iLike]: `%${search}%` };
  if (categoryId) where.categoryId = Number(categoryId);
  if (minPrice || maxPrice) where.price = {
    ...(minPrice ? { [Op.gte]: Number(minPrice) } : {}),
    ...(maxPrice ? { [Op.lte]: Number(maxPrice) } : {})
  };
  const offset = (Number(page) - 1) * Number(limit);
  const { rows, count } = await Product.findAndCountAll({ where, offset, limit: Number(limit), order: [["id", "ASC"]] });
  res.json({ data: rows, page: Number(page), limit: Number(limit), total: count });
});

r.get("/:id", async (req, res) => {
  const p = await Product.findByPk(Number(req.params.id));
  if (!p) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Product not found" } });
  res.json({ data: p });
});

export default r;
