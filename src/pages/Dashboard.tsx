import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { Plus, Settings, MessageCircle, Bot, Zap, Clock, TrendingUp, MoreVertical, Power, Loader2, RefreshCw, CreditCard, Trash2 } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { verifyOneTimeToken } from "@/lib/better-auth";
import { toast } from "@/hooks/use-toast";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL || `${CONVEX_URL}");

// Molty type from Convex (backend returns 'id' not '_id')
interface MoltyData {
  id: string;
  name: string;
  status: "provisioning" | "running" | "stopped" | "error";
  gatewayUrl?: string;
  sandboxId?: string;
  createdAt: number;
  discordConnected?: boolean;
}

// Discord Bot OAuth URL (replace with actual bot client ID)
const DISCORD_BOT_CLIENT_ID = "1468567298213150949"; // Moltyverse-000-dev for now
const getDiscordInviteUrl = (moltyId: string) => 
  `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_BOT_CLIENT_ID}&permissions=274877991936&scope=bot&state=${moltyId}`;

// Convex API for mutations/actions
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || `${CONVEX_URL}";

interface MoltyCardProps {
  molty: MoltyData;
  onDelete: (molty: MoltyData) => void;
  onPowerToggle: (molty: MoltyData) => Promise<void>;
  isPowerLoading?: boolean;
}

