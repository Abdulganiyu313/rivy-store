import swaggerJsdoc from "swagger-jsdoc";
import { Express } from "express";
import swaggerUi from "swagger-ui-express";

export function mountOpenAPI(app: Express) {
  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: "3.0.3",
      info: {
        title: "Storefront API",
        version: "1.0.0",
        description: "Products, Cart/Checkout, and Orders endpoints",
      },
      servers: [{ url: process.env.API_BASE || "http://localhost:4000" }],
      components: {
        schemas: {
          Product: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              description: { type: "string", nullable: true },
              priceKobo: { type: "integer" },
              stock: { type: "integer" },
              minOrder: { type: "integer" },
              imageUrl: { type: "string", nullable: true },
              financingEligible: { type: "boolean", nullable: true },
              categoryId: { type: "integer", nullable: true },
            },
          },
          OrderItem: {
            type: "object",
            properties: {
              id: { type: "integer" },
              orderId: { type: "integer" },
              productId: { type: "integer" },
              name: { type: "string" },
              unitPriceKobo: { type: "integer" },
              qty: { type: "integer" },
              subtotalKobo: { type: "integer" },
            },
          },
          Order: {
            type: "object",
            properties: {
              id: { type: "integer" },
              status: { type: "string" },
              subtotalKobo: { type: "integer" },
              taxKobo: { type: "integer" },
              totalKobo: { type: "integer" },
              name: { type: "string", nullable: true },
              email: { type: "string", nullable: true },
              address: { type: "string", nullable: true },
              createdAt: { type: "string", format: "date-time" },
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/OrderItem" },
              },
            },
          },
        },
      },
    },
    apis: [],
  };

  const spec = swaggerJsdoc(options);
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec));
}
