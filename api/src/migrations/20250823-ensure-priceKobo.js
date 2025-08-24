"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      const table = await queryInterface
        .describeTable("Products")
        .catch(() => ({}));

      // Add priceKobo if missing
      if (!table.priceKobo) {
        await queryInterface.addColumn(
          "Products",
          "priceKobo",
          { type: Sequelize.INTEGER, allowNull: true }, // temp nullable while we backfill
          { transaction: t }
        );
      }

      // If legacy 'price' exists, backfill priceKobo then drop price
      if (table.price) {
        // If 'price' stored as naira, multiply by 100. If it was already kobo-sized, keep as-is.
        await queryInterface.sequelize.query(
          `
          UPDATE "Products"
          SET "priceKobo" =
            CASE
              WHEN "price" >= 10000000 THEN CAST("price" AS INTEGER)     -- looks like kobo already
              ELSE CAST(ROUND("price" * 100) AS INTEGER)                 -- looks like naira -> kobo
            END
          WHERE "priceKobo" IS NULL;
        `,
          { transaction: t }
        );

        await queryInterface.removeColumn("Products", "price", {
          transaction: t,
        });
      }

      // Make priceKobo NOT NULL finally
      await queryInterface.changeColumn(
        "Products",
        "priceKobo",
        { type: Sequelize.INTEGER, allowNull: false },
        { transaction: t }
      );

      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      const table = await queryInterface
        .describeTable("Products")
        .catch(() => ({}));
      if (table.priceKobo) {
        // (Optional) recreate 'price' if you want full rollback. Usually not needed.
        await queryInterface.removeColumn("Products", "priceKobo", {
          transaction: t,
        });
      }
      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },
};
