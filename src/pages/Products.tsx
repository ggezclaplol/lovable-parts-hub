import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, Product } from '@/lib/api';
import { 
  PlusCircle, 
  Search, 
  Package, 
  Loader2,
  Cpu,
  Monitor,
  HardDrive,
  MemoryStick,
  Filter
} from 'lucide-react';

// Mock products for demo
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'RTX 4090 Graphics Card',
    category: 'GPU',
    price: 1599.99,
    brand: 'NVIDIA',
    description: 'The ultimate graphics card for gaming and content creation',
    specs: { memory: '24GB GDDR6X', boost: '2.52 GHz' },
    stock: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Core i9-14900K',
    category: 'CPU',
    price: 589.99,
    brand: 'Intel',
    description: 'Flagship desktop processor with 24 cores',
    specs: { cores: '24 (8P+16E)', threads: '32' },
    stock: 28,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: '32GB DDR5 RAM Kit',
    category: 'RAM',
    price: 189.99,
    brand: 'Corsair',
    description: 'High-speed DDR5 memory for enthusiast builds',
    specs: { speed: '6000MHz', latency: 'CL36' },
    stock: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: '2TB NVMe SSD',
    category: 'Storage',
    price: 179.99,
    brand: 'Samsung',
    description: 'Ultra-fast PCIe 4.0 solid state drive',
    specs: { read: '7000 MB/s', write: '5100 MB/s' },
    stock: 62,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Ryzen 9 7950X',
    category: 'CPU',
    price: 549.99,
    brand: 'AMD',
    description: '16-core processor for extreme performance',
    specs: { cores: '16', threads: '32' },
    stock: 20,
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'RTX 4080 Super',
    category: 'GPU',
    price: 999.99,
    brand: 'NVIDIA',
    description: 'High-performance graphics for 4K gaming',
    specs: { memory: '16GB GDDR6X', boost: '2.55 GHz' },
    stock: 8,
    createdAt: new Date().toISOString(),
  },
];

const categoryIcons: Record<string, React.ElementType> = {
  GPU: Monitor,
  CPU: Cpu,
  RAM: MemoryStick,
  Storage: HardDrive,
};

const categories = ['All', 'CPU', 'GPU', 'RAM', 'Storage'];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const response = await api.getProducts();
      setProducts(response.data || mockProducts);
      setFilteredProducts(response.data || mockProducts);
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  useEffect(() => {
    let result = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, products]);

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
              {filteredProducts.length} products available
            </p>
          </div>
          <Button variant="glow" asChild>
            <Link to="/products/new">
              <PlusCircle className="h-5 w-5" />
              Add Product
            </Link>
          </Button>
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
                {categories.map((category) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => {
              const IconComponent = categoryIcons[product.category] || Package;
              return (
                <div
                  key={product.id}
                  className="glass-effect rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Product Image Placeholder */}
                  <div className="aspect-square rounded-lg bg-secondary/50 flex items-center justify-center mb-4 group-hover:bg-secondary transition-colors">
                    <IconComponent className="h-16 w-16 text-primary/50 group-hover:text-primary transition-colors" />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>

                    {/* Specs */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {Object.entries(product.specs).slice(0, 2).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground"
                        >
                          {value}
                        </span>
                      ))}
                    </div>

                    {/* Price & Stock */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-2xl font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className={`text-sm ${product.stock > 10 ? 'text-success' : 'text-warning'}`}>
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
