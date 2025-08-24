"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Products
    const productsExists = await queryInterface
      .describeTable("Products")
      .then(() => true)
      .catch(() => false);

    if (!productsExists) {
      await queryInterface.createTable("Products", {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },

        // Use priceKobo from the start to match your code & seeder
        priceKobo: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },

        stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        minOrder: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },

        brand: { type: Sequelize.STRING, allowNull: true },
        category: { type: Sequelize.STRING, allowNull: true },

        imageUrl: { type: Sequelize.TEXT, allowNull: true },
        images: { type: Sequelize.JSONB, allowNull: true },

        financingEligible: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },

        categoryId: { type: Sequelize.INTEGER, allowNull: true },

        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
      });
      await queryInterface.addIndex("Products", ["brand"]);
      await queryInterface.addIndex("Products", ["category"]);
      await queryInterface.addIndex("Products", ["financingEligible"]);
      await queryInterface.addIndex("Products", ["createdAt"]);
    }

    // 2) Orders
    const ordersExists = await queryInterface
      .describeTable("Orders")
      .then(() => true)
      .catch(() => false);

    if (!ordersExists) {
      await queryInterface.createTable("Orders", {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "placed",
        },
        subtotalKobo: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        taxKobo: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        totalKobo: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        name: { type: Sequelize.STRING, allowNull: true },
        email: { type: Sequelize.STRING, allowNull: true },
        address: { type: Sequelize.STRING, allowNull: true },
        currency: { type: Sequelize.STRING, allowNull: true },

        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
      });
      await queryInterface.addIndex("Orders", ["createdAt"]);
      await queryInterface.addIndex("Orders", ["status"]);
    }

    // 3) OrderItems
    const orderItemsExists = await queryInterface
      .describeTable("OrderItems")
      .then(() => true)
      .catch(() => false);

    if (!orderItemsExists) {
      await queryInterface.createTable("OrderItems", {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        orderId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "Orders", key: "id" },
          onDelete: "CASCADE",
        },
        productId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "Products", key: "id" },
          onDelete: "SET NULL",
        },
        name: { type: Sequelize.STRING, allowNull: false },
        unitPriceKobo: { type: Sequelize.INTEGER, allowNull: false },
        qty: { type: Sequelize.INTEGER, allowNull: false },
        subtotalKobo: { type: Sequelize.INTEGER, allowNull: false },

        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
      });
      await queryInterface.addIndex("OrderItems", ["orderId"]);
      await queryInterface.addIndex("OrderItems", ["productId"]);
    }
  },

  async down(queryInterface /*, Sequelize */) {
    // Drop child → parent to avoid FK issues
    const orderItemsExists = await queryInterface
      .describeTable("OrderItems")
      .then(() => true)
      .catch(() => false);
    if (orderItemsExists) await queryInterface.dropTable("OrderItems");

    const ordersExists = await queryInterface
      .describeTable("Orders")
      .then(() => true)
      .catch(() => false);
    if (ordersExists) await queryInterface.dropTable("Orders");

    const productsExists = await queryInterface
      .describeTable("Products")
      .then(() => true)
      .catch(() => false);
    if (productsExists) await queryInterface.dropTable("Products");
  },
};
