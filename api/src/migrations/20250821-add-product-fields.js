"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "brand", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Products", "category", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Products", "minOrder", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });
    await queryInterface.addColumn("Products", "stock", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 999,
    });
    await queryInterface.addColumn("Products", "imageUrl", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    // optional: array of URLs if you want a small gallery
    await queryInterface.addColumn("Products", "images", {
      type: Sequelize.JSONB, // store as ["url1", "url2"]
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Products", "brand");
    await queryInterface.removeColumn("Products", "category");
    await queryInterface.removeColumn("Products", "minOrder");
    await queryInterface.removeColumn("Products", "stock");
    await queryInterface.removeColumn("Products", "imageUrl");
    await queryInterface.removeColumn("Products", "images");
  },
};
