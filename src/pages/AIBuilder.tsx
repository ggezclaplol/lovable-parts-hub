import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Send, Bot, User, Sparkles, Cpu, Monitor, MemoryStick, HardDrive, Zap, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const quickPrompts = [
  { icon: Cpu, label: 'Gaming PC', prompt: 'I want to build a gaming PC for 1080p gaming. My budget is around ₨150,000. I prefer Intel and NVIDIA.' },
  { icon: Monitor, label: 'Streaming Setup', prompt: 'I need a PC for streaming and content creation. Budget is ₨200,000. No brand preference.' },
  { icon: MemoryStick, label: 'Budget Build', prompt: 'Build me a budget-friendly PC for general use and light gaming under ₨80,000.' },
  { icon: HardDrive, label: 'Workstation', prompt: 'I need a workstation for video editing and 3D rendering. Budget ₨300,000. Prefer AMD platform.' },
];

export default function AIBuilder() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: content.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-pc-builder', {
        body: { messages: updatedMessages },
      });

      if (error) {
        throw new Error(error.message || 'Failed to get response');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: data?.reply || 'Sorry, I could not generate a response.',
      };
      setMessages([...updatedMessages, assistantMsg]);
    } catch (e) {
      console.error('AI Builder error:', e);
      const errorMessage = e instanceof Error ? e.message : 'Something went wrong';
      toast.error(errorMessage);
      // Remove the user message on error
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl h-[calc(100vh-5rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <div className="p-3 rounded-2xl bg-primary/10 neon-border">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">AI PC Builder</h1>
            <p className="text-sm text-muted-foreground">Tell me what you need — I'll build the perfect PC for you</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in">
              <div className="p-5 rounded-3xl bg-primary/[0.08] neon-border mb-6">
                <Bot className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-display font-bold mb-2">What kind of PC do you need?</h2>
              <p className="text-muted-foreground text-sm text-center max-w-md mb-8">
                Tell me your use case, budget, preferred brands, and platform — I'll recommend the best build.
              </p>

              {/* Quick prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {quickPrompts.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => sendMessage(qp.prompt)}
                    className="bento-card p-4 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <qp.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-display font-semibold text-sm">{qp.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{qp.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="shrink-0 p-2 rounded-xl bg-primary/10 neon-border h-fit mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bento-card rounded-bl-md'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:text-foreground [&_li]:text-foreground [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_code]:text-primary [&_code]:bg-secondary/50 [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_pre]:bg-secondary/50 [&_pre]:rounded-xl">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="shrink-0 p-2 rounded-xl bg-secondary h-fit mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="shrink-0 p-2 rounded-xl bg-primary/10 neon-border h-fit mt-1">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bento-card rounded-2xl rounded-bl-md px-5 py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bento-card neon-border p-3 animate-fade-in">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your ideal PC build..."
              rows={1}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-sm py-2 px-2 max-h-32"
              style={{ minHeight: '40px' }}
            />
            <Button
              variant="glow"
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="shrink-0 rounded-xl h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
