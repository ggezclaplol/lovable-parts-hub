import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Generate or retrieve a persistent session ID for guest users
function getSessionId(): string {
  const key = 'pcforge_session_id';
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
}

export function useSessionId() {
  return getSessionId();
}

export interface CartItem {
  id: string;
  listing_id: string;
  quantity: number;
  listing: {
    id: string;
    price: number;
    stock: number;
    condition: string;
    shipping_cost: number;
    product: {
      id: string;
      name: string;
      brand: string;
      image_url: string | null;
    };
    seller: {
      id: string;
      name: string;
      verified: boolean;
    };
  };
}

export function useCart() {
  const sessionId = getSessionId();

  return useQuery({
    queryKey: ['cart', sessionId],
    queryFn: async (): Promise<CartItem[]> => {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          listing_id,
          quantity,
          product_listings (
            id,
            price,
            stock,
            condition,
            shipping_cost,
            products (
              id,
              name,
              brand,
              image_url
            ),
            sellers (
              id,
              name,
              verified
            )
          )
        `)
        .eq('session_id', sessionId);

      if (error) throw error;

      return (data || []).map((item) => ({
        id: item.id,
        listing_id: item.listing_id,
        quantity: item.quantity,
        listing: {
          id: item.product_listings?.id || '',
          price: Number(item.product_listings?.price) || 0,
          stock: item.product_listings?.stock || 0,
          condition: item.product_listings?.condition || 'new',
          shipping_cost: Number(item.product_listings?.shipping_cost) || 0,
          product: {
            id: item.product_listings?.products?.id || '',
            name: item.product_listings?.products?.name || '',
            brand: item.product_listings?.products?.brand || '',
            image_url: item.product_listings?.products?.image_url || null,
          },
          seller: {
            id: item.product_listings?.sellers?.id || '',
            name: item.product_listings?.sellers?.name || '',
            verified: item.product_listings?.sellers?.verified || false,
          },
        },
      }));
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async ({ listingId, quantity = 1 }: { listingId: string; quantity?: number }) => {
      // Check if item already exists in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('session_id', sessionId)
        .eq('listing_id', listingId)
        .single();

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            session_id: sessionId,
            listing_id: listingId,
            quantity,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', sessionId] });
      toast.success('Added to cart');
    },
    onError: () => {
      toast.error('Failed to add to cart');
    },
  });
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', cartItemId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', cartItemId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', sessionId] });
    },
    onError: () => {
      toast.error('Failed to update cart');
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async (cartItemId: string) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', sessionId] });
      toast.success('Removed from cart');
    },
    onError: () => {
      toast.error('Failed to remove from cart');
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('session_id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', sessionId] });
    },
  });
}

export function useCartCount() {
  const { data: cart } = useCart();
  return cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
}

export function useCartTotal() {
  const { data: cart } = useCart();
  if (!cart) return { subtotal: 0, shipping: 0, total: 0 };
  
  const subtotal = cart.reduce((sum, item) => sum + item.listing.price * item.quantity, 0);
  const shipping = cart.reduce((sum, item) => sum + item.listing.shipping_cost, 0);
  
  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
  };
}
