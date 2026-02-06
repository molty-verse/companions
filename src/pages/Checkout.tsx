/* eslint-disable @typescript-eslint/no-explicit-any */
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2, Lock, Sparkles, Terminal, Bot, Zap, Check } from "lucide-react";
import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { createCheckoutSession, redirectToCheckout, PRICE_IDS } from "@/lib/stripe";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

const proFeatures = [
  "Full sandbox access (SSH, VS Code)",
  "Install any tools & packages", 
  "Direct filesystem access",
  "Custom skills & integrations",
  "Priority support",
];

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const billing = searchParams.get("billing") || "monthly";
  const isAnnual = billing === "annual";

  const { user, isAuthenticated } = useAuth();
  const { isLoading: authLoading } = useRequireAuth("/login");

  const [isLoading, setIsLoading] = useState(false);

  const monthlyPrice = 29;
  const annualPrice = 24;
  const price = isAnnual ? annualPrice : monthlyPrice;
  const billedAmount = isAnnual ? annualPrice * 12 : monthlyPrice;

  const handleUpgrade = async () => {
    if (!user?.userId) {
      toast({
        title: "Not logged in",
        description: "Please log in to upgrade",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      const { sessionId } = await createCheckoutSession({
        priceId: isAnnual ? PRICE_IDS.MOLTY_PRO_ANNUAL : PRICE_IDS.MOLTY_PRO_MONTHLY,
        userId: user.userId,
      });

      await redirectToCheckout(sessionId);
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({
        title: "Checkout failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

      <section className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coral to-violet flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Upgrade to Molty Pro
              </h1>
              <p className="text-muted-foreground">
                Unlock full sandbox access for your Molty
              </p>
            </div>

            {/* Upgrade Card */}
            <div className="rounded-3xl border-2 border-coral bg-card p-8 shadow-warm">
              {/* What you get */}
              <div className="mb-8">
                <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-coral" />
                  What you unlock
                </h2>
                <ul className="space-y-3">
                  {proFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-coral mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Billing toggle */}
              <div className="flex items-center justify-center gap-4 mb-6 p-4 rounded-xl bg-muted/50">
                <span className={`font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
                  Monthly
                </span>
                <button
                  onClick={() => {
                    const newBilling = isAnnual ? "monthly" : "annual";
                    navigate(`/checkout?billing=${newBilling}`, { replace: true });
                  }}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    isAnnual ? "bg-coral" : "bg-muted-foreground/30"
                  }`}
                >
                  <motion.div
                    className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md"
                    animate={{ x: isAnnual ? 26 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
                <span className={`font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
                  Annual
                  <span className="ml-2 text-xs text-coral font-semibold">Save 17%</span>
                </span>
              </div>

              {/* Price Summary */}
              <div className="rounded-2xl bg-muted/50 p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Molty Pro ({isAnnual ? "Annual" : "Monthly"})</span>
                  <span className="font-display text-2xl font-bold">${price}/mo</span>
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

              {/* Upgrade Button */}
              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full h-12 text-lg shadow-warm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Redirecting to checkout...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Upgrade Now
                  </>
                )}
              </Button>

              {/* Security Note */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                <Lock className="w-3 h-3 inline mr-1" />
                Secure checkout powered by Stripe. Cancel anytime.
              </p>
            </div>

            {/* Already have a Molty note */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground text-sm">
                Don't have a Molty yet?{" "}
                <Link to="/create-molty" className="text-coral hover:underline font-medium">
                  Create one free →
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Checkout;
