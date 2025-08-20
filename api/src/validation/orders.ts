import { z } from "zod";
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive()
  })).min(1),
  customer: z.object({ name: z.string().min(1), email: z.string().email() }).optional()
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
