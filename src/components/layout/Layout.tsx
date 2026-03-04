import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Ambient neon glow effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/[0.07] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] bg-primary/[0.05] rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[300px] bg-primary/[0.04] rounded-full blur-[120px]" />
      </div>
      
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
