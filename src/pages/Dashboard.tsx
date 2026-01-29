import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { api, DashboardStats, Product } from '@/lib/api';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Loader2,
  Cpu,
  Monitor,
  HardDrive,
  MemoryStick
} from 'lucide-react';

// Mock data for demo when API is not available
const mockStats: DashboardStats = {
  totalProducts: 156,
  totalOrders: 1234,
  totalRevenue: 89750,
  recentOrders: 23,
};

const mockRecentProducts: Product[] = [
  {
    id: '1',
    name: 'RTX 4090 Graphics Card',
    category: 'GPU',
    price: 1599.99,
    brand: 'NVIDIA',
    description: 'High-end graphics card',
    specs: { memory: '24GB GDDR6X' },
    stock: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Core i9-14900K',
    category: 'CPU',
    price: 589.99,
    brand: 'Intel',
    description: 'Flagship processor',
    specs: { cores: '24 cores' },
    stock: 28,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: '32GB DDR5 RAM Kit',
    category: 'RAM',
    price: 189.99,
    brand: 'Corsair',
    description: 'High-speed memory',
    specs: { speed: '6000MHz' },
    stock: 45,
    createdAt: new Date().toISOString(),
  },
];

const categoryIcons: Record<string, React.ElementType> = {
  GPU: Monitor,
  CPU: Cpu,
  RAM: MemoryStick,
  Storage: HardDrive,
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      // Try to fetch from API, fallback to mock data
      const [statsRes, productsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getProducts(),
      ]);

      setStats(statsRes.data || mockStats);
      setRecentProducts((productsRes.data || mockRecentProducts).slice(0, 5));
      setIsLoading(false);
    }

    loadData();
  }, []);

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
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your overview.</p>
          </div>
          <Button variant="glow" asChild>
            <Link to="/products/new">
              <PlusCircle className="h-5 w-5" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            icon={Package}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={ShoppingCart}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Revenue"
            value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title="Recent Orders"
            value={stats?.recentOrders || 0}
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Recent Products */}
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Products</h2>
            <Button variant="ghost" asChild>
              <Link to="/products">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {recentProducts.map((product) => {
              const IconComponent = categoryIcons[product.category] || Package;
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.brand} • {product.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{product.stock} in stock</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
