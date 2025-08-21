import { Router } from "express";
import { Category } from "../models";

const r = Router();

r.get("/", async (_req, res) => {
  const cats = await Category.findAll({ order: [["name", "ASC"]] });
  res.json({ data: cats });
});

export default r;
