import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Plus, Settings, MessageCircle, Bot, Zap, Clock, TrendingUp, MoreVertical, Power, Loader2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { useAuth, useRequireAuth } from "@/lib/auth";

// Molty type from Convex
interface MoltyData {
  _id: string;
  name: string;
  status: "provisioning" | "online" | "offline" | "error";
  gatewayUrl?: string;
  createdAt: number;
}

const MoltyCard = ({ molty }: { molty: MoltyData }) => {
  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    provisioning: "bg-yellow-500 animate-pulse",
    error: "bg-red-500",
  };

  const statusLabels = {
    online: "Online",
    offline: "Offline", 
    provisioning: "Starting...",
    error: "Error",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card-living group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral/20 to-violet/20 flex items-center justify-center text-2xl">
              🤖
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${statusColors[molty.status]}`} />
          </div>
          <div>
            <h3 className="font-display font-bold">{molty.name}</h3>
            <p className="text-sm text-muted-foreground">{statusLabels[molty.status]}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Gateway URL */}
      {molty.gatewayUrl && (
        <div className="mb-4 p-3 rounded-lg bg-muted/50 text-xs font-mono text-muted-foreground truncate">
          {molty.gatewayUrl}
        </div>
      )}

      {/* Created date */}
      <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Created {new Date(molty.createdAt).toLocaleDateString()}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <Button asChild variant="default" className="flex-1 shadow-warm" disabled={molty.status !== "online"}>
          <Link to={`/m/${molty._id}`}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Link>
        </Button>
        <Button variant="outline" size="icon" className="rounded-xl">
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" className="rounded-xl">
          <Power className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { isLoading: authLoading } = useRequireAuth();
  const [moltys, setMoltys] = useState<MoltyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMoltys = async () => {
    if (!user?.userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use direct API call to Convex
      const response = await fetch("https://colorless-gull-839.convex.cloud/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "moltys:getByOwner",
          args: { ownerId: user.userId }
        }),
      });
      
      const data = await response.json();
      
      console.log("Dashboard moltys response:", data);
      
      if (data.status === "success") {
        console.log("Loaded moltys:", data.value);
        setMoltys(data.value || []);
      } else {
        console.error("Convex error:", data.errorMessage);
        setError("Failed to load your Moltys");
        setMoltys([]);
      }
    } catch (e) {
      console.error("Failed to fetch moltys:", e);
      setError("Failed to load your Moltys");
      setMoltys([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchMoltys();
    }
  }, [user?.userId]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-coral" />
      </div>
    );
  }

  const activeCount = moltys.filter(m => m.status === "online").length;

  return (
    <div className="min-h-screen bg-background font-body grain">
      <Navigation />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.username || "friend"}!
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchMoltys} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button asChild className="shadow-warm">
                <Link to="/create-molty">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Molty
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Moltys", value: moltys.length, icon: Bot, color: "coral" },
              { label: "Active Now", value: activeCount, icon: Zap, color: "violet" },
              { label: "This Week", value: moltys.filter(m => m.createdAt > Date.now() - 7*24*60*60*1000).length, icon: TrendingUp, color: "coral" },
              { label: "Messages", value: "—", icon: MessageCircle, color: "violet" }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card-living"
              >
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                </div>
                <p className="text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Error state */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600">
              {error}
              <Button variant="link" onClick={fetchMoltys} className="ml-2 text-red-600">
                Try again
              </Button>
            </div>
          )}

          {/* Moltys grid */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Your Moltys</h2>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-coral" />
              </div>
            ) : moltys.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-display text-xl font-bold mb-2">No Moltys yet</h3>
                <p className="text-muted-foreground mb-6">Create your first AI companion to get started</p>
                <Button asChild className="shadow-warm">
                  <Link to="/create-molty">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Molty
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {moltys.map((molty, idx) => (
                  <motion.div
                    key={molty._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <MoltyCard molty={molty} />
                  </motion.div>
                ))}
                
                {/* Create new card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: moltys.length * 0.1 }}
                >
                  <Link 
                    to="/create-molty"
                    className="card-living flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed border-muted hover:border-coral transition-colors group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 group-hover:bg-coral/10 flex items-center justify-center mb-4 transition-colors">
                      <Plus className="w-8 h-8 text-muted-foreground group-hover:text-coral transition-colors" />
                    </div>
                    <p className="font-display font-bold text-lg mb-1">Create New Molty</p>
                    <p className="text-sm text-muted-foreground">Deploy a new AI agent</p>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="card-bento">
            <h3 className="font-display font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "API Keys", icon: Zap, href: "/settings#api" },
                { label: "Billing", icon: TrendingUp, href: "/settings#billing" },
                { label: "Explore", icon: Bot, href: "/explore" },
                { label: "Settings", icon: Settings, href: "/settings" }
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-coral/10 flex items-center justify-center transition-colors">
                    <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-coral transition-colors" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
