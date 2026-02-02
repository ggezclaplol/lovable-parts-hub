import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cpu, Info } from 'lucide-react';

export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors glow-effect">
              <Cpu className="h-8 w-8 text-primary" />
            </div>
          </Link>
          <h1 className="mt-6 text-3xl font-bold gradient-text">Demo Mode</h1>
          <p className="mt-2 text-muted-foreground">
            This is a demo application with pre-configured accounts
          </p>
        </div>

        {/* Info Card */}
        <div className="glass-effect rounded-2xl p-8 shadow-xl">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20 mb-6">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-primary mb-2">Demo Credentials</p>
              <p className="text-muted-foreground">Use these pre-configured accounts to explore the app:</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-1">Admin Account</p>
              <p className="font-mono text-sm">admin@demo.com / admin123</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-1">User Account</p>
              <p className="font-mono text-sm">user@demo.com / user123</p>
            </div>
          </div>

          <Link to="/login">
            <Button variant="glow" size="lg" className="w-full mt-6">
              Go to Login
            </Button>
          </Link>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already know the credentials?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in directly
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
