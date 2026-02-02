import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ShieldCheck,
  DollarSign,
  Store,
} from 'lucide-react';

interface ListingFormData {
  product_id: string;
  seller_id: string;
  price: string;
  stock: string;
  condition: string;
  shipping_cost: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();
  const queryClient = useQueryClient();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ListingFormData>({
    product_id: '',
    seller_id: '',
    price: '',
    stock: '',
    condition: 'new',
    shipping_cost: '0',
  });

  // Get all unique listings across products
  const allListings = products?.flatMap((product) =>
    product.listings.map((listing) => ({
      ...listing,
      productName: product.name,
      productBrand: product.brand,
      productId: product.id,
    }))
  ) || [];

  const handleAddListing = async () => {
    if (!formData.product_id || !formData.seller_id || !formData.price || !formData.stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('product_listings').insert({
        product_id: formData.product_id,
        seller_id: formData.seller_id,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        condition: formData.condition,
        shipping_cost: parseFloat(formData.shipping_cost) || 0,
        is_available: true,
      });

      if (error) throw error;

      toast.success('Listing added successfully');
      setIsAddDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateListing = async (listingId: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('product_listings')
        .update({
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          condition: formData.condition,
          shipping_cost: parseFloat(formData.shipping_cost) || 0,
        })
        .eq('id', listingId);

      if (error) throw error;

      toast.success('Listing updated successfully');
      setEditingListing(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const { error } = await supabase
        .from('product_listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      toast.success('Listing deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete listing');
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      seller_id: '',
      price: '',
      stock: '',
      condition: 'new',
      shipping_cost: '0',
    });
  };

  const startEditing = (listing: any) => {
    setEditingListing(listing.id);
    setFormData({
      product_id: listing.productId,
      seller_id: listing.seller.id,
      price: listing.price.toString(),
      stock: listing.stock.toString(),
      condition: listing.condition,
      shipping_cost: listing.shipping_cost.toString(),
    });
  };

  if (productsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Get unique products and sellers for dropdowns
  const uniqueProducts = products?.map((p) => ({ id: p.id, name: p.name, brand: p.brand })) || [];
  const uniqueSellers = Array.from(
    new Map(
      allListings.map((l) => [l.seller.id, { id: l.seller.id, name: l.seller.name }])
    ).values()
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome, {user?.name} • Manage product listings
              </p>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="glow">
                <Plus className="h-4 w-4 mr-2" />
                Add Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Listing</DialogTitle>
                <DialogDescription>
                  Create a new product listing for a seller
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select
                    value={formData.product_id}
                    onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.brand} - {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Seller</Label>
                  <Select
                    value={formData.seller_id}
                    onValueChange={(value) => setFormData({ ...formData, seller_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a seller" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueSellers.map((seller) => (
                        <SelectItem key={seller.id} value={seller.id}>
                          {seller.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (Rs.)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData({ ...formData, condition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like-new">Like New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="refurbished">Refurbished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Shipping Cost (Rs.)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.shipping_cost}
                      onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddListing} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Listing
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Listings</p>
                <p className="text-2xl font-bold">{allListings.length}</p>
              </div>
            </div>
          </div>
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <Store className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Sellers</p>
                <p className="text-2xl font-bold">{uniqueSellers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Table */}
        <div className="glass-effect rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Product Listings</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Shipping</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allListings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No listings found. Add your first listing!
                    </TableCell>
                  </TableRow>
                ) : (
                  allListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{listing.productName}</p>
                          <p className="text-sm text-muted-foreground">{listing.productBrand}</p>
                        </div>
                      </TableCell>
                      <TableCell>{listing.seller.name}</TableCell>
                      <TableCell>
                        {editingListing === listing.id ? (
                          <Input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-24"
                          />
                        ) : (
                          `Rs. ${listing.price.toLocaleString()}`
                        )}
                      </TableCell>
                      <TableCell>
                        {editingListing === listing.id ? (
                          <Input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="w-20"
                          />
                        ) : (
                          listing.stock
                        )}
                      </TableCell>
                      <TableCell>
                        {editingListing === listing.id ? (
                          <Select
                            value={formData.condition}
                            onValueChange={(value) => setFormData({ ...formData, condition: value })}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="like-new">Like New</SelectItem>
                              <SelectItem value="used">Used</SelectItem>
                              <SelectItem value="refurbished">Refurbished</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="capitalize">{listing.condition}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingListing === listing.id ? (
                          <Input
                            type="number"
                            value={formData.shipping_cost}
                            onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                            className="w-20"
                          />
                        ) : listing.shipping_cost > 0 ? (
                          `Rs. ${listing.shipping_cost}`
                        ) : (
                          <span className="text-success">Free</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingListing === listing.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateListing(listing.id)}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingListing(null);
                                resetForm();
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => startEditing(listing)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteListing(listing.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Demo credentials info */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            <strong>Demo Mode:</strong> You're logged in as {user?.email}. This is a demonstration with mock authentication.
          </p>
        </div>
      </div>
    </Layout>
  );
}
