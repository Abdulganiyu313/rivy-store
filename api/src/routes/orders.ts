import { Router } from "express";
import { Product, Order, OrderItem } from "../models";
import { createOrderSchema } from "../validation/orders";
import { calculateTotals } from "../utils/totals";
const r = Router();

r.post("/", async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { code: "VALIDATION", message: "Invalid input", details: parsed.error.flatten() } });
  const { items } = parsed.data;

  const ids = items.map(i => i.productId);
  const products = await Product.findAll({ where: { id: ids } });
  if (products.length !== ids.length) return res.status(400).json({ error: { code: "INVALID_ITEM", message: "One or more products not found" } });

  const detailed = items.map(it => {
    const p = products.find(pp => (pp.get("id") as number) === it.productId)!;
    const unitPrice = p.get("price") as number;
    return { ...it, unitPrice, lineTotal: unitPrice * it.quantity };
  });

  const { subtotal, tax, total } = calculateTotals(detailed.map(d => ({ unitPrice: d.unitPrice, quantity: d.quantity })));
  const order = await Order.create({ subtotal, tax, total });
  await OrderItem.bulkCreate(detailed.map(d => ({
    orderId: order.get("id"),
    productId: d.productId,
    quantity: d.quantity,
    unitPrice: d.unitPrice,
    lineTotal: d.lineTotal
  })));

  res.status(201).json({ data: { id: order.get("id"), subtotal, tax, total } });
});

r.get("/:id", async (req, res) => {
  const order = await Order.findByPk(Number(req.params.id), { include: [OrderItem] });
  if (!order) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Order not found" } });
  res.json({ data: order });
});

export default r;
