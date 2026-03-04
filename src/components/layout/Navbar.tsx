import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Menu, X, Package, LogIn, LogOut, ShieldCheck, User, Wrench, Sun, Moon, Sparkles, Users, UserCog, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-primary/10 neon-border group-hover:bg-primary/20 transition-all">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-display font-bold gradient-text">PCForge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link 
              to="/products" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all text-sm font-medium"
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            
            <Link 
              to="/build" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all text-sm font-medium"
            >
              <Wrench className="h-4 w-4" />
              PC Builder
            </Link>

            <Link 
              to="/ai-builder" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all text-sm font-medium"
            >
              <Sparkles className="h-4 w-4" />
              AI Builder
            </Link>

            <Link 
              to="/community" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all text-sm font-medium"
            >
              <Users className="h-4 w-4" />
              Community
            </Link>
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all text-sm font-medium"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            )}

            <div className="w-px h-6 bg-border/50 mx-2" />

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <CartSheet />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="p-1.5 rounded-full bg-primary/15 neon-border">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden lg:inline text-sm">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-muted-foreground text-xs">{user?.email}</p>
                    <p className="text-xs text-primary capitalize mt-1">{user?.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/account')}>
                    <UserCog className="h-4 w-4 mr-2" />
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/account?tab=orders')}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="glow" size="sm" className="gap-2 rounded-full px-5">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <CartSheet />
            <button
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/60 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/30 animate-fade-in">
            <div className="flex flex-col gap-1">
              <Link to="/products" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/60 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <Package className="h-5 w-5 text-primary" />
                <span className="font-medium">Products</span>
              </Link>
              <Link to="/build" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/60 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <Wrench className="h-5 w-5 text-primary" />
                <span className="font-medium">PC Builder</span>
              </Link>
              <Link to="/ai-builder" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/60 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-medium">AI Builder</span>
              </Link>
              <Link to="/community" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/60 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">Community</span>
              </Link>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/60 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="font-medium">Admin Dashboard</span>
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 border-t border-border/30 mt-2">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <Link to="/account" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/60 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <UserCog className="h-5 w-5 text-primary" />
                    <span className="font-medium">My Account</span>
                  </Link>
                  <Link to="/account?tab=orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/60 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <span className="font-medium">My Orders</span>
                  </Link>
                  <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary/60 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="h-5 w-5 text-primary" />
                  <span className="font-medium">Login</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
