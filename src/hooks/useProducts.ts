import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductWithListings {
  id: string;
  name: string;
  brand: string;
  description: string | null;
  specs: Record<string, string>;
  image_url: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  } | null;
  listings: {
    id: string;
    price: number;
    stock: number;
    condition: string;
    shipping_cost: number;
    is_available: boolean;
    seller: {
      id: string;
      name: string;
      rating: number;
      verified: boolean;
    };
  }[];
  lowest_price: number;
  total_stock: number;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<ProductWithListings[]> => {
      // Fetch products with their categories
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          brand,
          description,
          specs,
          image_url,
          categories (
            id,
            name,
            slug,
            icon
          )
        `);

      if (productsError) throw productsError;

      // Fetch all listings with sellers
      const { data: listings, error: listingsError } = await supabase
        .from('product_listings')
        .select(`
          id,
          product_id,
          price,
          stock,
          condition,
          shipping_cost,
          is_available,
          sellers (
            id,
            name,
            rating,
            verified
          )
        `)
        .eq('is_available', true);

      if (listingsError) throw listingsError;

      // Combine products with their listings
      return (products || []).map((product) => {
        const productListings = (listings || [])
          .filter((l) => l.product_id === product.id)
          .map((l) => ({
            id: l.id,
            price: Number(l.price),
            stock: l.stock,
            condition: l.condition || 'new',
            shipping_cost: Number(l.shipping_cost),
            is_available: l.is_available ?? true,
            seller: {
              id: l.sellers?.id || '',
              name: l.sellers?.name || 'Unknown',
              rating: Number(l.sellers?.rating) || 0,
              verified: l.sellers?.verified || false,
            },
          }));

        const prices = productListings.map((l) => l.price);
        const stocks = productListings.map((l) => l.stock);

        return {
          id: product.id,
          name: product.name,
          brand: product.brand,
          description: product.description,
          specs: (product.specs as Record<string, string>) || {},
          image_url: product.image_url,
          category: product.categories,
          listings: productListings,
          lowest_price: prices.length > 0 ? Math.min(...prices) : 0,
          total_stock: stocks.reduce((sum, s) => sum + s, 0),
        };
      });
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
}