const MoltyCard = ({ molty, onDelete, onPowerToggle, isPowerLoading }: MoltyCardProps) => {
  const statusColors = {
    running: "bg-green-500",
    stopped: "bg-gray-400",
    provisioning: "bg-yellow-500 animate-pulse",
    error: "bg-red-500",
  };

  const statusLabels = {
    running: "Online",
    stopped: "Offline", 
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/m/${molty.id}/settings`}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600"
              onClick={() => onDelete(molty)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Molty
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

      {/* Discord Connection */}
      <div className="mb-4 flex items-center gap-2">
        {molty.discordConnected ? (
          <Badge variant="secondary" className="bg-[#5865F2]/10 text-[#5865F2]">
            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Connected
          </Badge>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => window.open(getDiscordInviteUrl(molty.id), '_blank')}
            disabled={molty.status !== "running"}
          >
            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Connect Discord
          </Button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button asChild variant="default" className="flex-1 shadow-warm" disabled={molty.status !== "running"}>
          <Link to={`/m/${molty.id}`}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Link>
        </Button>
        <Button variant="outline" size="icon" className="rounded-xl" asChild>
          <Link to={`/m/${molty.id}/settings`}>
            <Settings className="w-4 h-4" />
          </Link>
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className={`rounded-xl ${molty.status === "running" ? "text-green-600 hover:text-red-600" : "text-gray-400 hover:text-green-600"}`}
          onClick={() => onPowerToggle(molty)}
          disabled={isPowerLoading || molty.status === "provisioning"}
          title={molty.status === "running" ? "Stop Molty" : "Start Molty"}
        >
          {isPowerLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Power className="w-4 h-4" />
          )}
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [moltyToDelete, setMoltyToDelete] = useState<MoltyData | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Power toggle state
  const [powerLoadingId, setPowerLoadingId] = useState<string | null>(null);

  // Handle OAuth one-time token verification (cross-domain auth)
  useEffect(() => {
    // Debug: Log all URL params
    console.log("[Dashboard] URL search params:", Object.fromEntries(searchParams.entries()));
    console.log("[Dashboard] Current URL:", window.location.href);
    
    const ott = searchParams.get("ott");
    if (ott) {
      console.log("[Dashboard] Found OTT token, verifying...");
      // Remove ott from URL immediately
      searchParams.delete("ott");
      setSearchParams(searchParams, { replace: true });
      
      // Verify the one-time token
      verifyOneTimeToken(ott)
        .then(() => {
          toast({
            title: "Welcome!",
            description: "You've been signed in successfully",
          });
          // Reload the page to pick up the new session
          window.location.reload();
        })
        .catch((err) => {
          console.error("OTT verification failed:", err);
          toast({
            title: "Sign in failed",
            description: "Could not complete sign in. Please try again.",
            variant: "destructive",
          });
          navigate("/login");
        });
    }
  }, [searchParams, setSearchParams, navigate]);

  const fetchMoltys = async () => {
    if (!user?.userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use direct API call to Convex
      const response = await fetch(`${CONVEX_URL}/api/query", {
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

  // Delete handlers
  const handleDeleteClick = (molty: MoltyData) => {
    setMoltyToDelete(molty);
    setDeleteConfirmText("");
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!moltyToDelete || deleteConfirmText !== moltyToDelete.name || !user) return;
    
    setIsDeleting(true);
    try {
      // Call Convex action to delete the Molty
      await convex.action("moltys:deleteMolty" as any, {
        userId: user.userId,
        tokenHash: "oauth", // OAuth users don't have tokenHash - backend skips verification
        moltyId: moltyToDelete.id,
        confirmName: deleteConfirmText,
      });
      
      toast({
        title: "Molty deleted",
        description: `${moltyToDelete.name} has been permanently deleted.`,
      });
      // Remove from local state
      setMoltys(prev => prev.filter(m => m.id !== moltyToDelete.id));
      setDeleteModalOpen(false);
      setMoltyToDelete(null);
    } catch (e: any) {
      console.error("Failed to delete molty:", e);
      toast({
        title: "Delete failed",
        description: e.message || "Could not delete the Molty. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Power toggle handler - stop/start Molty container
  const handlePowerToggle = async (molty: MoltyData) => {
    if (!molty.sandboxId) {
      toast({
        title: "Cannot toggle power",
        description: "Molty has no sandbox ID",
        variant: "destructive",
      });
      return;
    }

    setPowerLoadingId(molty.id);
    const action = molty.status === "running" ? "stop" : "start";
    const convexAction = action === "stop" ? "moltys:stopMolty" : "moltys:startMolty";
    
    try {
      // Use Wolf's Convex actions for stop/start
      const response = await fetch(`${CONVEX_URL}/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: convexAction,
          args: { userId: user?.userId, moltyId: molty.id }
        }),
      });

      const data = await response.json();
      
      if (data.status !== "success") {
        throw new Error(data.errorMessage || `Failed to ${action} Molty`);
      }
      
      // Update local state with new status
      setMoltys(prev => prev.map(m => 
        m.id === molty.id 
          ? { ...m, status: action === "stop" ? "stopped" : "running" }
          : m
      ));

      toast({
        title: action === "stop" ? "Molty stopped" : "Molty started",
        description: `${molty.name} is now ${action === "stop" ? "offline" : "online"}`,
      });
    } catch (e: any) {
      console.error(`Failed to ${action} molty:`, e);
      toast({
        title: `Failed to ${action}`,
        description: e.message || `Could not ${action} the Molty. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setPowerLoadingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-coral" />
      </div>
    );
  }

  const activeCount = moltys.filter(m => m.status === "running").length;

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
                    key={molty.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <MoltyCard 
                      molty={molty} 
                      onDelete={handleDeleteClick}
                      onPowerToggle={handlePowerToggle}
                      isPowerLoading={powerLoadingId === molty.id}
                    />
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
                { label: "Billing", icon: CreditCard, href: "/settings#billing" },
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

      {/* Delete Molty Confirmation Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete Molty Permanently?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  This action <strong>cannot be undone</strong>. This will permanently delete{" "}
                  <strong>{moltyToDelete?.name}</strong> and all associated data including:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>All chat history and messages</li>
                  <li>Custom configurations and settings</li>
                  <li>Connected integrations (Discord, etc.)</li>
                  <li>The sandbox environment</li>
                </ul>
                <p className="pt-2">
                  To confirm, please type <strong>{moltyToDelete?.name}</strong> below:
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={`Type "${moltyToDelete?.name}" to confirm`}
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteConfirmText !== moltyToDelete?.name || isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Permanently
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
