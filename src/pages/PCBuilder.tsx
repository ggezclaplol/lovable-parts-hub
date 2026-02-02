import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { 
  BUILD_STEPS, 
  BuildState, 
  BuildStepId,
  checkCompatibility,
  sortByCompatibility,
  calculateBuildTotal,
  BuildSelection
} from '@/lib/compatibility';
import { toast } from 'sonner';
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  Monitor,
  HardDrive,
  Zap,
  Box,
  Fan,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  Loader2,
  Star,
  BadgeCheck,
  Package,
  RotateCcw,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Cpu,
  CircuitBoard,
  MemoryStick,
  Monitor,
  HardDrive,
  Zap,
  Box,
  Fan,
};

export default function PCBuilder() {
  const { data: products, isLoading } = useProducts();
  const addToCartMutation = useAddToCart();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [build, setBuild] = useState<BuildState>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const currentStep = BUILD_STEPS[currentStepIndex];

  // Filter products for current step's category
  const categoryProducts = useMemo(() => {
    if (!products) return [];
    const filtered = products.filter(p => p.category?.name === currentStep.category);
    return sortByCompatibility(filtered, currentStep.id, build);
  }, [products, currentStep, build]);

  // Count completed steps
  const completedSteps = Object.keys(build).length;
  const buildTotal = calculateBuildTotal(build);

  const handleSelectProduct = (product: typeof categoryProducts[0], listingId: string, price: number) => {
    const compatibility = checkCompatibility(product, currentStep.id, build);
    
    if (!compatibility.compatible) {
      toast.error(compatibility.reason || 'This component is not compatible');
      return;
    }

    setBuild(prev => ({
      ...prev,
      [currentStep.id]: { product, listingId, price }
    }));

    // Auto-advance to next step
    if (currentStepIndex < BUILD_STEPS.length - 1) {
      setTimeout(() => setCurrentStepIndex(prev => prev + 1), 300);
    }

    toast.success(`${product.name} added to build`);
  };

  const handleRemoveFromBuild = (stepId: BuildStepId) => {
    setBuild(prev => {
      const newBuild = { ...prev };
      delete newBuild[stepId];
      return newBuild;
    });
  };

  const handleAddBuildToCart = async () => {
    const selections = Object.values(build) as BuildSelection[];
    if (selections.length === 0) {
      toast.error('Your build is empty');
      return;
    }

    setIsAddingToCart(true);
    try {
      for (const selection of selections) {
        await addToCartMutation.mutateAsync({ listingId: selection.listingId });
      }
      toast.success(`Added ${selections.length} items to cart!`);
    } catch (error) {
      toast.error('Failed to add build to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleResetBuild = () => {
    setBuild({});
    setCurrentStepIndex(0);
    toast.info('Build reset');
  };

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
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">PC Builder</h1>
            <p className="text-muted-foreground mt-1">
              Build your dream PC step by step with compatibility checks
            </p>
          </div>

          {/* Build Summary Card */}
          <div className="glass-effect rounded-xl p-4 lg:w-80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Your Build</h3>
              <Button variant="ghost" size="sm" onClick={handleResetBuild}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
            <div className="space-y-2 mb-4">
              {BUILD_STEPS.map((step) => {
                const selection = build[step.id];
                const Icon = iconMap[step.icon];
                return (
                  <div key={step.id} className="flex items-center gap-2 text-sm">
                    <Icon className={`h-4 w-4 ${selection ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={selection ? 'text-foreground' : 'text-muted-foreground'}>
                      {selection ? selection.product.name.slice(0, 25) + (selection.product.name.length > 25 ? '...' : '') : step.name}
                    </span>
                    {selection && (
                      <span className="ml-auto text-primary font-medium">
                        Rs. {selection.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border pt-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-primary">
                  Rs. {buildTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedSteps} of {BUILD_STEPS.length} components selected
              </p>
            </div>
            <Button 
              className="w-full" 
              variant="glow"
              onClick={handleAddBuildToCart}
              disabled={completedSteps === 0 || isAddingToCart}
            >
              {isAddingToCart ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              Add Build to Cart
            </Button>
          </div>
        </div>

        {/* Step Progress */}
        <div className="glass-effect rounded-xl p-4 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {BUILD_STEPS.map((step, index) => {
              const Icon = iconMap[step.icon];
              const isCompleted = !!build[step.id];
              const isCurrent = index === currentStepIndex;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStepIndex(index)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isCurrent 
                      ? 'bg-primary text-primary-foreground' 
                      : isCompleted 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium hidden sm:inline">{step.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold">{currentStep.name}</h2>
            <p className="text-sm text-muted-foreground">{currentStep.description}</p>
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentStepIndex(prev => Math.min(BUILD_STEPS.length - 1, prev + 1))}
            disabled={currentStepIndex === BUILD_STEPS.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Selected Component for this Step */}
        {build[currentStep.id] && (
          <div className="glass-effect rounded-xl p-4 mb-6 border-2 border-primary/50 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Selected {currentStep.name}</p>
                  <p className="font-semibold">{build[currentStep.id]!.product.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-primary">
                  Rs. {build[currentStep.id]!.price.toLocaleString()}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleRemoveFromBuild(currentStep.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {categoryProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No {currentStep.name} products available</h3>
            <p className="text-muted-foreground">
              Check back later or skip this step
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryProducts.map((product) => {
              const compatibility = checkCompatibility(product, currentStep.id, build);
              const bestListing = product.listings.reduce(
                (best, current) => (!best || current.price < best.price ? current : best),
                product.listings[0]
              );
              const isSelected = build[currentStep.id]?.product.id === product.id;

              if (!bestListing) return null;

              return (
                <div
                  key={product.id}
                  className={`glass-effect rounded-xl p-4 transition-all ${
                    isSelected 
                      ? 'ring-2 ring-primary' 
                      : !compatibility.compatible 
                        ? 'opacity-60' 
                        : 'hover:border-primary/30'
                  }`}
                >
                  {/* Compatibility Badge */}
                  {!compatibility.compatible && (
                    <div className="flex items-center gap-2 text-destructive text-sm mb-3 p-2 rounded-lg bg-destructive/10">
                      <XCircle className="h-4 w-4 shrink-0" />
                      <span>{compatibility.reason}</span>
                    </div>
                  )}
                  {compatibility.warning && (
                    <div className="flex items-center gap-2 text-warning text-sm mb-3 p-2 rounded-lg bg-warning/10">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{compatibility.warning}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <div className="w-16 h-16 shrink-0 rounded-lg bg-secondary/50 flex items-center justify-center">
                      {React.createElement(iconMap[currentStep.icon], { className: "h-8 w-8 text-primary/50" })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.brand}</p>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground"
                      >
                        {String(value)}
                      </span>
                    ))}
                  </div>

                  {/* Price & Seller */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <div>
                      <p className="text-lg font-bold text-primary">
                        Rs. {bestListing.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{bestListing.seller.name}</span>
                        {bestListing.seller.verified && (
                          <BadgeCheck className="h-3 w-3 text-primary" />
                        )}
                        <Star className="h-3 w-3 fill-warning text-warning ml-1" />
                        <span>{bestListing.seller.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isSelected ? 'outline' : 'default'}
                      disabled={!compatibility.compatible}
                      onClick={() => handleSelectProduct(product, bestListing.id, bestListing.price)}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Selected
                        </>
                      ) : (
                        'Select'
                      )}
                    </Button>
                  </div>

                  {/* Other sellers */}
                  {product.listings.length > 1 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Also available from {product.listings.length - 1} other seller{product.listings.length > 2 ? 's' : ''}
                    </p>
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
