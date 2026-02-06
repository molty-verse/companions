import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { User, Key, Bell, CreditCard, Plug, Shield, Copy, Eye, EyeOff, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import Navigation from "@/components/Navigation";

const Settings = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const mockApiKey = "mv_sk_1234567890abcdef...";

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

          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-background">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="api" className="rounded-lg data-[state=active]:bg-background">
                <Key className="w-4 h-4 mr-2" />
                API Keys
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
                      🤖
                    </div>
                    <div>
                      <Button variant="outline" className="rounded-xl">Change Avatar</Button>
                      <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input 
                        defaultValue="shauryaagg" 
                        className="h-12 rounded-xl bg-muted/50 border-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input 
                        defaultValue="@shauryaagg" 
                        className="h-12 rounded-xl bg-muted/50 border-0"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        defaultValue="shaurya@example.com" 
                        className="h-12 rounded-xl bg-muted/50 border-0"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Bio</Label>
                      <textarea 
                        className="w-full h-24 p-4 rounded-xl bg-muted/50 border-0 resize-none focus:ring-2 focus:ring-coral/20 focus:outline-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  <Button className="shadow-warm">Save Changes</Button>
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
                      <h3 className="font-display font-bold">API Key</h3>
                      <p className="text-sm text-muted-foreground">Use this to authenticate API requests</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                    <code className="flex-1 font-mono text-sm">
                      {showApiKey ? "mv_sk_1234567890abcdefghijklmnop" : mockApiKey}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="rounded-xl">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate Key
                    </Button>
                  </div>
                </div>

                <div className="card-living">
                  <h3 className="font-display font-bold mb-4">Webhook URL</h3>
                  <div className="space-y-4">
                    <Input 
                      placeholder="https://your-server.com/webhook"
                      className="h-12 rounded-xl bg-muted/50 border-0"
                    />
                    <Button className="shadow-warm">Save Webhook</Button>
                  </div>
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
                      { label: "API Calls", used: "2,341", limit: "10,000" },
                      { label: "Moltys", used: "3", limit: "5" },
                      { label: "Storage", used: "156 MB", limit: "1 GB" },
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
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2027</p>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
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
                    { name: "Discord", icon: "🎮", connected: true, description: "Deploy Moltys to Discord servers" },
                    { name: "Telegram", icon: "✈️", connected: false, description: "Chat with Moltys on Telegram" },
                    { name: "WhatsApp", icon: "💬", connected: false, description: "Connect via WhatsApp Business" },
                    { name: "Slack", icon: "💼", connected: false, description: "Add Moltys to Slack workspaces" },
                  ].map((service) => (
                    <div key={service.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-2xl">
                          {service.icon}
                        </div>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                      <Button variant={service.connected ? "outline" : "default"} className={service.connected ? "" : "shadow-warm"}>
                        {service.connected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* Danger Zone */}
          <div className="mt-12 card-living border-red-200 dark:border-red-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">Irreversible actions</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
