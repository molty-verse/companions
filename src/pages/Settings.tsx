/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { User, Bell, CreditCard, Plug, Loader2, Check, Key, Eye, EyeOff, Save, Trash2 } from "lucide-react";
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

const VALID_TABS = ["profile", "api", "billing"];

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
  
  // API Key state (stored in localStorage for privacy)
  const [savedApiKey, setSavedApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaving, setApiKeySaving] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
  });
  const [notifSaving, setNotifSaving] = useState(false);

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

  // Load saved API key from Convex
  useEffect(() => {
    const fetchApiKey = async () => {
      if (!user?.userId || !user?.tokenHash) return;
      try {
        const result = await convex.query("users:getApiKey" as any, {
          userId: user.userId,
          tokenHash: user.tokenHash,
        });
        if (result?.apiKey) {
          setSavedApiKey(result.apiKey);
        }
      } catch (e) {
        console.error("Failed to load API key:", e);
      }
    };
    fetchApiKey();
  }, [user]);

  // Load notification preferences
  useEffect(() => {
    const fetchNotifPrefs = async () => {
      if (!user?.userId) return;
      try {
        const prefs = await convex.query("users:getNotificationPrefs" as any, {
          userId: user.userId,
        });
        if (prefs) {
          setNotificationPrefs({
            emailNotifications: prefs.emailNotifications ?? true,
            pushNotifications: prefs.pushNotifications ?? true,
            weeklyDigest: prefs.weeklyDigest ?? false,
          });
        }
      } catch (e) {
        console.error("Failed to load notification prefs:", e);
      }
    };
    fetchNotifPrefs();
  }, [user]);

  // Handler to update notification preferences
  const handleNotificationChange = async (key: keyof typeof notificationPrefs, value: boolean) => {
    if (!user?.userId) return;
    
    const newPrefs = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(newPrefs);
    
    setNotifSaving(true);
    try {
      await convex.mutation("users:updateNotificationPrefs" as any, {
        userId: user.userId,
        [key]: value,
      });
    } catch (e) {
      console.error("Failed to update notification pref:", e);
      // Revert on error
      setNotificationPrefs(notificationPrefs);
    } finally {
      setNotifSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.userId) return;
    setSaving(true);
    try {
      await convex.mutation("users:updateProfile" as any, {
        userId: user.userId,
        name: profile.name || undefined,
        username: profile.username || undefined,
        birthday: profile.birthday || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      console.error("Failed to save profile:", e);
      alert(e.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!savedApiKey.trim() || !user?.userId || !user?.tokenHash) return;
    setApiKeySaving(true);
    try {
      await convex.mutation("users:saveApiKey" as any, {
        userId: user.userId,
        tokenHash: user.tokenHash,
        apiKey: savedApiKey.trim(),
      });
      setApiKeySaved(true);
      setTimeout(() => setApiKeySaved(false), 2000);
    } catch (e) {
      console.error("Failed to save API key:", e);
    } finally {
      setApiKeySaving(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!user?.userId || !user?.tokenHash) return;
    try {
      await convex.mutation("users:deleteApiKey" as any, {
        userId: user.userId,
        tokenHash: user.tokenHash,
      });
      setSavedApiKey("");
      setShowApiKey(false);
    } catch (e) {
      console.error("Failed to delete API key:", e);
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
              <TabsTrigger value="api" className="rounded-lg data-[state=active]:bg-background">
                <Key className="w-4 h-4 mr-2" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-background">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
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

            {/* API Keys Tab */}
            <TabsContent value="api">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="card-living">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center">
                      <Key className="w-5 h-5 text-coral" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold">Claude API Key</h3>
                      <p className="text-sm text-muted-foreground">Save your API key to reuse when creating Moltys</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={savedApiKey}
                        onChange={(e) => setSavedApiKey(e.target.value)}
                        placeholder="sk-ant-api03-..."
                        className="h-12 rounded-xl bg-muted/50 border-0 font-mono text-sm flex-1"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="shrink-0"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        onClick={handleSaveApiKey}
                        disabled={!savedApiKey.trim() || apiKeySaving}
                        className="shadow-warm"
                      >
                        {apiKeySaving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : apiKeySaved ? (
                          <Check className="w-4 h-4 mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {apiKeySaved ? "Saved!" : "Save Key"}
                      </Button>
                      {savedApiKey && (
                        <Button 
                          variant="outline" 
                          onClick={handleDeleteApiKey}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted/50 rounded-xl">
                    <p className="text-xs text-muted-foreground">
                      🔒 Your API key is stored securely in our database (encrypted at rest). Only you can access it.
                      Get your key from <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-coral hover:underline">console.anthropic.com</a>
                    </p>
                  </div>
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

          </Tabs>

        </div>
      </main>
    </div>
  );
};

export default Settings;
