import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { 
  Search, 
  Package, 
  Loader2,
  Cpu,
  Monitor,
  HardDrive,
  MemoryStick,
  Filter,
  Star,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  ShoppingCart
} from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  GPU: Monitor,
  CPU: Cpu,
  RAM: MemoryStick,
  Storage: HardDrive,
};

export default function Products() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const isLoading = productsLoading || categoriesLoading;

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let result = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category?.name === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          (p.description?.toLowerCase().includes(query) ?? false)
      );
    }

    return result;
  }, [searchQuery, selectedCategory, products]);

  const categoryOptions = useMemo(() => {
    return ['All', ...(categories?.map((c) => c.name) || [])];
  }, [categories]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground mt-1">
              {filteredProducts.length} products from multiple sellers
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-effect rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <div className="flex gap-2 flex-wrap">
                {categoryOptions.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProducts.map((product, index) => {
              const IconComponent = categoryIcons[product.category?.name || ''] || Package;
              const isExpanded = expandedProduct === product.id;
              const bestListing = product.listings.reduce(
                (best, current) => (!best || current.price < best.price ? current : best),
                product.listings[0]
              );

              return (
                <div
                  key={product.id}
                  className="glass-effect rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                >
                  <div className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className={`shrink-0 rounded-lg bg-secondary/50 flex items-center justify-center transition-all duration-300 ${isExpanded ? 'w-32 h-32' : 'w-24 h-24'}`}>
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <IconComponent className={`text-primary/50 transition-all ${isExpanded ? 'h-16 w-16' : 'h-12 w-12'}`} />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.brand}</p>
                          </div>
                          {product.category && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                              {product.category.name}
                            </span>
                          )}
                        </div>

                        <p className={`text-sm text-muted-foreground mt-2 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {product.description}
                        </p>

                        {/* Specs preview (collapsed) */}
                        {!isExpanded && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
                              <span key={key} className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground">
                                {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded: Full Specs */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                        <h4 className="text-sm font-medium mb-3">Specifications</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Object.entries(product.specs).map(([key, value]) => (
                            <div key={key} className="p-2.5 rounded-lg bg-secondary/50">
                              <p className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                              <p className="text-sm font-medium mt-0.5">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price & Sellers Summary */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div>
                        <span className="text-2xl font-bold text-primary">
                          Rs. {product.lowest_price.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          from {product.listings.length} seller{product.listings.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedProduct(isExpanded ? null : product.id);
                        }}
                      >
                        {isExpanded ? 'Collapse' : 'Details'}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 ml-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Seller Listings */}
                  {isExpanded && (
                    <div className="border-t border-border bg-secondary/20 p-4 animate-fade-in">
                      <h4 className="text-sm font-medium mb-3">All Sellers</h4>
                      <div className="space-y-3">
                        {product.listings
                          .sort((a, b) => a.price - b.price)
                          .map((listing) => (
                            <div
                              key={listing.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{listing.seller.name}</span>
                                    {listing.seller.verified && (
                                      <BadgeCheck className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Star className="h-3 w-3 fill-warning text-warning" />
                                    <span>{listing.seller.rating.toFixed(1)}</span>
                                    <span>•</span>
                                    <span className="capitalize">{listing.condition}</span>
                                    {listing.shipping_cost > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>+Rs. {listing.shipping_cost.toLocaleString()} shipping</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="font-semibold text-lg">Rs. {listing.price.toLocaleString()}</p>
                                  <p className={`text-xs ${listing.stock > 10 ? 'text-success' : listing.stock > 0 ? 'text-warning' : 'text-destructive'}`}>
                                    {listing.stock > 0 ? `${listing.stock} in stock` : 'Out of stock'}
                                  </p>
                                </div>
                                <AddToCartButton 
                                  listingId={listing.id} 
                                  stock={listing.stock}
                                  variant="icon"
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
