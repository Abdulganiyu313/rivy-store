const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
export async function getProducts(q: Record<string, any> = {}) {
  const qs = new URLSearchParams(q as any).toString();
  const res = await fetch(`${API}/products?${qs}`);
  if (!res.ok) throw new Error("Failed"); return res.json();
}
export async function getProduct(id: number) {
  const res = await fetch(`${API}/products/${id}`);
  if (!res.ok) throw new Error("Failed"); return res.json();
}
export async function createOrder(body: any) {
  const res = await fetch(`${API}/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error("Checkout failed"); return res.json();
}
export async function getOrder(id: number) {
  const res = await fetch(`${API}/orders/${id}`);
  if (!res.ok) throw new Error("Not found"); return res.json();
}
