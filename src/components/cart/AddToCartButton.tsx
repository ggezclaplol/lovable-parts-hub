import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useAddToCart } from '@/hooks/useCart';

interface AddToCartButtonProps {
  listingId: string;
  stock: number;
  variant?: 'default' | 'icon' | 'full';
  className?: string;
}

export function AddToCartButton({ 
  listingId, 
  stock, 
  variant = 'default',
  className 
}: AddToCartButtonProps) {
  const addToCart = useAddToCart();

  const isOutOfStock = stock <= 0;
  const isLoading = addToCart.isPending;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart.mutate({ listingId });
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleClick}
        disabled={isOutOfStock || isLoading}
        className={className}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
      </Button>
    );
  }

  if (variant === 'full') {
    return (
      <Button
        onClick={handleClick}
        disabled={isOutOfStock || isLoading}
        className={className}
        size="lg"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <ShoppingCart className="h-4 w-4 mr-2" />
        )}
        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleClick}
      disabled={isOutOfStock || isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      <span className="ml-2">{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
    </Button>
  );
}
