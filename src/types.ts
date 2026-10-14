export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock: number;
  thumbnail: string;
  images?: string[];
  brand?: string;
  category?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
