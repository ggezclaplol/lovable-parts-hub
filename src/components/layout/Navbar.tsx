import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Menu, X, Package, LogIn, LogOut, ShieldCheck, User, Wrench } from 'lucide-react';
import { useState } from 'react';
import { CartSheet } from '@/components/cart/CartSheet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Cpu className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold gradient-text">PCForge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/products" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            
            <Link 
              to="/build" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Wrench className="h-4 w-4" />
              PC Builder
            </Link>
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            )}

            <CartSheet />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="p-1.5 rounded-full bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden lg:inline">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-muted-foreground text-xs">{user?.email}</p>
                    <p className="text-xs text-primary capitalize mt-1">{user?.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile: Cart + Menu */}
          <div className="md:hidden flex items-center gap-2">
            <CartSheet />
            <button
              className="p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link
                to="/products"
                className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package className="h-5 w-5 text-primary" />
                Products
              </Link>
              
              <Link
                to="/build"
                className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Wrench className="h-5 w-5 text-primary" />
                PC Builder
              </Link>
              
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Admin Dashboard
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 border-t border-border mt-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <button
                    className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="h-5 w-5 text-primary" />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
