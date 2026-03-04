import { Layout } from '@/components/layout/Layout';
import { Cpu, Users, Target, Zap, Shield, Heart } from 'lucide-react';

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 lg:py-16 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 neon-border text-primary text-xs font-mono uppercase tracking-wider mb-4">
            <Cpu className="h-3.5 w-3.5" />
            About Us
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Building the Future of <span className="gradient-text">PC Assembly</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            PCForge is a final year project designed to simplify the PC building experience — from comparing parts to checking compatibility and getting AI-powered recommendations.
          </p>
        </div>

        {/* Mission */}
        <div className="bento-card neon-border p-8 lg:p-10 mb-8 animate-fade-in relative overflow-hidden" style={{ animationDelay: '100ms' }}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.06] rounded-full blur-[60px]" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10 neon-border">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We believe building a PC should be accessible to everyone — not just experts. PCForge brings together price comparison across multiple sellers, automated compatibility checking, and AI-assisted build recommendations to make the process seamless and enjoyable.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Zap, title: 'Speed', desc: 'Instantly compare specs and prices across sellers without switching tabs.' },
            { icon: Shield, title: 'Reliability', desc: 'Auto-compatibility checks prevent costly mistakes before you buy.' },
            { icon: Heart, title: 'Community', desc: 'Share your builds, get inspired, and help fellow builders.' },
          ].map((item, i) => (
            <div
              key={item.title}
              className="bento-card p-6 animate-fade-in"
              style={{ animationDelay: `${(i + 2) * 80}ms` }}
            >
              <div className="w-10 h-10 mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Team */}
        <div className="bento-card p-8 lg:p-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-primary/10 neon-border">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold">The Team</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            PCForge was built as a Final Year Project, combining a passion for PC hardware with modern web technologies.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
              <p className="font-display font-semibold">React + TypeScript</p>
              <p className="text-sm text-muted-foreground">Modern, type-safe frontend</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
              <p className="font-display font-semibold">Lovable Cloud</p>
              <p className="text-sm text-muted-foreground">Database, auth & edge functions</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
