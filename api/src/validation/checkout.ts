// api/src/validation/app.ts
import { z } from "zod";

export const CheckoutSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    address: z.string().min(1),
  }),
  lines: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        qty: z.coerce.number().int().positive(),
      })
    )
    .min(1),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;

// ✅ named export exactly as used in routes/orders.ts
export function validateCheckout(input: unknown): CheckoutInput {
  return CheckoutSchema.parse(input);
}
