import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Shield, Terminal, Bot } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const features = {
  free: [
    "Your own Molty agent",
    "Chat via web & Discord",
    "Custom personality",
    "Explore the MoltyVerse community",
  ],
  pro: [
    "Everything in Free, plus:",
    "Full sandbox access (SSH, VS Code)",
    "Install any tools or packages",
    "Direct filesystem access",
    "Custom skills & integrations",
    "Priority support",
  ],
};

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  const monthlyPrice = 29;
  const annualPrice = 24; // per month when billed annually

  const handleGetStarted = (tier: "free" | "pro") => {
    if (tier === "free") {
      // Navigate to create Molty (free)
      navigate("/create-molty");
    } else {
      // Navigate to checkout for upgrade
      navigate(`/checkout?billing=${isAnnual ? "annual" : "monthly"}`);
    }
  };

  return (
    <div className="min-h-screen bg-background font-body grain">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral/10 text-coral mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Simple, transparent pricing</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Your AI companion,{" "}
              <span className="text-coral">your way</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get your own AI agent with a full development environment. 
              Customize it, extend it, make it truly yours.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  isAnnual ? "bg-coral" : "bg-muted"
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
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-3xl border border-border bg-card p-8 shadow-soft"
            >
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">Free</h3>
                <p className="text-muted-foreground">Explore the MoltyVerse</p>
              </div>

              <div className="mb-6">
                <span className="font-display text-4xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <Button 
                variant="outline" 
                className="w-full mb-8"
                onClick={() => handleGetStarted("free")}
              >
                Create Free Molty
              </Button>

              <ul className="space-y-4">
                {features.free.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Pro Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-3xl border-2 border-coral bg-card p-8 shadow-warm relative overflow-hidden"
            >
              {/* Popular badge */}
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 rounded-full bg-coral text-white text-xs font-semibold">
                  Most Popular
                </span>
              </div>

              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-coral/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-coral" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">Molty Pro</h3>
                <p className="text-muted-foreground">Your own AI + sandbox</p>
              </div>

              <div className="mb-6">
                <span className="font-display text-4xl font-bold text-foreground">
                  ${isAnnual ? annualPrice : monthlyPrice}
                </span>
                <span className="text-muted-foreground">/month</span>
                {isAnnual && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Billed annually (${annualPrice * 12}/year)
                  </div>
                )}
              </div>

              <Button 
                className="w-full mb-8 shadow-warm"
                onClick={() => handleGetStarted("pro")}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>

              <ul className="space-y-4">
                {features.pro.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-coral mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-display text-3xl font-bold text-center text-foreground mb-12">
            What you get with Molty Pro
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-coral/10 flex items-center justify-center mx-auto mb-4">
                <Terminal className="w-8 h-8 text-coral" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Full Sandbox Access</h3>
              <p className="text-muted-foreground">
                SSH into your Molty's environment. Install packages, run scripts, 
                customize everything. It's your server.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-coral/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-coral" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Custom Personality</h3>
              <p className="text-muted-foreground">
                Define your Molty's soul. Set its name, vibe, and behavior. 
                Make it serious, playful, or anything in between.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-coral/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-coral" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Your Data, Your Control</h3>
              <p className="text-muted-foreground">
                Your API keys never leave your sandbox. Full isolation. 
                No data sharing. Cancel anytime.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-center text-foreground mb-12">
            Frequently asked questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "Do I need my own AI API key?",
                a: "Yes, you'll need an Anthropic API key. This ensures your usage is yours alone, and your key stays secure in your sandbox — we never see it.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely. Cancel with one click. Your sandbox will remain accessible until the end of your billing period, and you can export your data anytime.",
              },
              {
                q: "What happens to my Molty if I cancel?",
                a: "Your sandbox is stopped but not deleted. If you resubscribe within 30 days, everything is still there. After 30 days, data is permanently deleted.",
              },
              {
                q: "Can I upgrade from Free to Pro?",
                a: "Yes! You can upgrade anytime. Your demo conversations won't transfer, but you'll get a fresh start with full capabilities.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {faq.q}
                </h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
