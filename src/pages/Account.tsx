import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  User,
  Package,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Save,
  ShoppingBag,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  payment_method: string | null;
  card_last_four: string | null;
}

interface Order {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  shipping_total: number;
  customer_name: string;
  payment_method: string;
  created_at: string;
  items: { id: string; product_name: string; quantity: number; unit_price: number; seller_name: string }[];
}

function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, phone, address, city, postal_code, payment_method, card_last_four')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });
}

function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile'),
  });
}

function useMyOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async (): Promise<Order[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total, subtotal, shipping_total, customer_name, payment_method, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const orders: Order[] = [];
      for (const order of data || []) {
        const { data: items } = await supabase
          .from('order_items')
          .select('id, product_name, quantity, unit_price, seller_name')
          .eq('order_id', order.id);
        orders.push({ ...order, items: items || [] });
      }
      return orders;
    },
    enabled: !!user,
  });
}

function AccountDetails() {
  const { data: profile, isLoading } = useProfile();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardLastFour, setCardLastFour] = useState('');

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setPostalCode(profile.postal_code || '');
      setPaymentMethod(profile.payment_method || '');
      setCardLastFour(profile.card_last_four || '');
    }
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      username,
      phone: phone || null,
      address: address || null,
      city: city || null,
      postal_code: postalCode || null,
      payment_method: paymentMethod || null,
      card_last_four: cardLastFour || null,
    } as any);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Personal Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          <User className="h-4 w-4" />
          Personal Information
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={50} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-muted/50 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {user?.email}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" className="pl-10" maxLength={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          <MapPin className="h-4 w-4" />
          Shipping Address
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label>Street Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House #, Street, Area" maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lahore" maxLength={50} />
          </div>
          <div className="space-y-2">
            <Label>Postal Code</Label>
            <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="54000" maxLength={10} />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          <CreditCard className="h-4 w-4" />
          Payment Method
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Preferred Payment</Label>
            <Input value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="e.g. JazzCash, EasyPaisa, Bank Transfer" maxLength={50} />
          </div>
          <div className="space-y-2">
            <Label>Account / Card (last 4 digits)</Label>
            <Input value={cardLastFour} onChange={(e) => setCardLastFour(e.target.value)} placeholder="1234" maxLength={4} />
          </div>
        </div>
      </div>

      <Button type="submit" variant="glow" className="gap-2" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Changes
      </Button>
    </form>
  );
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  processing: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

function MyOrders() {
  const { data: orders, isLoading } = useMyOrders();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bento-card p-12 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display font-semibold text-lg mb-1">No orders yet</h3>
        <p className="text-sm text-muted-foreground">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bento-card p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium font-mono">#{order.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[order.status] || statusColors.pending}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <span className="font-display font-bold text-primary">₨{order.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg bg-secondary/50">
                <span className="truncate">
                  <span className="text-muted-foreground mr-2">×{item.quantity}</span>
                  {item.product_name}
                </span>
                <span className="font-mono text-xs text-muted-foreground shrink-0 ml-2">
                  ₨{(item.unit_price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
            <span>Payment: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
            <span>Shipping: ₨{order.shipping_total.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Account() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            My <span className="gradient-text">Account</span>
          </h1>
          <p className="text-muted-foreground mt-1">Manage your profile, addresses and orders</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account" className="gap-2">
              <User className="h-4 w-4" />
              My Account
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              My Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="bento-card p-6">
            <AccountDetails />
          </TabsContent>

          <TabsContent value="orders">
            <MyOrders />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
