import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Loader2, Lock, Sparkles, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createCheckoutSession, redirectToCheckout, PRICE_IDS } from "@/lib/stripe";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const billing = searchParams.get("billing") || "monthly";
  const isAnnual = billing === "annual";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [moltyName, setMoltyName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [email, setEmail] = useState("");
  const [vibe, setVibe] = useState("");

  const monthlyPrice = 29;
  const annualPrice = 24;
  const price = isAnnual ? annualPrice : monthlyPrice;
  const billedAmount = isAnnual ? annualPrice * 12 : monthlyPrice;

  const handleCheckout = async () => {
    setError(null);

    // Validation
    if (!moltyName.trim()) {
      setError("Please give your Molty a name");
      return;
    }
    if (!apiKey.trim()) {
      setError("Please enter your Anthropic API key");
      return;
    }
    if (!apiKey.startsWith("sk-ant-")) {
      setError("That doesn't look like a valid Anthropic API key (should start with sk-ant-)");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // For now, we'll generate a temporary userId
      // In production, this would come from your auth system
      const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      const { sessionId } = await createCheckoutSession({
        priceId: isAnnual ? PRICE_IDS.MOLTY_PRO_ANNUAL : PRICE_IDS.MOLTY_PRO_MONTHLY,
        userId: tempUserId,
        moltyName: moltyName.trim(),
        apiKey: apiKey.trim(),
        personality: {
          name: moltyName.trim(),
          vibe: vibe.trim() || "Helpful, curious, and direct.",
        },
      });

      await redirectToCheckout(sessionId);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body grain">
      <Navigation />

      <section className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Create your Molty
              </h1>
              <p className="text-muted-foreground">
                Set up your AI companion in just a few steps
              </p>
            </div>

            {/* Form Card */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-6">
                {/* Molty Name */}
                <div className="space-y-2">
                  <Label htmlFor="moltyName">Molty Name</Label>
                  <Input
                    id="moltyName"
                    placeholder="e.g., Atlas, Nova, Scout..."
                    value={moltyName}
                    onChange={(e) => setMoltyName(e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is what your Molty will call itself
                  </p>
                </div>

                {/* Personality Vibe */}
                <div className="space-y-2">
                  <Label htmlFor="vibe">Personality (optional)</Label>
                  <Textarea
                    id="vibe"
                    placeholder="e.g., Friendly and witty, with a love for bad puns..."
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe how you want your Molty to behave
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    For account recovery and important updates only
                  </p>
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Anthropic API Key</Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="sk-ant-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="h-12 pr-10"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your key is encrypted and stored only in your sandbox.{" "}
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-coral hover:underline"
                    >
                      Get one here →
                    </a>
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-border my-6" />

                {/* Price Summary */}
                <div className="rounded-2xl bg-muted/50 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Molty Pro ({isAnnual ? "Annual" : "Monthly"})</span>
                    <span className="font-display font-bold">${price}/mo</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Billed {isAnnual ? "annually" : "monthly"}</span>
                    <span>${billedAmount}{isAnnual ? "/year" : "/month"}</span>
                  </div>
                  {isAnnual && (
                    <div className="mt-2 text-sm text-coral font-medium">
                      You save ${(monthlyPrice - annualPrice) * 12}/year
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full h-12 text-lg shadow-warm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating checkout...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Continue to Payment
                    </>
                  )}
                </Button>

                {/* Security Note */}
                <p className="text-center text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Secure checkout powered by Stripe. Cancel anytime.
                </p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex items-center justify-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4" />
                <span>256-bit encryption</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>🔒</span>
                <span>SOC 2 compliant</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Checkout;
