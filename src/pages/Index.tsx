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
  Sparkles,
  Wrench,
  TrendingUp,
  Users } from
'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  CPU: Cpu,
  GPU: Monitor,
  RAM: MemoryStick,
  Storage: HardDrive,
  Motherboard: CircuitBoard,
  PSU: Zap,
  Case: Box,
  Cooling: Fan
};

export default function Index() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: products } = useProducts();

  const categoryCounts = categories?.map((cat) => ({
    ...cat,
    count: products?.filter((p) => p.category?.id === cat.id).length || 0
  }));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 lg:gap-5 auto-rows-[minmax(140px,auto)]">

          {/* Hero — Spans wide */}
          <div className="md:col-span-6 lg:col-span-8 row-span-2 bento-card p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/[0.08] rounded-full blur-[80px]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 neon-border text-primary text-xs font-mono uppercase tracking-wider mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                PC Component Hub
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 leading-[1.1]">
                Build Your
                <span className="block gradient-text text-glow py-[10px]">Dream Rig</span>
              </h1>
              <p className="text-muted-foreground max-w-md text-base leading-relaxed mb-8">
                Compare prices, check compatibility, and assemble the ultimate gaming PC — all in one place.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 relative z-10">
              <Button variant="glow" size="lg" className="rounded-xl" asChild>
                <Link to="/products">
                  Browse Parts
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-xl" asChild>
                <Link to="/build">
                  <Wrench className="h-5 w-5" />
                  PC Builder
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats card */}
          <div className="md:col-span-3 lg:col-span-4 bento-card p-6 flex flex-col justify-between animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10 neon-border">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Catalog</span>
            </div>
            <div>
              <p className="text-4xl font-display font-bold gradient-text">{products?.length || 0}+</p>
              <p className="text-sm text-muted-foreground mt-1">Components available</p>
            </div>
          </div>

          {/* Quick feature cards */}
          <div className="md:col-span-3 lg:col-span-4 bento-card p-6 flex flex-col justify-between animate-fade-in" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-success/10 border border-success/20">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Compatibility</span>
            </div>
            <div>
              <p className="text-lg font-display font-semibold">Auto-Check</p>
              <p className="text-sm text-muted-foreground mt-1">Verify parts work together</p>
            </div>
          </div>

          {/* AI Builder CTA */}
          <Link
            to="/ai-builder"
            className="md:col-span-6 lg:col-span-12 bento-card neon-border p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-6 group animate-fade-in relative overflow-hidden"
            style={{ animationDelay: '180ms' }}>
            
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.06] via-transparent to-primary/[0.03]" />
            <div className="relative p-4 rounded-2xl bg-primary/10 neon-border group-hover:bg-primary/15 transition-all shrink-0">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="relative text-center sm:text-left flex-1">
              <h3 className="text-xl font-display font-bold mb-1">AI PC Builder</h3>
              <p className="text-sm text-muted-foreground">Tell our AI what you need and get a complete build recommendation tailored to your budget and use case.</p>
            </div>
            <div className="relative">
              <Button variant="glow" size="lg" className="rounded-xl gap-2">
                Try it now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Link>

          {/* Community Builds CTA */}
          <Link
            to="/community"
            className="md:col-span-6 lg:col-span-12 bento-card p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-6 group animate-fade-in relative overflow-hidden"
            style={{ animationDelay: '220ms' }}>
            
            <div className="absolute inset-0 bg-gradient-to-r from-accent/[0.04] via-transparent to-accent/[0.02]" />
            <div className="relative p-4 rounded-2xl bg-accent/10 border border-accent/20 group-hover:bg-accent/15 transition-all shrink-0">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <div className="relative text-center sm:text-left flex-1">
              <h3 className="text-xl font-display font-bold mb-1">Community Builds</h3>
              <p className="text-sm text-muted-foreground">Browse builds shared by the community, get inspired, and share your own setup.</p>
            </div>
            <div className="relative">
              <Button variant="outline" size="lg" className="rounded-xl gap-2">
                Explore Builds
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Link>

          {/* Categories heading */}
          <div className="md:col-span-6 lg:col-span-12 flex items-end justify-between pt-6">
            <div>
              <p className="text-xs font-mono text-primary uppercase tracking-[0.2em] mb-1">Categories</p>
              <h2 className="text-2xl font-display font-bold">Browse Components</h2>
            </div>
            <Link to="/products" className="text-sm text-primary hover:underline underline-offset-4 font-medium hidden sm:block">
              View all →
            </Link>
          </div>

          {/* Category bento cards */}
          {categoriesLoading ?
          Array.from({ length: 8 }).map((_, i) =>
          <div key={i} className="md:col-span-3 lg:col-span-3 bento-card p-5 animate-pulse">
                <div className="w-10 h-10 mb-3 rounded-xl bg-secondary" />
                <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                <div className="h-3 bg-secondary rounded w-1/2" />
              </div>
          ) :

          categoryCounts?.map((category, index) => {
            const IconComponent = categoryIcons[category.name] || Package;
            const isWide = index === 0 || index === 5;
            return (
              <Link
                key={category.id}
                to="/products"
                className={`bento-card p-5 group animate-fade-in ${isWide ? 'md:col-span-3 lg:col-span-4' : 'md:col-span-2 lg:col-span-2'}`}
                style={{ animationDelay: `${(index + 3) * 60}ms` }}>
                
                  <div className="w-10 h-10 mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-sm">{category.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{category.count} items</p>
                </Link>);

          })
          }

          {/* Features row */}
          {/* Features row - separated cards */}
          <div className="md:col-span-6 lg:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Compare specs & prices instantly' },
              { icon: Shield, title: 'Compatibility', desc: 'Auto-verify all selected parts' },
              { icon: Truck, title: 'Best Prices', desc: 'Deals from trusted retailers' },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="bento-card p-6 animate-fade-in"
                style={{ animationDelay: `${(i + 10) * 60}ms` }}
              >
                <div className="w-10 h-10 mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="md:col-span-6 lg:col-span-12 bento-card neon-border p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden animate-fade-in" style={{ animationDelay: '800ms' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.06] via-transparent to-primary/[0.04]" />
            <div className="relative text-center lg:text-left">
              <h2 className="text-3xl font-display font-bold mb-2">Ready to Build?</h2>
              <p className="text-muted-foreground">Compare prices from multiple sellers and find the best deals.</p>
            </div>
            <Button variant="glow" size="xl" className="rounded-xl relative shrink-0" asChild>
              <Link to="/products">
                Start Building
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/30 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 neon-border">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display font-bold text-lg gradient-text">PCForge</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About Us</Link>
              <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
              <Link to="/community" className="hover:text-foreground transition-colors">Community</Link>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              © 2024 PCForge — Final Year Project
            </p>
          </div>
        </div>
      </footer>
    </Layout>);

}