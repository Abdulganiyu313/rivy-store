export type Product = {
  id: string;
  name: string;
  description?: string;
  priceKobo: number;
  minOrder: number;
  stock: number;
  imageUrl?: string;
  images?: string[];
  brand?: string;
  category?: string;
  createdAt?: string;
};
