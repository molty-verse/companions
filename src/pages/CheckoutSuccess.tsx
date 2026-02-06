import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, Rocket, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "provisioning" | "ready" | "error">("loading");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Verifying payment...");
  const [moltyName, setMoltyName] = useState("Your Molty");
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    // Simulate provisioning progress
    // In production, this would poll the backend for actual status
    const stages = [
      { progress: 10, stage: "Payment confirmed ✓", delay: 1000 },
      { progress: 25, stage: "Creating your sandbox...", delay: 2000 },
      { progress: 50, stage: "Installing OpenClaw...", delay: 5000 },
      { progress: 75, stage: "Configuring your Molty...", delay: 3000 },
      { progress: 90, stage: "Running health checks...", delay: 2000 },
      { progress: 100, stage: "Ready!", delay: 1000 },
    ];

    setStatus("provisioning");

    let totalDelay = 0;
    stages.forEach(({ progress, stage, delay }) => {
      totalDelay += delay;
      setTimeout(() => {
        setProgress(progress);
        setStage(stage);
        if (progress === 100) {
          setStatus("ready");
          setMoltyName("Atlas"); // This would come from the backend
          setDashboardUrl("/dashboard"); // This would be the actual Molty dashboard
        }
      }, totalDelay);
    });

    // In production, you'd poll for real status:
    // pollProvisionStatus(sessionId);
  }, [sessionId]);

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background font-body grain">
        <Navigation />
        <section className="pt-32 pb-24 px-4">
          <div className="container mx-auto max-w-xl text-center">
            <div className="text-6xl mb-6">😕</div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-8">
              We couldn't verify your checkout session. If you were charged,
              please contact support and we'll sort it out.
            </p>
            <Button onClick={() => navigate("/pricing")}>
              Back to Pricing
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body grain">
      <Navigation />

      <section className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6"
            >
              {status === "ready" ? (
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              ) : (
                <Loader2 className="w-10 h-10 text-coral animate-spin" />
              )}
            </motion.div>

            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {status === "ready" ? (
                <>Welcome to MoltyVerse! 🎉</>
              ) : (
                <>Setting up {moltyName}...</>
              )}
            </h1>

            {/* Status Message */}
            <p className="text-muted-foreground mb-8">
              {status === "ready" ? (
                <>Your Molty is ready and waiting to meet you.</>
              ) : (
                <>This usually takes about 60 seconds. Hang tight!</>
              )}
            </p>

            {/* Progress Bar */}
            {status === "provisioning" && (
              <div className="mb-8">
                <Progress value={progress} className="h-2 mb-3" />
                <p className="text-sm text-muted-foreground">{stage}</p>
              </div>
            )}

            {/* Action Button */}
            {status === "ready" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  size="lg"
                  className="shadow-warm"
                  onClick={() => dashboardUrl && navigate(dashboardUrl)}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Meet {moltyName}
                </Button>
              </motion.div>
            )}

            {/* What's Next */}
            {status === "ready" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-left"
              >
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  What's next?
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 rounded-2xl bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-coral font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Start chatting</h3>
                      <p className="text-sm text-muted-foreground">
                        Your Molty is ready to help. Ask it anything!
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-2xl bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-coral font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Connect platforms</h3>
                      <p className="text-sm text-muted-foreground">
                        Link Discord, Telegram, or WhatsApp to chat anywhere.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-2xl bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-coral font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Explore your sandbox</h3>
                      <p className="text-sm text-muted-foreground">
                        SSH in, install tools, and make it yours.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
