import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Save, Bot, Brain, Wrench, Shield, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL || "https://colorless-gull-839.convex.cloud");

// Available models for selection
const AVAILABLE_MODELS = [
  { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", description: "Fast & efficient", tier: "free" },
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Balanced performance", tier: "pro" },
  { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", description: "Latest Sonnet", tier: "pro" },
  { id: "claude-opus-4-20250514", name: "Claude Opus 4", description: "Most capable", tier: "enterprise" },
];

// Common emoji options
const EMOJI_OPTIONS = ["🤖", "🧠", "🦊", "🐙", "🌟", "🔮", "💡", "🎯", "🚀", "✨", "🎨", "📊"];

interface MoltyData {
  id: string;
  name: string;
  status: string;
  ownerId: string;
  config?: {
    model?: string;
    identity?: {
      name?: string;
      theme?: string;
      emoji?: string;
      avatar?: string;
    };
    systemPrompt?: string;
    tools?: {
      allow?: string[];
      deny?: string[];
    };
  };
}

const MoltySettings = () => {
  const { moltyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [molty, setMolty] = useState<MoltyData | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("");
  const [emoji, setEmoji] = useState("🤖");
  const [model, setModel] = useState("claude-3-haiku-20240307");
  const [systemPrompt, setSystemPrompt] = useState("");
  
  // Tool toggles
  const [webSearch, setWebSearch] = useState(true);
  const [webFetch, setWebFetch] = useState(true);
  const [fileOps, setFileOps] = useState(true);
  const [codeExec, setCodeExec] = useState(false);
  const [browser, setBrowser] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchMolty = async () => {
      try {
        // Fetch molty details
        const result = await convex.query("moltys:getById" as any, { id: moltyId });
        
        if (!result) {
          toast({
            title: "Molty not found",
            description: "This Molty doesn't exist.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        // Check ownership
        if (result.ownerId !== user?.id) {
          toast({
            title: "Access denied",
            description: "You don't own this Molty.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setMolty(result);
        
        // Populate form with existing config
        setName(result.config?.identity?.name || result.name || "");
        setTheme(result.config?.identity?.theme || "");
        setEmoji(result.config?.identity?.emoji || "🤖");
        setModel(result.config?.model || "claude-3-haiku-20240307");
        setSystemPrompt(result.config?.systemPrompt || "");
        
        // Tool settings
        const denyList = result.config?.tools?.deny || [];
        setWebSearch(!denyList.includes("web_search"));
        setWebFetch(!denyList.includes("web_fetch"));
        setFileOps(!denyList.includes("read") && !denyList.includes("write"));
        setCodeExec(!denyList.includes("exec"));
        setBrowser(!denyList.includes("browser"));
        
      } catch (error) {
        console.error("Failed to fetch molty:", error);
        toast({
          title: "Error",
          description: "Failed to load Molty settings.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMolty();
  }, [moltyId, user, isAuthenticated, authLoading, navigate, toast]);

  const handleSave = async () => {
    if (!molty) return;
    
    setSaving(true);
    
    try {
      // Build deny list from toggles
      const denyList: string[] = [];
      if (!webSearch) denyList.push("web_search");
      if (!webFetch) denyList.push("web_fetch");
      if (!fileOps) denyList.push("read", "write", "edit");
      if (!codeExec) denyList.push("exec", "process");
      if (!browser) denyList.push("browser");

      const config = {
        model,
        identity: {
          name: name || molty.name,
          theme,
          emoji,
        },
        systemPrompt: systemPrompt || undefined,
        tools: denyList.length > 0 ? { deny: denyList } : undefined,
      };

      // Update molty config via Convex
      await convex.mutation("moltys:updateConfig" as any, {
        id: moltyId,
        config,
      });

      toast({
        title: "Settings saved",
        description: "Your Molty's configuration has been updated.",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-canvas-warm">
        <Navigation />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-coral" />
        </div>
      </div>
    );
  }

  if (!molty) {
    return null;
  }

  return (
    <div className="min-h-screen bg-canvas-warm">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/m/${moltyId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-stone-900">
              {emoji} {name || molty.name} Settings
            </h1>
            <p className="text-stone-500">Configure your Molty's personality and capabilities</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-coral hover:bg-coral/90">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="identity" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="identity" className="gap-2">
              <Bot className="w-4 h-4" />
              Identity
            </TabsTrigger>
            <TabsTrigger value="model" className="gap-2">
              <Brain className="w-4 h-4" />
              Model
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-2">
              <Wrench className="w-4 h-4" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Shield className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Identity Tab */}
          <TabsContent value="identity">
            <Card>
              <CardHeader>
                <CardTitle>Identity</CardTitle>
                <CardDescription>
                  Customize how your Molty presents itself
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="My Awesome Molty"
                    />
                    <p className="text-xs text-stone-500">
                      The name shown in chats and mentions
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Emoji</Label>
                    <div className="flex flex-wrap gap-2">
                      {EMOJI_OPTIONS.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setEmoji(e)}
                          className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                            emoji === e 
                              ? "border-coral bg-coral/10" 
                              : "border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="theme">Personality Theme</Label>
                  <Textarea
                    id="theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="e.g., A helpful coding assistant with a friendly demeanor, loves explaining complex concepts simply"
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-stone-500">
                    Describe your Molty's personality and style
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Model Tab */}
          <TabsContent value="model">
            <Card>
              <CardHeader>
                <CardTitle>AI Model</CardTitle>
                <CardDescription>
                  Choose the AI model powering your Molty
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Model Selection</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex items-center gap-2">
                            <span>{m.name}</span>
                            <span className="text-xs text-stone-400">- {m.description}</span>
                            {m.tier !== "free" && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                m.tier === "enterprise" ? "bg-violet/20 text-violet" : "bg-coral/20 text-coral"
                              }`}>
                                {m.tier}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-stone-500">
                    More capable models use more API credits
                  </p>
                </div>

                <Separator />

                <div className="bg-stone-50 rounded-lg p-4">
                  <h4 className="font-medium text-stone-900 mb-2">Model Comparison</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-stone-700">Haiku</p>
                      <p className="text-stone-500">Fast responses, great for simple tasks</p>
                    </div>
                    <div>
                      <p className="font-medium text-stone-700">Sonnet</p>
                      <p className="text-stone-500">Balanced speed and intelligence</p>
                    </div>
                    <div>
                      <p className="font-medium text-stone-700">Opus</p>
                      <p className="text-stone-500">Maximum capability for complex tasks</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle>Tool Access</CardTitle>
                <CardDescription>
                  Control what your Molty can do
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Web Search</p>
                    <p className="text-sm text-stone-500">Search the internet for information</p>
                  </div>
                  <Switch checked={webSearch} onCheckedChange={setWebSearch} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Web Fetch</p>
                    <p className="text-sm text-stone-500">Read content from URLs</p>
                  </div>
                  <Switch checked={webFetch} onCheckedChange={setWebFetch} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">File Operations</p>
                    <p className="text-sm text-stone-500">Read and write files in workspace</p>
                  </div>
                  <Switch checked={fileOps} onCheckedChange={setFileOps} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Code Execution</p>
                    <p className="text-sm text-stone-500">Run shell commands and scripts</p>
                  </div>
                  <Switch checked={codeExec} onCheckedChange={setCodeExec} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Browser Control</p>
                    <p className="text-sm text-stone-500">Automate web browser actions</p>
                  </div>
                  <Switch checked={browser} onCheckedChange={setBrowser} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Fine-tune your Molty's behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">Custom System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Add custom instructions for your Molty..."
                    className="min-h-[150px] font-mono text-sm"
                  />
                  <p className="text-xs text-stone-500">
                    Additional instructions added to the system prompt. Leave empty for defaults.
                  </p>
                </div>

                <Separator />

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-800 mb-1">⚠️ Danger Zone</h4>
                  <p className="text-sm text-amber-700 mb-3">
                    These actions cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm" disabled>
                    Delete Molty
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MoltySettings;
