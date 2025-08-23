// path: web/src/hooks/useCart.ts

import useCartStore, { type CartItem as _CartItem } from "../stores/useCart";

export default useCartStore; // default export
export const useCart = useCartStore; // named export (alias of default)

export type CartItem = _CartItem;
