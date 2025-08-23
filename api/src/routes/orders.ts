import { Router } from "express";
import { sequelize } from "../db";
import { Product, Order, OrderItem } from "../models";
import { validateCheckout } from "../validation/checkout";

const IDEMPOTENCY = new Map<string, any>();
const router = Router();

router.post("/checkout", async (req, res, next) => {
  const key = req.get("Idempotency-Key");
  if (!key)
    return res.status(400).json({ error: "Missing Idempotency-Key header" });

  try {
    if (IDEMPOTENCY.has(key)) return res.json(IDEMPOTENCY.get(key));

    const parsed = validateCheckout(req.body);

    const t = await sequelize.transaction();
    try {
      // 1) Load & validate all products first; compute totals
      const productMap = new Map<number, any>();
      for (const line of parsed.lines) {
        const p = await Product.findByPk(line.productId, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!p) throw new Error("Product not found");

        const minOrder = (p as any).minOrder ?? 1;
        const stock = (p as any).stock ?? 0;

        if (line.qty % minOrder !== 0)
          throw new Error("Qty must be in minOrder increments");
        if (line.qty > stock) throw new Error("Insufficient stock");

        productMap.set(line.productId, p);
      }

      // 2) Compute subtotal/tax/total in KOBO
      let subtotalKobo = 0;
      const itemsPayload: Array<{
        productId: number;
        name: string;
        unitPriceKobo: number;
        qty: number;
        subtotalKobo: number;
      }> = [];

      for (const line of parsed.lines) {
        const p: any = productMap.get(line.productId);
        const unitPriceKobo: number = p.priceKobo ?? 0;
        const lineTotal = unitPriceKobo * line.qty;

        subtotalKobo += lineTotal;
        itemsPayload.push({
          productId: p.id,
          name: p.name,
          unitPriceKobo,
          qty: line.qty,
          subtotalKobo: lineTotal,
        });
      }

      const taxRate = 0.075;
      const taxKobo = Math.round(subtotalKobo * taxRate);
      const totalKobo = subtotalKobo + taxKobo;

      // 3) Create order WITH required totals
      const order = await Order.create(
        {
          status: "placed",
          subtotalKobo,
          taxKobo,
          totalKobo,
          name: parsed.customer.name,
          email: parsed.customer.email,
          address: parsed.customer.address,
          currency: "NGN",
        },
        { transaction: t }
      );

      const orderId: number = (order as any).id ?? (order as any).get?.("id");

      // 4) Create items + decrement stock
      await OrderItem.bulkCreate(
        itemsPayload.map((it) => ({
          orderId,
          productId: it.productId,
          name: it.name,
          unitPriceKobo: it.unitPriceKobo,
          qty: it.qty,
          subtotalKobo: it.subtotalKobo,
        })),
        { transaction: t }
      );

      for (const line of parsed.lines) {
        const p: any = productMap.get(line.productId);
        p.stock = (p.stock ?? 0) - line.qty;
        await p.save({ transaction: t });
      }

      const response = {
        orderId,
        items: itemsPayload,
        totals: { subtotalKobo, taxKobo, totalKobo },
      };

      IDEMPOTENCY.set(key, response);
      await t.commit();
      res.json(response);
    } catch (e) {
      await t.rollback();
      throw e;
    }
  } catch (e) {
    next(e);
  }
});

export default router;
