"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSchema = exports.LineSchema = void 0;
exports.validateCheckout = validateCheckout;
const zod_1 = require("zod");
exports.LineSchema = zod_1.z.object({
    productId: zod_1.z.number().int().positive(),
    qty: zod_1.z.number().int().min(1),
});
exports.CustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    address: zod_1.z.string().min(1),
});
// Accept both { lines: [...] } and { items: [...] }
const RawCheckoutSchema = zod_1.z.object({
    customer: exports.CustomerSchema.optional(),
    lines: zod_1.z.array(exports.LineSchema).optional(),
    items: zod_1.z.array(exports.LineSchema).optional(),
});
function validateCheckout(body) {
    const parsed = RawCheckoutSchema.parse(body);
    const lines = parsed.lines ?? parsed.items;
    if (!lines || lines.length === 0) {
        throw new zod_1.z.ZodError([
            {
                path: ["lines"],
                code: "custom",
                message: "At least one line item is required",
            },
        ]);
    }
    const customer = parsed.customer ??
        {
            // default guest customer
            name: "Guest",
            email: "guest@example.com",
            address: "Unknown address",
        };
    // Re-validate with required shape
    return {
        customer: exports.CustomerSchema.parse(customer),
        lines: zod_1.z.array(exports.LineSchema).min(1).parse(lines),
    };
}
//# sourceMappingURL=checkout.js.map