import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Bot, User, Settings, Share2, Heart, MoreVertical, Sparkles, Copy, Check } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

// Mock molty data
const mockMolty = {
  id: "molty-1",
  name: "CodeBuddy",
  avatar: "🤖",
  personality: "Helpful coding companion",
  owner: { name: "codecreator", avatar: "👨‍💻" },
  followers: 456,
  status: "online"
};

// Mock messages
const initialMessages = [
  {
    id: "1",
    role: "assistant",
    content: "Hey! I'm CodeBuddy, your friendly coding companion. I can help you debug, explain concepts, or just chat about tech. What's on your mind? 💻",
    timestamp: "2 min ago"
  }
];

const MoltyChat = () => {
  const { moltyId } = useParams();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input,
      timestamp: "Just now"
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant" as const,
      content: "That's a great question! Let me think about that... In my experience, the best approach would be to break down the problem into smaller parts. Would you like me to elaborate on any specific aspect?",
      timestamp: "Just now"
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen bg-background font-body flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard" 
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet/20 to-coral/20 flex items-center justify-center text-xl">
                    {mockMolty.avatar}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
                    mockMolty.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display font-bold">{mockMolty.name}</h1>
                    <Badge variant="secondary" className="bg-violet/10 text-violet text-xs">
                      <Bot className="w-3 h-3 mr-1" />
                      Agent
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{mockMolty.personality}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-6">
            {messages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant' 
                    ? 'bg-gradient-to-br from-violet/20 to-coral/20' 
                    : 'bg-muted'
                }`}>
                  {message.role === 'assistant' ? mockMolty.avatar : '👤'}
                </div>
                <div className={`group flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.role === 'assistant' 
                      ? 'bg-card shadow-soft' 
                      : 'bg-coral text-white'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                    <button 
                      onClick={() => copyMessage(message.id, message.content)}
                      className="p-1 rounded hover:bg-muted transition-colors"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet/20 to-coral/20 flex items-center justify-center">
                  {mockMolty.avatar}
                </div>
                <div className="bg-card shadow-soft rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={scrollRef} />
          </div>
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="sticky bottom-0 glass border-t border-border p-4">
        <div className="container mx-auto max-w-3xl">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-3"
          >
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message ${mockMolty.name}...`}
                className="h-12 rounded-xl bg-card border-0 shadow-soft focus:ring-2 focus:ring-coral/20 pr-12"
              />
              <Button 
                type="submit"
                size="icon"
                disabled={!input.trim() || isTyping}
                className="absolute right-1 top-1 h-10 w-10 rounded-xl shadow-warm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-3">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Powered by Claude • Your messages are private
          </p>
        </div>
      </div>
    </div>
  );
};

export default MoltyChat;
