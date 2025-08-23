"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface
      .describeTable("Products")
      .catch(() => ({}));
    if (!table.financingEligible) {
      await queryInterface.addColumn("Products", "financingEligible", {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      });
      await queryInterface.addIndex("Products", ["financingEligible"]);
    }
  },
  async down(queryInterface) {
    const table = await queryInterface
      .describeTable("Products")
      .catch(() => ({}));
    if (table.financingEligible) {
      await queryInterface
        .removeIndex("Products", ["financingEligible"])
        .catch(() => {});
      await queryInterface
        .removeColumn("Products", "financingEligible")
        .catch(() => {});
    }
  },
};
