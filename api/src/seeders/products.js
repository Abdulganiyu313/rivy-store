
"use strict";


const fs = require("fs");
const path = require("path");

function toKobo(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "string") {
    const cleaned = v.replace(/[₦,\s]/g, "");
    if (/^\d+(\.\d+)?$/.test(cleaned)) {
      const num = parseFloat(cleaned);
      // If looks like naira (e.g., 2500000 -> could be kobo already). Heuristic:
      return num < 10_000_000 ? Math.round(num * 100) : Math.round(num);
    }
  }
  const num = Number(v);
  if (Number.isNaN(num)) return null;
  return num < 10_000_000 ? Math.round(num * 100) : Math.round(num);
}

module.exports = {
  async up(queryInterface /*, Sequelize */) {
    const file = path.resolve(__dirname, "data", "products.json");
    let items = [];
    try {
      const raw = fs.readFileSync(file, "utf8");
      items = JSON.parse(raw);
    } catch (err) {
      console.warn(
        "[seed] products.json missing/invalid — seeding 3 sample products."
      );
      items = [
        {
          name: "1KW Solar Kit",
          description: "Entry-level solar kit for small loads.",
          priceKobo: 250000000, // ₦2,500,000
          stock: 12,
          minOrder: 1,
          brand: "EnergyStack",
          imageUrl: "https://picsum.photos/seed/1kw/640/480",
          financingEligible: true,
        },
        {
          name: "3KW Solar Kit",
          description: "Mid-range kit for homes and small offices.",
          priceKobo: 750000000, // ₦7,500,000
          stock: 8,
          minOrder: 1,
          brand: "EnergyStack",
          imageUrl: "https://picsum.photos/seed/3kw/640/480",
          financingEligible: true,
        },
        {
          name: "5KW Inverter",
          description: "Pure sine-wave inverter for heavy loads.",
          priceKobo: 420000000, // ₦4,200,000
          stock: 5,
          minOrder: 1,
          brand: "Voltron",
          imageUrl: "https://picsum.photos/seed/5kw/640/480",
          financingEligible: false,
        },
      ];
    }

    const rows = items.map((p) => ({
      name: p.name,
      description: p.description ?? "",
      priceKobo: toKobo(p.priceKobo ?? p.price ?? p.price_naira),
      stock: p.stock ?? 0,
      minOrder: p.minOrder ?? 1,
      brand: p.brand ?? null,
      imageUrl: p.imageUrl ?? null,
      financingEligible: Boolean(p.financingEligible),
      categoryId: p.categoryId ?? null, // if you have Categories table FK
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("Products", rows);
  },

  async down(queryInterface /*, Sequelize */) {
    await queryInterface.bulkDelete("Products", null, {});
  },
};
