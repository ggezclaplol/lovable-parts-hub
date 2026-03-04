import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCategories, useProducts } from '@/hooks/useProducts';
import { 
  Cpu, 
  Monitor, 
  HardDrive, 
  MemoryStick, 
  ArrowRight, 
  Zap,
  Shield,
  Truck,
  CircuitBoard,
  Box,
  Fan,
  Package,
  Sparkles
} from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  CPU: Cpu,
  GPU: Monitor,
  RAM: MemoryStick,
  Storage: HardDrive,
  Motherboard: CircuitBoard,
  PSU: Zap,
  Case: Box,
  Cooling: Fan,
};

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Compare specs and prices across thousands of components instantly',
  },
  {
    icon: Shield,
    title: 'Compatibility Check',
    description: 'Automatic compatibility verification for all your selected parts',
  },
  {
    icon: Truck,
    title: 'Best Prices',
    description: 'Find the best deals from trusted retailers worldwide',
  },
];

export default function Index() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: products } = useProducts();

  const categoryCounts = categories?.map((cat) => ({
    ...cat,
    count: products?.filter((p) => p.category?.id === cat.id).length || 0,
  }));

  return (
    <Layout>
      {/* Hero Section — Editorial Style */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                <Sparkles className="h-4 w-4" />
                Curated PC components
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-[1.1] text-foreground">
                Build Your
                <span className="block gradient-text italic">Perfect Rig</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
                A curated marketplace for PC enthusiasts. Compare prices, check compatibility, 
                and assemble your dream machine — all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="glow" size="xl" className="rounded-full" asChild>
                  <Link to="/products">
                    Browse Parts
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" className="rounded-full" asChild>
                  <Link to="/build">
                    PC Builder
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Editorial Card Stack */}
            <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="relative">
                {/* Main card */}
                <div className="editorial-card p-8 relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Monitor className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="font-serif font-semibold text-lg">Graphics Cards</p>
                      <p className="text-sm text-muted-foreground">From ₨45,000</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {['RTX 4090', 'RTX 4070 Ti', 'RX 7900 XTX'].map((gpu, i) => (
                      <div key={gpu} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-secondary/50">
                        <span className="text-sm font-medium">{gpu}</span>
                        <span className="text-xs text-muted-foreground">Compare →</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Stacked behind */}
                <div className="absolute top-4 -right-4 w-full h-full rounded-2xl bg-secondary/60 -z-10 rotate-2" />
                <div className="absolute top-8 -right-8 w-full h-full rounded-2xl bg-secondary/30 -z-20 rotate-[4deg]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories — Asymmetric Editorial Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-2">Categories</p>
            <h2 className="text-4xl font-serif font-bold">Browse Components</h2>
          </div>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline underline-offset-4 hidden sm:block">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
          {categoriesLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="editorial-card p-6 animate-pulse">
                <div className="w-12 h-12 mb-4 rounded-xl bg-secondary" />
                <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                <div className="h-3 bg-secondary rounded w-1/2" />
              </div>
            ))
          ) : (
            categoryCounts?.map((category, index) => {
              const IconComponent = categoryIcons[category.name] || Package;
              const isLarge = index === 0 || index === 3;
              return (
                <Link
                  key={category.id}
                  to="/products"
                  className={`editorial-card p-6 group animate-fade-in ${isLarge ? 'md:col-span-2 md:row-span-1' : ''}`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="w-12 h-12 mb-4 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-serif font-semibold text-lg mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} products</p>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* Features — Horizontal Editorial Strip */}
      <section className="container mx-auto px-4 py-16">
        <div className="editorial-card p-0 overflow-hidden">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {features.map((feature, index) => (
              <div 
                key={feature.title} 
                className="p-8 lg:p-10 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 mb-5 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section — Magazine Banner */}
      <section className="container mx-auto px-4 py-16">
        <div className="editorial-card overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-warning/5" />
          <div className="relative p-10 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-serif font-bold mb-3">Ready to Build?</h2>
              <p className="text-muted-foreground max-w-md leading-relaxed">
                Compare prices from multiple sellers and find the best deals on PC components.
              </p>
            </div>
            <Button variant="glow" size="xl" className="rounded-full shrink-0" asChild>
              <Link to="/products">
                Start Building
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-16">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <span className="font-serif font-bold text-lg">PCForge</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PCForge. Final Year Project.
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
