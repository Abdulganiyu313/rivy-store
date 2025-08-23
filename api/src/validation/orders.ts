export function validateCheckout(body: any) {
  if (!body || typeof body !== "object") throw new Error("Bad payload");
  const { customer, lines } = body;
  if (!customer || typeof customer !== "object")
    throw new Error("Missing customer");
  if (!Array.isArray(lines) || lines.length === 0)
    throw new Error("Lines required");

  const name = String(customer.name || "").trim();
  const email = String(customer.email || "").trim();
  const address = String(customer.address || "").trim();
  if (name.length < 2) throw new Error("Invalid name");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    throw new Error("Invalid email");
  if (address.length < 5) throw new Error("Invalid address");

  const cleanLines = lines.map((l: any) => {
    const productId = String(l.productId || "");
    const qty = Number(l.qty || 0);
    if (!productId) throw new Error("productId required");
    if (!Number.isFinite(qty) || qty <= 0) throw new Error("qty must be > 0");
    return { productId, qty };
  });

  return { customer: { name, email, address }, lines: cleanLines };
}
