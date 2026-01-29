import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  Cpu, 
  Monitor, 
  HardDrive, 
  MemoryStick, 
  ArrowRight, 
  Zap,
  Shield,
  Truck
} from 'lucide-react';

const categories = [
  { name: 'CPUs', icon: Cpu, count: 156 },
  { name: 'Graphics Cards', icon: Monitor, count: 89 },
  { name: 'Memory', icon: MemoryStick, count: 234 },
  { name: 'Storage', icon: HardDrive, count: 178 },
];

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
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 glow-bg" />
        
        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
              <Zap className="h-4 w-4" />
              Build your dream PC today
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Build Your Perfect
              <span className="block gradient-text">Gaming Rig</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Pick the best PC components, compare prices, and create the ultimate build 
              with our comprehensive part picker tool.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="glow" size="xl" asChild>
                <Link to="/signup">
                  Start Building
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/products">Browse Parts</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Browse Components</h2>
          <p className="text-muted-foreground">
            Explore our extensive catalog of PC parts
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to="/products"
              className="glass-effect rounded-xl p-6 text-center hover:border-primary/30 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <category.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.count} products</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="glass-effect rounded-2xl p-8 lg:p-12">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20" />
          <div className="relative glass-effect rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join thousands of PC enthusiasts who trust PCBuilder for their builds.
              Create your account and start building today.
            </p>
            <Button variant="glow" size="lg" asChild>
              <Link to="/signup">
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-6 w-6 text-primary" />
              <span className="font-bold gradient-text">PCBuilder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PCBuilder. Final Year Project.
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
