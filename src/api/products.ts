import { Product } from '../types';

const BASE_URL = 'https://dummyjson.com/products';

export type ProductsResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

export async function fetchProducts({
  limit = 10,
  skip = 0,
}: {
  limit?: number;
  skip?: number;
} = {}): Promise<ProductsResponse> {
  const response = await fetch(`${BASE_URL}?limit=${limit}&skip=${skip}`);

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json();
  console.log('[API] fetchProducts response:', data);
  return data as ProductsResponse;
}

export async function fetchProductById(id: number): Promise<Product> {
  const response = await fetch(`${BASE_URL}/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch product details');
  }

  const data = await response.json();
  console.log(`[API] fetchProductById(${id}) response:`, data);
  return data as Product;
}
