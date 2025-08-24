"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      const table = await queryInterface
        .describeTable("Products")
        .catch(() => ({}));

      if (!table.brand) {
        await queryInterface.addColumn(
          "Products",
          "brand",
          { type: Sequelize.STRING, allowNull: true },
          { transaction: t }
        );
      }
      if (!table.category) {
        await queryInterface.addColumn(
          "Products",
          "category",
          { type: Sequelize.STRING, allowNull: true },
          { transaction: t }
        );
      }
      if (!table.minOrder) {
        await queryInterface.addColumn(
          "Products",
          "minOrder",
          { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
          { transaction: t }
        );
      }
      if (!table.stock) {
        await queryInterface.addColumn(
          "Products",
          "stock",
          { type: Sequelize.INTEGER, allowNull: false, defaultValue: 999 },
          { transaction: t }
        );
      }
      if (!table.imageUrl) {
        await queryInterface.addColumn(
          "Products",
          "imageUrl",
          { type: Sequelize.TEXT, allowNull: true },
          { transaction: t }
        );
      }
      if (!table.images) {
        await queryInterface.addColumn(
          "Products",
          "images",
          { type: Sequelize.JSONB, allowNull: true },
          { transaction: t }
        );
      }

      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  async down(queryInterface /*, Sequelize */) {
    const t = await queryInterface.sequelize.transaction();
    try {
      const table = await queryInterface
        .describeTable("Products")
        .catch(() => ({}));
      if (table.images)
        await queryInterface.removeColumn("Products", "images", {
          transaction: t,
        });
      if (table.imageUrl)
        await queryInterface.removeColumn("Products", "imageUrl", {
          transaction: t,
        });
      if (table.stock)
        await queryInterface.removeColumn("Products", "stock", {
          transaction: t,
        });
      if (table.minOrder)
        await queryInterface.removeColumn("Products", "minOrder", {
          transaction: t,
        });
      if (table.category)
        await queryInterface.removeColumn("Products", "category", {
          transaction: t,
        });
      if (table.brand)
        await queryInterface.removeColumn("Products", "brand", {
          transaction: t,
        });
      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },
};
