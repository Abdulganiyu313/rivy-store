"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface /*, Sequelize */) {
    const now = new Date();

    const rows = [
      {
        name: "Luminous 200Ah Solar Battery",
        description:
          "Deep-cycle tubular battery designed for reliable solar backup in homes and offices. Long-lasting performance with minimal maintenance.",
        priceKobo: 42000000,
        stock: 12,
        minOrder: 1,
        brand: "Luminous",
        category: "Battery",
        imageUrl:
          "https://plus.unsplash.com/premium_photo-1716824502431-b93e3756a6aa?q=80&w=1170&auto=format&fit=crop",
        financingEligible: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "LiFePO₄ 100Ah Lithium Battery",
        description:
          "Lightweight lithium iron phosphate battery offering superior cycle life, faster charging, and high efficiency for solar systems.",
        priceKobo: 35000000,
        stock: 10,
        minOrder: 1,
        brand: "EnergyStack",
        category: "Battery",
        imageUrl:
          "https://solarcreed.com/cdn/shop/articles/IMG_9384_1024x.jpg?v=1689097127",
        financingEligible: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "12V 200Ah AGM Battery",
        description:
          "Sealed maintenance-free AGM battery, optimized for inverter and solar hybrid setups. Spill-proof and durable.",
        priceKobo: 28000000,
        stock: 15,
        minOrder: 1,
        brand: "Solamart",
        category: "Battery",
        imageUrl:
          "https://www.solamart.com.au/wp-content/uploads/2017/09/BAE-BankLarge-1.png",
        financingEligible: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Mono 550W Solar Panel",
        description:
          "High-efficiency monocrystalline module for rooftop installs.",
        priceKobo: 21000000,
        stock: 25,
        minOrder: 1,
        brand: "Jinko",
        category: "Panel",
        imageUrl:
          "https://images.unsplash.com/photo-1497449493050-aad1e7cad165?q=80&w=1200&auto=format&fit=crop",
        financingEligible: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "5kVA Hybrid Inverter",
        description:
          "Pure sine wave hybrid inverter suitable for small homes and offices.",
        priceKobo: 52000000,
        stock: 8,
        minOrder: 1,
        brand: "SMA",
        category: "Inverter",
        imageUrl:
          "https://images.unsplash.com/photo-1600431521340-491eca880813?q=80&w=1200&auto=format&fit=crop",
        financingEligible: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert("Products", rows);
  },

  async down(queryInterface /*, Sequelize */) {
    await queryInterface.bulkDelete("Products", {
      name: [
        "Luminous 200Ah Solar Battery",
        "LiFePO₄ 100Ah Lithium Battery",
        "12V 200Ah AGM Battery",
        "Mono 550W Solar Panel",
        "5kVA Hybrid Inverter",
      ],
    });
  },
};
