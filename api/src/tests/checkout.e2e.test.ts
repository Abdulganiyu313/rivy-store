import request from "supertest";

const BASE = process.env.API_BASE || "http://localhost:4000";

describe("checkout flow", () => {
  it("creates an order (201)", async () => {
    const payload = {
      customer: {
        name: "Test User",
        email: "test@example.com",
        address: "Lagos",
      },
      lines: [{ productId: 1, qty: 1 }],
    };

    const res = await request(BASE).post("/api/checkout").send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("orderId");
  });
});
