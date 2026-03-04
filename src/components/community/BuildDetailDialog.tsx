import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { type CommunityBuild, type BuildPart, USE_CASES } from '@/hooks/useCommunityBuilds';
import { formatDistanceToNow } from 'date-fns';
import {
  User,
  Loader2,
  BadgeCheck,
  Star,
  Package,
  Cpu,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Zap,
  Box,
  Fan,
  Monitor,
} from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  CPU: Cpu,
  GPU: Monitor,
  RAM: MemoryStick,
  Motherboard: CircuitBoard,
  Storage: HardDrive,
  PSU: Zap,
  Case: Box,
  Cooling: Fan,
};

interface ProductDetail {
  id: string;
  name: string;
  brand: string;
  description: string | null;
  image_url: string | null;
  specs: Record<string, any> | null;
  listing?: {
    price: number;
    condition: string | null;
    stock: number;
    shipping_cost: number | null;
    seller: {
      name: string;
      rating: number | null;
      verified: boolean | null;
    };
  };
}

interface BuildDetailDialogProps {
  build: CommunityBuild | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BuildDetailDialog({ build, open, onOpenChange }: BuildDetailDialogProps) {
  const [productDetails, setProductDetails] = useState<Record<string, ProductDetail>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!build || !open) {
      setProductDetails({});
      return;
    }

    const productIds = build.parts
      .filter((p) => p.product_id)
      .map((p) => p.product_id!);

    if (productIds.length === 0) return;

    setLoading(true);
    (async () => {
      try {
        const { data: products } = await supabase
          .from('products')
          .select('id, name, brand, description, image_url, specs')
          .in('id', productIds);

        const listingIds = build.parts
          .filter((p) => p.listing_id)
          .map((p) => p.listing_id!);

        let listingsMap: Record<string, any> = {};
        if (listingIds.length > 0) {
          const { data: listings } = await supabase
            .from('product_listings')
            .select('id, price, condition, stock, shipping_cost, seller_id')
            .in('id', listingIds);

          if (listings && listings.length > 0) {
            const sellerIds = [...new Set(listings.map((l) => l.seller_id))];
            const { data: sellers } = await supabase
              .from('sellers')
              .select('id, name, rating, verified')
              .in('id', sellerIds);

            const sellersMap = Object.fromEntries((sellers || []).map((s) => [s.id, s]));

            for (const listing of listings) {
              listingsMap[listing.id] = {
                ...listing,
                seller: sellersMap[listing.seller_id] || { name: 'Unknown', rating: null, verified: false },
              };
            }
          }
        }

        const details: Record<string, ProductDetail> = {};
        for (const product of products || []) {
          const part = build.parts.find((p) => p.product_id === product.id);
          const listing = part?.listing_id ? listingsMap[part.listing_id] : undefined;
          details[product.id] = {
            id: product.id,
            name: product.name,
            brand: product.brand,
            description: product.description,
            image_url: product.image_url,
            specs: product.specs as Record<string, any> | null,
            listing: listing
              ? {
                  price: listing.price,
                  condition: listing.condition,
                  stock: listing.stock,
                  shipping_cost: listing.shipping_cost,
                  seller: listing.seller,
                }
              : undefined,
          };
        }
        setProductDetails(details);
      } catch (err) {
        console.error('Failed to fetch product details', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [build, open]);

  if (!build) return null;

  const useCaseInfo = USE_CASES.find((u) => u.value === build.use_case) || USE_CASES[USE_CASES.length - 1];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
        {/* Hero image */}
        {build.image_url && (
          <div className="w-full h-56 overflow-hidden">
            <img
              src={build.image_url}
              alt={build.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Header */}
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{build.profile?.username || 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(build.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${useCaseInfo.color}`}>
                {useCaseInfo.label}
              </span>
            </div>
            <DialogTitle className="font-display text-xl">{build.title}</DialogTitle>
          </DialogHeader>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{build.description}</p>

          {/* Parts Detail */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Parts List ({build.parts.length})
            </h3>

            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}

            {build.parts.map((part, i) => {
              const detail = part.product_id ? productDetails[part.product_id] : null;
              const Icon = categoryIcons[part.category] || Package;

              return (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card/50 overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-4">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {part.category}
                      </p>
                      <p className="font-semibold truncate">{part.name}</p>
                      {detail?.brand && (
                        <p className="text-xs text-muted-foreground">{detail.brand}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary">₨{part.price.toLocaleString()}</p>
                      {part.seller_name && (
                        <p className="text-xs text-muted-foreground">{part.seller_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Product specs & seller details */}
                  {detail && (
                    <div className="border-t border-border px-4 py-3 bg-secondary/30 space-y-3">
                      {/* Specs */}
                      {detail.specs && Object.keys(detail.specs).length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Specifications</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {Object.entries(detail.specs).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-xs">
                                <span className="text-muted-foreground capitalize">
                                  {key.replace(/_/g, ' ')}
                                </span>
                                <span className="font-medium text-foreground">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Seller info */}
                      {detail.listing && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Seller</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{detail.listing.seller.name}</span>
                              {detail.listing.seller.verified && (
                                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                              )}
                              {detail.listing.seller.rating && (
                                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                  <Star className="h-3 w-3 fill-warning text-warning" />
                                  {detail.listing.seller.rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="capitalize">{detail.listing.condition}</span>
                              {detail.listing.shipping_cost && detail.listing.shipping_cost > 0 ? (
                                <span>+₨{detail.listing.shipping_cost} shipping</span>
                              ) : (
                                <span className="text-green-500">Free shipping</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total */}
          {build.total_price > 0 && (
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-muted-foreground font-medium">Total Build Cost</span>
              <span className="text-2xl font-display font-bold gradient-text">
                ₨{build.total_price.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
