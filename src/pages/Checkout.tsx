import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart, useCartTotal } from '@/hooks/useCart';
import { useCreateOrder, OrderFormData } from '@/hooks/useOrders';
import { 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  Banknote, 
  ArrowLeft,
  Package,
  Loader2,
  CheckCircle2,
  User,
  LogIn
} from 'lucide-react';

type CheckoutStep = 'auth' | 'details' | 'confirmation';

export default function Checkout() {
  const navigate = useNavigate();
  const { data: cart, isLoading: cartLoading } = useCart();
  const { subtotal, shipping, total } = useCartTotal();
  const createOrder = useCreateOrder();
  
  const [step, setStep] = useState<CheckoutStep>('auth');
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cod',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormData, string>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof OrderFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof OrderFormData, string>> = {};
    
    if (!formData.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Invalid email address';
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone is required';
    } else if (!/^[\d\s+-]{10,}$/.test(formData.customerPhone)) {
      newErrors.customerPhone = 'Invalid phone number';
    }
    if (!formData.shippingAddress.trim()) newErrors.shippingAddress = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !cart) return;
    
    try {
      await createOrder.mutateAsync({ formData, cartItems: cart });
      setStep('confirmation');
    } catch {
      // Error handled by mutation
    }
  };

  if (cartLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!cart || cart.length === 0) {
    if (step === 'confirmation') {
      return (
        <Layout>
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Order Placed!</h1>
              <p className="text-muted-foreground mb-8">
                Thank you for your order. You will receive a confirmation email shortly.
                {formData.paymentMethod === 'cod' && (
                  <span className="block mt-2">Please have cash ready for delivery.</span>
                )}
              </p>
              <Link to="/products">
                <Button size="lg">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some products to your cart before checking out.
            </p>
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (step === 'auth') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-center">Checkout</h1>
            <p className="text-muted-foreground text-center mb-8">
              How would you like to proceed?
            </p>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/login?redirect=/checkout')}
                className="w-full p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <LogIn className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Login to your account</h3>
                    <p className="text-sm text-muted-foreground">
                      Track orders and save your details
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep('details')}
                className="w-full p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Continue as guest</h3>
                    <p className="text-sm text-muted-foreground">
                      Checkout without creating an account
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => setStep('auth')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div className="glass-effect rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Contact Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                    />
                    {errors.customerName && (
                      <p className="text-xs text-destructive">{errors.customerName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email *</Label>
                    <Input
                      id="customerEmail"
                      name="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                    />
                    {errors.customerEmail && (
                      <p className="text-xs text-destructive">{errors.customerEmail}</p>
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      placeholder="+92 300 1234567"
                    />
                    {errors.customerPhone && (
                      <p className="text-xs text-destructive">{errors.customerPhone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="glass-effect rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress">Street Address *</Label>
                    <Input
                      id="shippingAddress"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      placeholder="123 Main Street, Apartment 4B"
                    />
                    {errors.shippingAddress && (
                      <p className="text-xs text-destructive">{errors.shippingAddress}</p>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Karachi"
                      />
                      {errors.city && (
                        <p className="text-xs text-destructive">{errors.city}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="75500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="glass-effect rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Method
                </h2>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => 
                    setFormData((prev) => ({ ...prev, paymentMethod: value as 'cod' | 'online' }))
                  }
                  className="space-y-3"
                >
                  <label
                    htmlFor="cod"
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      formData.paymentMethod === 'cod' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="cod" id="cod" />
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <Banknote className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                    </div>
                  </label>
                  
                  <label
                    htmlFor="online"
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      formData.paymentMethod === 'online' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="online" id="online" />
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Online Payment</p>
                      <p className="text-sm text-muted-foreground">Pay securely with card or bank transfer</p>
                    </div>
                  </label>
                </RadioGroup>

                {formData.paymentMethod === 'online' && (
                  <div className="mt-4 p-4 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      Online payment integration coming soon. 
                      Your order will be placed and you'll receive payment instructions via email.
                    </p>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Place Order - Rs. {total.toLocaleString()}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {item.listing.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} × Rs. {item.listing.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      Rs. {(item.listing.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Rs. {shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
