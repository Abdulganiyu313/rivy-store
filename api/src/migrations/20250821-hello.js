"use strict";
module.exports = {
  async up(q){ await q.sequelize.query("SELECT 1"); },
  async down(){}
};