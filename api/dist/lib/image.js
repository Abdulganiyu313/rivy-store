"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickImage = void 0;
const pickImage = (p) => p.images?.[0] || p.imageUrl || "/placeholder.png";
exports.pickImage = pickImage;
//# sourceMappingURL=image.js.map