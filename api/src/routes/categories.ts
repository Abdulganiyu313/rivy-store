import { Router } from "express";
import { CATEGORY_LIST } from "../constants/categories";

const r = Router();

r.get("/", (_req, res) => {
  res.json({ data: CATEGORY_LIST });
});

export default r;
