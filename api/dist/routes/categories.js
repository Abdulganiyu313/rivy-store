"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const r = (0, express_1.Router)();
r.get("/", async (_req, res) => {
    const cats = await models_1.Category.findAll({ order: [["name", "ASC"]] });
    res.json({ data: cats });
});
exports.default = r;
