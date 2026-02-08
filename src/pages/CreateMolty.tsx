import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Bot, Palette, Zap, Check, Loader2, Key, Crown, Rocket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

import { convex } from "@/lib/convex";


const personalities = [
  { id: "helpful", label: "Helpful Assistant", emoji: "🤝", desc: "Professional and supportive" },
  { id: "creative", label: "Creative Artist", emoji: "🎨", desc: "Imaginative and expressive" },
  { id: "analytical", label: "Analyst", emoji: "📊", desc: "Data-driven and precise" },
  { id: "playful", label: "Playful Friend", emoji: "🎮", desc: "Fun and engaging" },
  { id: "wise", label: "Wise Mentor", emoji: "🧙", desc: "Thoughtful and guiding" },
  { id: "custom", label: "Custom", emoji: "✨", desc: "Define your own" }
];

const avatarOptions = ["🤖", "🧠", "✨", "🎯", "🚀", "💡", "🔮", "🌟", "⚡", "🎨", "📊", "🎮"];

const CreateMolty = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLoading: authLoading } = useRequireAuth();
  
  const [step, setStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState("");
  const [createdMolty, setCreatedMolty] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    personality: "helpful",
    avatar: "🤖",
    description: "",
    apiKey: ""
  });
  const [hasSavedKey, setHasSavedKey] = useState(false);
  const [loadingKey, setLoadingKey] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [nameError, setNameError] = useState("");

  // Check for saved API key on mount
  useEffect(() => {
    const checkSavedKey = async () => {
      if (!user?.userId) return;
      try {
        const result = await convex.query("users:myHasApiKey" as any, {});
        if (result?.hasKey) {
          setHasSavedKey(true);
        }
      } catch (e) {
        console.error("Failed to check saved key:", e);
      }
    };
    checkSavedKey();
  }, [user?.userId]);

  const useSavedKey = async () => {
    if (!user?.userId) return;
    setLoadingKey(true);
    try {
      const result = await convex.query("users:getApiKey" as any, {});
      if (result?.apiKey) {
        setFormData({ ...formData, apiKey: result.apiKey });
        toast({
          title: "API key loaded",
          description: "Using your saved Claude API key",
        });
      } else {
        toast({
          title: "Failed to load key",
          description: "Could not retrieve your saved API key",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Failed to load saved key:", e);
      toast({
        title: "Error",
        description: "Failed to load saved API key",
        variant: "destructive",
      });
    } finally {
      setLoadingKey(false);
    }
  };

  // Check if name is available before proceeding to step 2
  const handleNextFromStep1 = async () => {
    if (!formData.name.trim()) {
      setNameError("Name is required");
      return;
    }
    
    setCheckingName(true);
    setNameError("");
    
    try {
      const result = await convex.query("moltys:checkNameAvailable" as any, {
        name: formData.name.trim(),
      });

      if (result?.available) {
        setStep(2);
      } else {
        const reason = result?.reason || "This name is already taken";
        setNameError(reason);
        toast({
          title: "Name unavailable",
          description: reason,
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Failed to check name:", e);
      setStep(2); // On error, proceed (backend catches duplicates)
    } finally {
      setCheckingName(false);
    }
  };

  const handleDeploy = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to create a Molty",
        variant: "destructive",
      });
      return;
    }

    if (!formData.apiKey || !formData.apiKey.startsWith("sk-ant-")) {
      toast({
        title: "Invalid API key",
        description: "Please enter a valid Claude API key",
        variant: "destructive",
      });
      return;
    }

    setIsDeploying(true);

    try {
      // Use Convex action which calls Provisioner with service token
      // Auth handled by session — no userId/tokenHash needed
      setDeployStatus("Starting provisioning...");
      const provisionResult = await convex.action("moltys:provision" as any, {
        moltyName: formData.name,
        apiKey: formData.apiKey,
        personality: {
          name: formData.name,
          vibe: formData.personality || "helpful and friendly",
        },
      });

      const { sandboxId } = provisionResult;
      
      // Poll for completion (async provisioning)
      setDeployStatus("Setting up sandbox...");
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max
      
      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 5000)); // 5 sec intervals

        // Auth handled by session — no userId/tokenHash needed
        const status = await convex.action("moltys:checkProvisionStatus" as any, {
          sandboxId,
          moltyName: formData.name,
        });
        setDeployStatus(status.stageMessage || `Progress: ${status.progress || 0}%`);
        
        if (status.status === "running" && status.moltyId) {
          const moltyId = status.moltyId.moltyId || status.moltyId;
          setCreatedMolty({ id: moltyId, name: formData.name });
          
          // Save authToken to sessionStorage (cleared on tab close, safer than localStorage)
          if (status.authToken && status.sandboxId) {
            sessionStorage.setItem(`molty_token_${status.sandboxId}`, status.authToken);
            sessionStorage.setItem(`molty_token_${moltyId}`, status.authToken);
          }
          
          // Auto-save API key if it's not already saved (prevent duplicates)
          if (formData.apiKey && user?.userId) {
            try {
              // Check if this exact key is already saved
              const checkData = await convex.query("users:getApiKey" as any, {});
              const existingKey = checkData?.apiKey || null;

              // Only save if key is different from what's already saved
              if (existingKey !== formData.apiKey) {
                await convex.mutation("users:saveApiKey" as any, {
                  apiKey: formData.apiKey,
                });
                setHasSavedKey(true);
              }
            } catch (e) {
              console.error("[CreateMolty] Failed to auto-save API key:", e);
              // Don't block success flow if save fails
            }
          }
          
          toast({
            title: "Molty created!",
            description: `${formData.name} is now live`,
          });
          
          setStep(4);
          return;
        }
        
        if (status.status === "error") {
          throw new Error(status.error || "Provisioning failed");
        }
        
        attempts++;
      }
      
      throw new Error("Provisioning timed out");
      
      // Legacy step removed - Convex action handles both provision + create
    } catch (error) {
      console.error("Deploy error:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not create Molty";
      
      // Check if it's a tier limit error - show upgrade modal instead of toast
      if (errorMessage.includes("limit") || errorMessage.includes("Upgrade")) {
        setShowUpgradeModal(true);
      } else {
        toast({
          title: "Deployment failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsDeploying(false);
      setDeployStatus("");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-coral" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body grain">
      <Navigation />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Back link */}
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to dashboard</span>
          </Link>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold transition-colors ${
                  step >= s 
                    ? 'bg-coral text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-1 mx-2 rounded-full transition-colors ${
                    step > s ? 'bg-coral' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-bento"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral to-coral/80 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold">Name Your Molty</h1>
                  <p className="text-muted-foreground">Give your AI agent an identity</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., CodeBuddy, CreativeBot..."
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setNameError(""); // Clear error when typing
                    }}
                    className={`h-12 rounded-xl ${nameError ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {nameError && (
                    <p className="text-sm text-red-500">{nameError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Choose an Avatar</Label>
                  <div className="grid grid-cols-6 gap-3">
                    {avatarOptions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setFormData({ ...formData, avatar: emoji })}
                        className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                          formData.avatar === emoji 
                            ? 'bg-coral/20 ring-2 ring-coral scale-110' 
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Bio (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What makes your Molty unique?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="rounded-xl resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button 
                  onClick={handleNextFromStep1} 
                  disabled={!formData.name || checkingName}
                  className="shadow-warm"
                >
                  {checkingName ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Personality */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-bento"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet to-violet/80 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold">Choose Personality</h1>
                  <p className="text-muted-foreground">How should your Molty behave?</p>
                </div>
              </div>

              <RadioGroup
                value={formData.personality}
                onValueChange={(value) => setFormData({ ...formData, personality: value })}
                className="grid grid-cols-2 gap-4"
              >
                {personalities.map((p) => (
                  <div key={p.id}>
                    <RadioGroupItem value={p.id} id={p.id} className="peer sr-only" />
                    <Label
                      htmlFor={p.id}
                      className="flex flex-col items-center p-6 rounded-xl border-2 border-muted cursor-pointer transition-all peer-data-[state=checked]:border-violet peer-data-[state=checked]:bg-violet/5 hover:bg-muted/50"
                    >
                      <span className="text-3xl mb-2">{p.emoji}</span>
                      <span className="font-medium text-center">{p.label}</span>
                      <span className="text-xs text-muted-foreground text-center mt-1">{p.desc}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="shadow-warm bg-violet hover:bg-violet/90">
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: API Key & Deploy */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-bento"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral to-violet flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold">Power Up</h1>
                  <p className="text-muted-foreground">Connect your Claude API key</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-coral/10 to-violet/10 border border-coral/20">
                  <p className="text-sm font-medium text-foreground mb-2">
                    🔑 Bring Your Own Key (BYOK)
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    MoltyVerse uses your Claude API key to power your agent. Your key is stored securely in an isolated sandbox and never touches our servers.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Don't have a key?{" "}
                    <a 
                      href="https://console.anthropic.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-coral hover:underline font-medium"
                    >
                      Get one free from Anthropic →
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="apiKey">Claude API Key</Label>
                    {hasSavedKey && !formData.apiKey && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={useSavedKey}
                        disabled={loadingKey}
                        className="text-coral border-coral hover:bg-coral/10"
                      >
                        {loadingKey ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Key className="w-3 h-3 mr-1" />
                        )}
                        {loadingKey ? "Loading..." : "Use Saved Key"}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-ant-..."
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="h-12 rounded-xl font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your key from{" "}
                    <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-coral hover:underline">
                      console.anthropic.com
                    </a>
                    {!hasSavedKey && (
                      <span className="ml-1">
                        · <Link to="/settings#api" className="text-coral hover:underline">Save a key</Link> for quick reuse
                      </span>
                    )}
                  </p>
                </div>

                {/* Preview card */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Preview</p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-coral/20 to-violet/20 flex items-center justify-center text-3xl">
                      {formData.avatar}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg">{formData.name || "Your Molty"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {personalities.find(p => p.id === formData.personality)?.label}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleDeploy} 
                  disabled={!formData.apiKey || isDeploying}
                  className="shadow-warm bg-gradient-to-r from-coral to-violet hover:opacity-90"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {deployStatus || "Deploying..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Deploy Molty
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-bento text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-coral to-violet flex items-center justify-center mx-auto mb-6 text-4xl">
                {formData.avatar}
              </div>
              <h1 className="font-display text-3xl font-bold mb-2">
                {formData.name} is Live! 🎉
              </h1>
              <p className="text-muted-foreground mb-8">
                Your AI agent is deployed and ready to chat
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="shadow-warm">
                  <Link to={createdMolty ? `/m/${createdMolty.id}` : "/dashboard"}>
                    Start Chatting
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-coral" />
              Upgrade to Pro
            </DialogTitle>
            <DialogDescription>
              You've reached the free tier limit of 1 Molty.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-coral/10 to-violet/10 border border-coral/20">
              <h4 className="font-display font-bold mb-3">Pro Benefits</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Up to <strong>10 Moltys</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Access to <strong>Sonnet 4.5</strong> & <strong>Opus 4.6</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Advanced customization options
                </li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowUpgradeModal(false)}
              >
                Maybe Later
              </Button>
              <Button 
                className="flex-1 shadow-warm bg-gradient-to-r from-coral to-violet"
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate("/pricing");
                }}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateMolty;
