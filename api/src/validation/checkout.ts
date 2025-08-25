import { z } from "zod";

export const LineSchema = z.object({
  productId: z.number().int().positive(),
  qty: z.number().int().min(1),
});

export const CustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
});

// Accept both { lines: [...] } and { items: [...] }
const RawCheckoutSchema = z.object({
  customer: CustomerSchema.optional(),
  lines: z.array(LineSchema).optional(),
  items: z.array(LineSchema).optional(),
});

export type CheckoutInput = {
  customer: z.infer<typeof CustomerSchema>;
  lines: z.infer<typeof LineSchema>[];
};

export function validateCheckout(body: unknown): CheckoutInput {
  const parsed = RawCheckoutSchema.parse(body);

  const lines = parsed.lines ?? parsed.items;
  if (!lines || lines.length === 0) {
    throw new z.ZodError([
      {
        path: ["lines"],
        code: "custom",
        message: "At least one line item is required",
      } as any,
    ]);
  }

  const customer =
    parsed.customer ??
    ({
      // default guest customer
      name: "Guest",
      email: "guest@example.com",
      address: "Unknown address",
    } as const);

  // Re-validate with required shape
  return {
    customer: CustomerSchema.parse(customer),
    lines: z.array(LineSchema).min(1).parse(lines),
  };
}
