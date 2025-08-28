"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_1 = require("../constants/categories");
const r = (0, express_1.Router)();
r.get("/", (_req, res) => {
    res.json({ data: categories_1.CATEGORY_LIST });
});
exports.default = r;
//# sourceMappingURL=categories.js.map