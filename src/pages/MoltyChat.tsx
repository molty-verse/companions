/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Bot, Settings, Share2, Heart, Loader2, Sparkles, Copy, Check, AlertCircle, Power } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface MoltyData {
  id: string;
  name: string;
  status: string;
  sandboxId: string;
  gatewayUrl: string;
  authToken: string;
}

import { CONVEX_URL } from "@/lib/convex";

// Provisioner relay endpoint (bypasses Daytona auth)
const PROVISIONER_URL = "https://moltyverse-provisioner-production.up.railway.app";

const MoltyChat = () => {
  const { moltyId } = useParams();
  const { user } = useAuth();
  const { isLoading: authLoading } = useRequireAuth();
  
  const [molty, setMolty] = useState<MoltyData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch molty data
  useEffect(() => {
    async function fetchMolty() {
      if (!moltyId) return;
      
      try {
        // Use direct API call to Convex
        const response = await fetch(`${CONVEX_URL}/api/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: "moltys:getById",
            args: { moltyId }
          }),
        });
        
        const data = await response.json();
        
        console.log("Convex response for moltyId", moltyId, ":", data);
        
        if (data.status === "success" && data.value) {
          setMolty(data.value);
          // Add welcome message
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: `Hey! I'm ${data.value.name}. How can I help you today? 💬`,
            timestamp: "Just now"
          }]);
        } else {
          console.error("Molty fetch failed:", data.errorMessage || "No value returned");
          setError(`Molty not found (ID: ${moltyId})`);
        }
      } catch (e) {
        console.error("Failed to fetch molty:", e);
        setError("Failed to load Molty");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMolty();
  }, [moltyId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !molty?.gatewayUrl || !molty?.authToken) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: "Just now"
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      // Use public chat endpoint (no service token required)
      // Validates molty token directly via X-Molty-Token header
      const response = await fetch(`${PROVISIONER_URL}/chat/${molty.sandboxId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Molty-Token": molty.authToken,
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gateway error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.message || data.content || "I received your message but couldn't generate a response.",
        timestamp: "Just now"
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      console.error("Failed to send message:", e);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't process that message. The gateway might be offline or there was a connection error.",
        timestamp: "Just now"
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Start Molty from chat page
  const handleStart = async () => {
    if (!molty?.id) return;
    
    setIsStarting(true);
    try {
      // Use Convex action for start
      const response = await fetch(`${CONVEX_URL}/api/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "moltys:startMolty",
          args: { userId: user?.userId, moltyId: molty.id }
        }),
      });

      const data = await response.json();
      
      if (data.status !== "success") {
        throw new Error(data.errorMessage || "Failed to start Molty");
      }

      // Update local state
      setMolty(prev => prev ? { ...prev, status: "running" } : null);
      
      toast({
        title: "Molty started",
        description: `${molty.name} is now online`,
      });
    } catch (e: any) {
      console.error("Failed to start molty:", e);
      toast({
        title: "Failed to start",
        description: e.message || "Could not start the Molty. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-coral" />
      </div>
    );
  }

  if (error || !molty) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="font-display text-2xl font-bold mb-2">Molty Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "This Molty doesn't exist or you don't have access."}</p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

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
                    🤖
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
                    molty.status === 'running' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display font-bold">{molty.name}</h1>
                    <Badge variant="secondary" className="bg-violet/10 text-violet text-xs">
                      <Bot className="w-3 h-3 mr-1" />
                      Agent
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {molty.status === "running" ? "Online" : "Offline"}
                  </p>
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
              <Link to={`/m/${moltyId}/settings`}>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
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
                transition={{ delay: idx * 0.05 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant' 
                    ? 'bg-gradient-to-br from-violet/20 to-coral/20' 
                    : 'bg-muted'
                }`}>
                  {message.role === 'assistant' ? '🤖' : '👤'}
                </div>
                <div className={`group flex flex-col max-w-[80%] ${message.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.role === 'assistant' 
                      ? 'bg-card shadow-soft' 
                      : 'bg-coral text-white'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
            {isSending && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet/20 to-coral/20 flex items-center justify-center">
                  🤖
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
          {molty.status !== "running" ? (
            <div className="text-center py-4">
              <div className="text-muted-foreground mb-3">
                <AlertCircle className="w-5 h-5 inline mr-2" />
                This Molty is currently offline
              </div>
              <Button 
                onClick={handleStart}
                disabled={isStarting}
                className="shadow-warm"
              >
                {isStarting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Power className="w-4 h-4 mr-2" />
                )}
                {isStarting ? "Starting..." : "Start Molty"}
              </Button>
            </div>
          ) : (
            <>
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-3"
              >
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message ${molty.name}...`}
                    disabled={isSending}
                    className="h-12 rounded-xl bg-card border-0 shadow-soft focus:ring-2 focus:ring-coral/20 pr-12"
                  />
                  <Button 
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isSending}
                    className="absolute right-1 top-1 h-10 w-10 rounded-xl shadow-warm"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
              <p className="text-xs text-center text-muted-foreground mt-3">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Powered by Claude • Your messages are private
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoltyChat;
