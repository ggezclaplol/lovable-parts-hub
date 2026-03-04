import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LifeBuoy, Mail, Send, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FAQ_ITEMS = [
  {
    q: 'How does the compatibility checker work?',
    a: 'Our system analyzes component specifications like CPU socket, RAM type, motherboard chipset, and power requirements to ensure all parts work together before you buy.',
  },
  {
    q: 'Are the prices updated in real-time?',
    a: 'Prices are fetched from our listed sellers and updated regularly. However, prices may vary — always confirm on the seller\'s page before purchasing.',
  },
  {
    q: 'How does the AI PC Builder work?',
    a: 'Tell the AI your budget, use case (gaming, editing, etc.), and preferences. It generates a full build recommendation with compatible parts tailored to your needs.',
  },
  {
    q: 'Can I share my PC build with others?',
    a: 'Yes! Head to the Community Builds page to share your build, including parts list, use case, and description. Other users can like and comment on your build.',
  },
  {
    q: 'Do I need an account to browse products?',
    a: 'No, you can browse products, compare prices, and use the PC Builder without an account. An account is only needed to share community builds, like, and comment.',
  },
  {
    q: 'Is this a real store? Can I buy parts here?',
    a: 'PCForge is a comparison and build planning platform — not a store. We help you find the best deals, but purchases are made through the individual sellers listed.',
  },
];

export default function Support() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setIsLoading(false);
    toast.success('Message sent! We\'ll get back to you soon.');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 lg:py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 neon-border text-primary text-xs font-mono uppercase tracking-wider mb-4">
            <LifeBuoy className="h-3.5 w-3.5" />
            Support
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            How Can We <span className="gradient-text">Help?</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Check the FAQ below or send us a message — we're here to help.
          </p>
        </div>

        {/* FAQ */}
        <div className="bento-card p-6 lg:p-8 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-primary/10 neon-border">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold">FAQ</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border/50 rounded-xl px-4 data-[state=open]:bg-secondary/30">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact Form */}
        <div className="bento-card neon-border p-6 lg:p-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-primary/10 neon-border">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold">Contact Us</h2>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="p-4 rounded-full bg-success/10">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <div className="text-center">
                <h3 className="font-display font-semibold text-lg mb-1">Message Sent!</h3>
                <p className="text-sm text-muted-foreground">We'll get back to you as soon as possible.</p>
              </div>
              <Button variant="outline" onClick={() => { setSubmitted(false); setName(''); setEmail(''); setMessage(''); }}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    maxLength={255}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or question..."
                  required
                  maxLength={2000}
                  rows={5}
                />
              </div>
              <Button type="submit" variant="glow" className="gap-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send Message
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
