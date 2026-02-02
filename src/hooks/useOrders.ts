import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CartItem, useClearCart, useSessionId } from './useCart';

export interface OrderFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  paymentMethod: 'cod' | 'online';
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const clearCart = useClearCart();
  const sessionId = useSessionId();

  return useMutation({
    mutationFn: async ({ formData, cartItems }: { formData: OrderFormData; cartItems: CartItem[] }) => {
      const subtotal = cartItems.reduce((sum, item) => sum + item.listing.price * item.quantity, 0);
      const shippingTotal = cartItems.reduce((sum, item) => sum + item.listing.shipping_cost, 0);
      const total = subtotal + shippingTotal;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          session_id: sessionId,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          shipping_address: formData.shippingAddress,
          city: formData.city,
          postal_code: formData.postalCode,
          payment_method: formData.paymentMethod,
          subtotal,
          shipping_total: shippingTotal,
          total,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        listing_id: item.listing_id,
        product_name: `${item.listing.product.brand} ${item.listing.product.name}`,
        seller_name: item.listing.seller.name,
        quantity: item.quantity,
        unit_price: item.listing.price,
        shipping_cost: item.listing.shipping_cost,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      clearCart.mutate();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
    },
    onError: (error) => {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    },
  });
}
