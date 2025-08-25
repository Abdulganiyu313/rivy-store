import { useCartStore } from "../stores/useCart";

export default useCartStore; // default export
export const useCart = useCartStore; // named export (alias of default)
