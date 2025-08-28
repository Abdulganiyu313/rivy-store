// api/scripts/bootstrap-products.js
require("dotenv").config({ override: true });
const { Client } = require("pg");

(async () => {
  console.log("DB URL =", process.env.DATABASE_URL);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // 1) Create table "Products" if it doesn't exist (matches your model)
  await client.query(`
    CREATE TABLE IF NOT EXISTS "Products" (
      id               SERIAL PRIMARY KEY,
      name             TEXT NOT NULL,
      description      TEXT,
      "priceKobo"      INTEGER NOT NULL DEFAULT 0,
      stock            INTEGER NOT NULL DEFAULT 0,
      "minOrder"       INTEGER NOT NULL DEFAULT 1,
      brand            TEXT,
      category         TEXT,
      "imageUrl"       TEXT,
      images           JSONB,
      "financingEligible" BOOLEAN DEFAULT FALSE,
      "categoryId"     INTEGER,
      "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 2) Seed a few rows (quick demo data)
  const rows = [
    {
      name: "Luminous 200Ah Solar Battery",
      description:
        "Deep-cycle tubular battery designed for reliable solar backup in homes and offices. Long-lasting performance with minimal maintenance.",
      priceKobo: 42000000,
      stock: 12,
      minOrder: 1,
      brand: "Luminous",
      imageUrl:
        "https://plus.unsplash.com/premium_photo-1716824502431-b93e3756a6aa?q=80&w=1170&auto=format&fit=crop",
      financingEligible: true,
    },
    {
      name: "LiFePO₄ 100Ah Lithium Battery",
      description:
        "Lightweight lithium iron phosphate battery offering superior cycle life, faster charging, and high efficiency for solar systems.",
      priceKobo: 35000000,
      stock: 10,
      minOrder: 1,
      brand: "EnergyStack",
      imageUrl:
        "https://solarcreed.com/cdn/shop/articles/IMG_9384_1024x.jpg?v=1689097127",
      financingEligible: true,
    },
    {
      name: "12V 200Ah AGM Battery",
      description:
        "Sealed maintenance-free AGM battery, optimized for inverter and solar hybrid setups. Spill-proof and durable.",
      priceKobo: 28000000,
      stock: 15,
      minOrder: 1,
      brand: "Solamart",
      imageUrl:
        "https://www.solamart.com.au/wp-content/uploads/2017/09/BAE-BankLarge-1.png",
      financingEligible: true,
    },
    {
      name: "24V 150Ah Deep Cycle Battery",
      description:
        "Rugged deep-cycle lead-acid battery built for daily cycling and demanding solar applications. Ideal for households and SMEs.",
      priceKobo: 31000000,
      stock: 8,
      minOrder: 1,
      brand: "Victron",
      imageUrl:
        "https://images.unsplash.com/photo-1582719478185-2c9f4e4634e4?q=80&w=1170&auto=format&fit=crop",
      financingEligible: true,
    },
    {
      name: "1.5kVA Pure Sine Inverter",
      description:
        "Entry-level pure sine wave inverter suitable for lights, TVs, fans, and basic appliances. Compact and efficient.",
      priceKobo: 22000000,
      stock: 18,
      minOrder: 1,
      brand: "EnergyStack",
      imageUrl:
        "https://images.unsplash.com/photo-1662601304484-53426e5fa4ce?q=80&w=1170&auto=format&fit=crop",
      financingEligible: true,
    },
    {
      name: "3.5kVA Hybrid Inverter (MPPT)",
      description:
        "All-in-one hybrid inverter with MPPT charge controller. Supports both grid and solar input for uninterrupted power supply.",
      priceKobo: 48000000,
      stock: 10,
      minOrder: 1,
      brand: "Xindun",
      imageUrl:
        "https://www.xinduninverter.com/uploadfile/2023/01/11/20230111181418WPh2mt.jpg",
      financingEligible: true,
    },
    {
      name: "5kVA Inverter Pro",
      description:
        "High-capacity inverter suitable for offices, small businesses, and homes with heavy load appliances like fridges and ACs.",
      priceKobo: 68000000,
      stock: 6,
      minOrder: 1,
      brand: "Sukam",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEjyLlJgAT-3MYELETOspxptpoGmjx_kcuMg&s",
      financingEligible: true,
    },
    {
      name: "Inverter Trolley with AVR",
      description:
        "Portable inverter system with automatic voltage regulation. Easy to move and perfect for homes with space constraints.",
      priceKobo: 25000000,
      stock: 12,
      minOrder: 1,
      brand: "BlueGate",
      imageUrl:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1170&auto=format&fit=crop",
      financingEligible: true,
    },
    {
      name: "100W Monocrystalline Panel",
      description:
        "Compact, high-efficiency panel suitable for portable kits, streetlights, and small installations.",
      priceKobo: 7500000,
      stock: 25,
      minOrder: 1,
      brand: "Trina Solar",
      imageUrl:
        "https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=2076&auto=format&fit=crop",
      financingEligible: false,
    },
    {
      name: "300W Polycrystalline Panel",
      description:
        "Cost-effective poly panel designed for homes and SMEs. Reliable power output even in high temperatures.",
      priceKobo: 12000000,
      stock: 20,
      minOrder: 1,
      brand: "Canadian Solar",
      imageUrl:
        "https://images.unsplash.com/photo-1545209463-e2825498edbf?q=80&w=1974&auto=format&fit=crop",
      financingEligible: true,
    },
    {
      name: "450W Half-Cut Mono Panel",
      description:
        "Advanced half-cut cell design for higher efficiency and better shade tolerance. Perfect for rooftops and farms.",
      priceKobo: 20000000,
      stock: 12,
      minOrder: 1,
      brand: "JA Solar",
      imageUrl:
        "https://plus.unsplash.com/premium_photo-1668078530961-32f4a1107791?q=80&w=2070&auto=format&fit=crop",
      financingEligible: true,
    },
    {
      name: "Flexible 200W Panel",
      description:
        "Lightweight flexible solar panel ideal for curved surfaces, boats, and camping vans.",
      priceKobo: 9500000,
      stock: 15,
      minOrder: 1,
      brand: "SunPower",
      imageUrl:
        "https://images.unsplash.com/photo-1662601311085-e5747d08992a?w=600&auto=format&fit=crop&q=60",
      financingEligible: false,
    },
    {
      name: "Small Household Starter Kit (500W)",
      description:
        "Affordable starter kit powering lights, fans, TV, and phone charging. Includes inverter, panel, and battery.",
      priceKobo: 30000000,
      stock: 14,
      minOrder: 1,
      brand: "EnergyStack",
      imageUrl:
        "https://images.unsplash.com/photo-1681263576084-e054b2d89903?q=80&w=1170&auto=format&fit=crop",
      financingEligible: true,
    },
    {
      name: "Small Office Kit (1.5kW)",
      description:
        "Reliable office backup system. Runs laptops, routers, lights, and small printers. Expandable for future needs.",
      priceKobo: 95000000,
      stock: 9,
      minOrder: 1,
      brand: "EnergyStack",
      imageUrl:
        "https://plus.unsplash.com/premium_photo-1715811632378-044ee74b6f77?q=80&w=1170&auto=format&fit=crop",
      financingEligible: true,
    },
    {
      name: "Backup Essentials Kit (1kW)",
      description:
        "Backup package for households needing uninterrupted power for essentials. Includes inverter and 2 batteries.",
      priceKobo: 65000000,
      stock: 7,
      minOrder: 1,
      brand: "Luminous",
      imageUrl:
        "https://images.unsplash.com/photo-1662601355172-772b4daa361d?w=600&auto=format&fit=crop&q=60",
      financingEligible: true,
    },
    {
      name: "Home Plus Kit (2.5kW)",
      description:
        "Comprehensive solar solution powering fridge, TVs, and multiple appliances. Best for medium homes.",
      priceKobo: 175000000,
      stock: 5,
      minOrder: 1,
      brand: "EnergyStack",
      imageUrl:
        "https://images.unsplash.com/photo-1606220985720-3b9291d5d0b6?q=80&w=1170&auto=format&fit=crop",
      financingEligible: true,
    },
    {
      name: "Portable Camping Panel 120W",
      description:
        "Foldable solar panel kit for outdoor activities and camping. Lightweight, easy to carry, and plug-and-play.",
      priceKobo: 6000000,
      stock: 20,
      minOrder: 1,
      brand: "EcoFlow",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4rB4S3VCxonBCIW0zflKBUOC-sKgAHjrrbQ&s",
      financingEligible: false,
    },
    {
      name: "Event Power Box (1kWh)",
      description:
        "Portable solar power station designed for small events and outdoor gatherings. Quiet, clean energy.",
      priceKobo: 35000000,
      stock: 6,
      minOrder: 1,
      brand: "Jackery",
      imageUrl:
        "https://image.made-in-china.com/202f0j00aqzhgHGIupUd/2220wh-22-2V-100Ah-800W-Solar-Energy-Battery-Storage-Power-Bank-Outdoor-Camping-Portable-Power-Station.webp",
      financingEligible: true,
    },
    {
      name: "MPPT Solar Charge Controller 40A",
      description:
        "High-efficiency MPPT charge controller ensuring fast and safe charging of batteries from panels.",
      priceKobo: 8500000,
      stock: 25,
      minOrder: 1,
      brand: "Victron",
      imageUrl:
        "data:image/jpeg;base64,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",
      financingEligible: false,
    },
    {
      name: "MC4 Cable & Connector Kit",
      description:
        "Pre-terminated MC4 connectors and cables for safe, professional solar installations.",
      priceKobo: 2500000,
      stock: 40,
      minOrder: 1,
      brand: "Generic",
      imageUrl:
        "data:image/jpeg;base64,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",
      financingEligible: false,
    },
  ];

  for (const p of rows) {
    await client.query(
      `
      INSERT INTO "Products"
        (name, description, "priceKobo", stock, "minOrder", brand, category, "imageUrl", "financingEligible", "createdAt", "updatedAt")
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `,
      [
        p.name,
        p.description,
        p.priceKobo,
        p.stock,
        p.minOrder,
        p.brand,
        p.category,
        p.imageUrl,
        p.financingEligible,
      ]
    );
  }

  const countRes = await client.query(
    `SELECT COUNT(*)::int AS n FROM "Products";`
  );
  console.log("Products count =", countRes.rows[0].n);

  const sampleRes = await client.query(
    `SELECT id, name FROM "Products" ORDER BY id ASC LIMIT 3;`
  );
  console.log("Sample =", sampleRes.rows);

  await client.end();
  console.log("Bootstrap done.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
