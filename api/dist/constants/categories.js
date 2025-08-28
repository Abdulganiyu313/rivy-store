"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CATEGORY_LIST = void 0;
exports.isCategory = isCategory;
exports.CATEGORY_LIST = [
    "Batteries",
    "Inverters",
    "Solar Panels",
    "Solar Kits / Solutions",
    "Portable / Outdoor Power",
    "Accessories / Controllers",
];
function isCategory(x) {
    return !!x && exports.CATEGORY_LIST.includes(x);
}
//# sourceMappingURL=categories.js.map