"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      status: { type: Sequelize.STRING, allowNull: false },
      subtotal_kobo: { type: Sequelize.INTEGER, allowNull: false },
      tax_kobo: { type: Sequelize.INTEGER, allowNull: false },
      total_kobo: { type: Sequelize.INTEGER, allowNull: false },
      customer_name: { type: Sequelize.STRING, allowNull: false },
      customer_email: { type: Sequelize.STRING, allowNull: false },
      customer_address: { type: Sequelize.STRING, allowNull: false },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
    await queryInterface.addIndex("orders", ["created_at"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("orders");
  },
};
