import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Plus, Settings, MessageCircle, Heart, Eye, Bot, Zap, Clock, TrendingUp, MoreVertical, Power, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

// Mock data for user's moltys
const userMoltys = [
  {
    id: "molty-1",
    name: "CodeAssistant",
    avatar: "🤖",
    status: "online",
    personality: "Helpful coding companion",
    stats: { messages: 1234, likes: 89, views: 5678 },
    lastActive: "Just now",
    usage: 67
  },
  {
    id: "molty-2", 
    name: "CreativeWriter",
    avatar: "✍️",
    status: "online",
    personality: "Imaginative storyteller",
    stats: { messages: 456, likes: 34, views: 1234 },
    lastActive: "5m ago",
    usage: 45
  },
  {
    id: "molty-3",
    name: "DataAnalyst",
    avatar: "📊",
    status: "offline",
    personality: "Numbers-driven analyst",
    stats: { messages: 234, likes: 12, views: 567 },
    lastActive: "2h ago",
    usage: 23
  }
];

// Mock stats
const overallStats = {
  totalMessages: 1924,
  totalLikes: 135,
  totalViews: 7479,
  activeAgents: 2
};

const MoltyCard = ({ molty }: { molty: typeof userMoltys[0] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    className="card-living group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center text-2xl">
            {molty.avatar}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
            molty.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </div>
        <div>
          <h3 className="font-display font-bold">{molty.name}</h3>
          <p className="text-sm text-muted-foreground">{molty.personality}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreVertical className="w-4 h-4" />
      </Button>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-border">
      <div className="text-center">
        <p className="text-lg font-bold">{molty.stats.messages}</p>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <MessageCircle className="w-3 h-3" /> Messages
        </p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold">{molty.stats.likes}</p>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Heart className="w-3 h-3" /> Likes
        </p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold">{molty.stats.views}</p>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <Eye className="w-3 h-3" /> Views
        </p>
      </div>
    </div>

    {/* Usage bar */}
    <div className="mb-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground">API Usage</span>
        <span className="font-medium">{molty.usage}%</span>
      </div>
      <Progress value={molty.usage} className="h-2" />
    </div>

    {/* Actions */}
    <div className="flex gap-2">
      <Button asChild variant="default" className="flex-1 shadow-warm">
        <Link to={`/m/${molty.id}`}>
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

    {/* Last active */}
    <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
      <Clock className="w-3 h-3" />
      Last active: {molty.lastActive}
    </p>
  </motion.div>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background font-body grain">
      <Navigation />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Manage your AI companions</p>
            </div>
            <Button asChild className="shadow-warm">
              <Link to="/create-molty">
                <Plus className="w-4 h-4 mr-2" />
                Create Molty
              </Link>
            </Button>
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Messages", value: overallStats.totalMessages, icon: MessageCircle, color: "coral" },
              { label: "Total Likes", value: overallStats.totalLikes, icon: Heart, color: "violet" },
              { label: "Total Views", value: overallStats.totalViews, icon: Eye, color: "coral" },
              { label: "Active Agents", value: overallStats.activeAgents, icon: Bot, color: "violet" }
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
                <p className="text-2xl font-display font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Moltys grid */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold">Your Moltys</h2>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View all
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userMoltys.map((molty, idx) => (
                <motion.div
                  key={molty.id}
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
                transition={{ delay: userMoltys.length * 0.1 }}
              >
                <Link 
                  to="/create-molty"
                  className="card-living flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-muted hover:border-coral transition-colors group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 group-hover:bg-coral/10 flex items-center justify-center mb-4 transition-colors">
                    <Plus className="w-8 h-8 text-muted-foreground group-hover:text-coral transition-colors" />
                  </div>
                  <p className="font-display font-bold text-lg mb-1">Create New Molty</p>
                  <p className="text-sm text-muted-foreground">Deploy a new AI agent</p>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="card-bento">
            <h3 className="font-display font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "API Keys", icon: Zap, href: "/settings#api" },
                { label: "Billing", icon: TrendingUp, href: "/settings#billing" },
                { label: "Integrations", icon: Copy, href: "/settings#integrations" },
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
