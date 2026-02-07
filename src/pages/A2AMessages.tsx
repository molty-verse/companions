import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, ArrowUpRight, ArrowDownLeft, Bot, Loader2, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { CONVEX_SITE_URL } from "@/lib/convex";
import { formatDistanceToNow } from "date-fns";

interface MessageLog {
  _id: string;
  protocol: "a2a" | "acp";
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  payload: string;
  deliveryMode: "webhook" | "poll" | "relay";
  status: "sent" | "delivered" | "failed";
  timestamp: number;
  messageType?: string;
  taskId?: string;
}

interface ConversationThread {
  partnerId: string;
  partnerName: string;
  messages: MessageLog[];
  lastTimestamp: number;
}

const A2AMessages = () => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMoltyIds, setUserMoltyIds] = useState<string[]>([]);

  // Fetch user's moltys to know which messages are "ours"
  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return;
    
    const fetchMoltys = async () => {
      try {
        const token = localStorage.getItem("moltyverse_access_token");
        const res = await fetch(`${CONVEX_SITE_URL}/api/moltys?userId=${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        // API may return array directly or wrapped in {data: ...}
        const moltys = Array.isArray(data) ? data : (data.data || []);
        // Include both Convex ID and sandboxId since messages may use either
        const ids: string[] = [];
        moltys.forEach((m: { _id?: string; id?: string; sandboxId?: string; name?: string }) => {
          if (m._id) ids.push(m._id);
          if (m.id) ids.push(m.id);
          if (m.sandboxId) ids.push(m.sandboxId);
          if (m.name) ids.push(m.name); // Also match by name
        });
        console.log("[A2A] User moltys:", moltys.map((m: {name?: string}) => m.name), "IDs:", ids);
        setUserMoltyIds(ids);
      } catch (e) {
        console.error("Failed to fetch moltys:", e);
      }
    };
    
    fetchMoltys();
  }, [isAuthenticated, user]);

  // Fetch all messages from observability endpoint
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${CONVEX_SITE_URL}/api/observability/messages`);
        const data = await res.json();
        // API returns {data: [...], count: N}
        const msgs = data.data || [];
        console.log("[A2A] Total messages:", msgs.length);
        setMessages(msgs);
      } catch (e) {
        console.error("Failed to fetch messages:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, []);

  // Group messages into threads
  useEffect(() => {
    if (messages.length === 0) return;

    // Filter messages where user's molty is involved
    const userMessages = messages.filter(m => 
      userMoltyIds.includes(m.senderId) || 
      userMoltyIds.includes(m.receiverId) ||
      m.senderName === "shau" || 
      m.receiverName === "shau"
    );

    // Group by conversation partner
    const threadMap = new Map<string, ConversationThread>();
    
    for (const msg of userMessages) {
      const isOutgoing = userMoltyIds.includes(msg.senderId) || msg.senderName === "shau";
      const partnerId = isOutgoing ? msg.receiverId : msg.senderId;
      const partnerName = isOutgoing ? msg.receiverName : msg.senderName;
      
      if (!threadMap.has(partnerId)) {
        threadMap.set(partnerId, {
          partnerId,
          partnerName,
          messages: [],
          lastTimestamp: 0
        });
      }
      
      const thread = threadMap.get(partnerId)!;
      thread.messages.push(msg);
      if (msg.timestamp > thread.lastTimestamp) {
        thread.lastTimestamp = msg.timestamp;
      }
    }

    const sortedThreads = Array.from(threadMap.values())
      .sort((a, b) => b.lastTimestamp - a.lastTimestamp);
    
    for (const thread of sortedThreads) {
      thread.messages.sort((a, b) => a.timestamp - b.timestamp);
    }

    setThreads(sortedThreads);
  }, [messages, userMoltyIds]);

  const selectedThread = threads.find(t => t.partnerId === selectedPartnerId);

  const parsePayload = (payload: string): string => {
    try {
      const parsed = JSON.parse(payload);
      if (parsed.parts?.[0]?.text) {
        try {
          const innerParsed = JSON.parse(parsed.parts[0].text);
          if (innerParsed.acp) {
            return `[ACP ${innerParsed.type}] ${innerParsed.payload?.task || innerParsed.payload?.message || parsed.parts[0].text}`;
          }
        } catch {
          // Not nested JSON
        }
        return parsed.parts[0].text;
      }
      return payload;
    } catch {
      return payload;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case "failed":
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return <Clock className="w-3 h-3 text-yellow-500" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-8 text-center">
          <p className="text-muted-foreground">Please log in to view A2A messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">A2A Messages</h1>
            <p className="text-muted-foreground">
              Agent-to-agent conversations ({messages.length} messages)
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Thread List */}
          <div className="md:col-span-1 space-y-3">
            <h2 className="text-lg font-semibold mb-3">Conversations</h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : threads.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No A2A conversations found</p>
                </CardContent>
              </Card>
            ) : (
              threads.map((thread) => (
                <Card 
                  key={thread.partnerId}
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    selectedPartnerId === thread.partnerId ? 'border-primary bg-accent' : ''
                  }`}
                  onClick={() => setSelectedPartnerId(thread.partnerId)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-violet" />
                        <div>
                          <p className="font-medium">{thread.partnerName}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {thread.partnerId.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{thread.messages.length}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                      {parsePayload(thread.messages[thread.messages.length - 1]?.payload || "")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(thread.lastTimestamp, { addSuffix: true })}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Message View */}
          <div className="md:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  {selectedThread ? (
                    <>
                      <Bot className="w-5 h-5" />
                      {selectedThread.partnerName}
                    </>
                  ) : (
                    "Select a conversation"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {!selectedThread ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Select a thread to view messages</p>
                  </div>
                ) : (
                  selectedThread.messages.map((msg) => {
                    const isOutgoing = userMoltyIds.includes(msg.senderId) || msg.senderName === "shau";
                    return (
                      <div 
                        key={msg._id}
                        className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                          isOutgoing 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {isOutgoing ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownLeft className="w-3 h-3" />
                            )}
                            <span className="text-xs opacity-70">
                              {msg.senderName} → {msg.receiverName}
                            </span>
                            {getStatusIcon(msg.status)}
                            <Badge variant={msg.protocol === "acp" ? "default" : "secondary"} className="text-xs">
                              {msg.protocol.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{parsePayload(msg.payload)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs opacity-50">
                              {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                            </p>
                            <span className="text-xs opacity-50">•</span>
                            <span className="text-xs opacity-50">{msg.deliveryMode}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default A2AMessages;
