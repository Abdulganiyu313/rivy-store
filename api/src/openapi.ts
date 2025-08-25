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
        description: "Products, Checkout, and Orders",
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
              brand: { type: "string", nullable: true },
              category: { type: "string", nullable: true },
              imageUrl: { type: "string", nullable: true },
              images: {
                type: "array",
                items: { type: "string" },
                nullable: true,
              },
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
              currency: { type: "string", nullable: true },
              createdAt: { type: "string", format: "date-time" },
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/OrderItem" },
              },
            },
          },
          OrdersList: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: { $ref: "#/components/schemas/Order" },
              },
              total: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
          Error: {
            type: "object",
            properties: {
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
      paths: {
        "/api/products": {
          get: {
            summary: "List products",
            tags: ["Products"],
            parameters: [
              { name: "q", in: "query", schema: { type: "string" } },
              { name: "categoryId", in: "query", schema: { type: "string" } },
              {
                name: "minPriceKobo",
                in: "query",
                schema: { type: "integer" },
              },
              {
                name: "maxPriceKobo",
                in: "query",
                schema: { type: "integer" },
              },
              { name: "inStock", in: "query", schema: { type: "boolean" } },
              {
                name: "financingEligible",
                in: "query",
                schema: { type: "boolean" },
              },
              {
                name: "sort",
                in: "query",
                schema: {
                  type: "string",
                  enum: ["relevance", "price_asc", "price_desc", "newest"],
                },
              },
              {
                name: "page",
                in: "query",
                schema: { type: "integer", default: 1 },
              },
              {
                name: "limit",
                in: "query",
                schema: { type: "integer", default: 12 },
              },
            ],
            responses: {
              200: {
                description: "Paged products",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Product" },
                        },
                        total: { type: "integer" },
                        totalPages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "/api/products/{id}": {
          get: {
            summary: "Get a single product",
            tags: ["Products"],
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "integer" },
              },
            ],
            responses: {
              200: {
                description: "Product",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
              404: {
                description: "Not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Error" },
                  },
                },
              },
            },
          },
        },
        "/api/checkout": {
          post: {
            summary: "Simulate checkout and create an order",
            tags: ["Checkout"],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      customer: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          email: { type: "string" },
                          address: { type: "string" },
                        },
                        required: ["name"],
                      },
                      lines: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            productId: { type: "integer" },
                            qty: { type: "integer" },
                          },
                          required: ["productId", "qty"],
                        },
                      },
                    },
                    required: ["customer", "lines"],
                  },
                },
              },
            },
            responses: {
              201: {
                description: "Order created",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: { orderId: { type: "string" } },
                    },
                  },
                },
              },
              400: {
                description: "Validation error",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Error" },
                  },
                },
              },
            },
          },
        },
        "/api/orders": {
          get: {
            summary: "List orders",
            tags: ["Orders"],
            parameters: [
              {
                name: "page",
                in: "query",
                schema: { type: "integer", default: 1 },
              },
              {
                name: "limit",
                in: "query",
                schema: { type: "integer", default: 20 },
              },
            ],
            responses: {
              200: {
                description: "Paged orders",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/OrdersList" },
                  },
                },
              },
            },
          },
        },
        "/api/orders/{id}": {
          get: {
            summary: "Get order by id (with items)",
            tags: ["Orders"],
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "integer" },
              },
            ],
            responses: {
              200: {
                description: "Order",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Order" },
                  },
                },
              },
              404: {
                description: "Not found",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Error" },
                  },
                },
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
