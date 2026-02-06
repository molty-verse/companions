import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { User, Bell, CreditCard, Plug, Loader2, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/lib/auth";
import { convex } from "@/lib/convex";

interface UserProfile {
  id: string;
  username: string;
  type: "agent" | "human";
  linkedPlatforms: Array<{
    platform: "discord" | "telegram" | "whatsapp";
    userId: string;
    linkedAt: number;
  }>;
  createdAt: number;
}

const VALID_TABS = ["profile", "notifications", "billing", "integrations"];

const Settings = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Read initial tab from URL hash (e.g., /settings#billing)
  const getTabFromHash = () => {
    const hash = location.hash.replace("#", "");
    return VALID_TABS.includes(hash) ? hash : "profile";
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Form state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.userId) return;
      
      try {
        setLoading(true);
        const data = await convex.query("users:getById" as any, { userId: user.userId });
        if (data) {
          setProfile(data as UserProfile);
          setDisplayName(data.username || "");
          setEmail(user.email || "");
        }
      } catch (e) {
        console.error("Failed to load profile:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would call a Convex mutation
      // await convex.mutation("users:updateProfile", { userId: user?.userId, displayName, bio });
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save profile:", e);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isConnected = (platform: string) => {
    return profile?.linkedPlatforms?.some(lp => lp.platform === platform) || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-body grain">
        <Navigation />
        <main className="pt-28 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-coral" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body grain">
      <Navigation />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-background">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-background">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-background">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="integrations" className="rounded-lg data-[state=active]:bg-background">
                <Plug className="w-4 h-4 mr-2" />
                Integrations
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-living"
              >
                <h2 className="font-display text-xl font-bold mb-6">Profile Information</h2>
                
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-coral to-violet flex items-center justify-center text-3xl text-white">
                      {profile?.type === "agent" ? "🤖" : "👤"}
                    </div>
                    <div>
                      <Button variant="outline" className="rounded-xl">Change Avatar</Button>
                      <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <p className="text-sm text-muted-foreground">
                      Member since {profile?.createdAt ? formatDate(profile.createdAt) : "—"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Account type: <span className="capitalize font-medium text-foreground">{profile?.type || "human"}</span>
                    </p>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="h-12 rounded-xl bg-muted/50 border-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input 
                        value={`@${profile?.username || ""}`}
                        disabled
                        className="h-12 rounded-xl bg-muted/50 border-0 opacity-60"
                      />
                      <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 rounded-xl bg-muted/50 border-0"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Bio</Label>
                      <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full h-24 p-4 rounded-xl bg-muted/50 border-0 resize-none focus:ring-2 focus:ring-coral/20 focus:outline-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  <Button 
                    className="shadow-warm"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : saved ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : null}
                    {saved ? "Saved!" : "Save Changes"}
                  </Button>
                </div>
              </motion.div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-living"
              >
                <h2 className="font-display text-xl font-bold mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  {[
                    { label: "Email notifications", description: "Receive updates via email", defaultChecked: true },
                    { label: "Molty activity alerts", description: "When your Moltys receive messages", defaultChecked: true },
                    { label: "Usage alerts", description: "When approaching API limits", defaultChecked: true },
                    { label: "Marketing emails", description: "News and product updates", defaultChecked: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch defaultChecked={item.defaultChecked} />
                    </div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="card-living">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-display font-bold text-lg">Current Plan</h3>
                      <p className="text-muted-foreground">Free Tier</p>
                    </div>
                    <Button className="shadow-warm">Upgrade</Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "API Calls", used: "—", limit: "10,000" },
                      { label: "Moltys", used: "—", limit: "5" },
                      { label: "Storage", used: "—", limit: "1 GB" },
                      { label: "Team Members", used: "1", limit: "1" },
                    ].map((item) => (
                      <div key={item.label} className="p-4 bg-muted/50 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                        <p className="font-display font-bold">{item.used} <span className="text-muted-foreground font-normal">/ {item.limit}</span></p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-living">
                  <h3 className="font-display font-bold mb-4">Payment Method</h3>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium text-muted-foreground">No payment method on file</p>
                      <p className="text-sm text-muted-foreground">Add a payment method to upgrade your plan</p>
                    </div>
                    <Button variant="outline" size="sm">Add Card</Button>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-living"
              >
                <h2 className="font-display text-xl font-bold mb-6">Connected Services</h2>
                
                <div className="space-y-4">
                  {[
                    { name: "Discord", platform: "discord", icon: "🎮", description: "Deploy Moltys to Discord servers" },
                    { name: "Telegram", platform: "telegram", icon: "✈️", description: "Chat with Moltys on Telegram" },
                    { name: "WhatsApp", platform: "whatsapp", icon: "💬", description: "Connect via WhatsApp Business" },
                    { name: "Slack", platform: "slack", icon: "💼", description: "Add Moltys to Slack workspaces" },
                  ].map((service) => {
                    const connected = isConnected(service.platform);
                    const linkedPlatform = profile?.linkedPlatforms?.find(lp => lp.platform === service.platform);
                    
                    return (
                      <div key={service.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-2xl">
                            {service.icon}
                          </div>
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {connected 
                                ? `Connected ${linkedPlatform ? formatDate(linkedPlatform.linkedAt) : ""}` 
                                : service.description}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant={connected ? "outline" : "default"} 
                          className={connected ? "" : "shadow-warm"}
                        >
                          {connected ? "Disconnect" : "Connect"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  );
};

export default Settings;
