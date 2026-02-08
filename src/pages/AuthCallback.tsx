import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { verifyOneTimeToken } from "@/lib/better-auth";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

/**
 * OAuth Callback Handler
 * Handles the one-time token from crossDomain OAuth redirect.
 * Route: /auth/callback?ott=TOKEN
 *
 * After OTT verification, the session cookie is set.
 * The Better Auth session hook in AuthProvider will detect the new
 * session and fetch the Convex user profile automatically.
 */
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  // Verify the OTT (sets session cookie)
  useEffect(() => {
    const ott = searchParams.get("ott");
    console.log("[AuthCallback] Received OTT:", ott ? "present" : "missing");

    if (!ott) {
      console.error("[AuthCallback] No OTT token found");
      setError("No authentication token received");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // Guard against double verification (React Strict Mode)
    const ottKey = `ott_verified_${ott.slice(0, 16)}`;
    if (sessionStorage.getItem(ottKey)) {
      console.log("[AuthCallback] OTT already verified, skipping");
      setVerified(true);
      return;
    }
    sessionStorage.setItem(ottKey, "true");

    verifyOneTimeToken(ott)
      .then(() => {
        console.log("[AuthCallback] OTT verified, session cookie set");
        setVerified(true);
        toast({
          title: "Welcome!",
          description: "You've been signed in successfully",
        });
      })
      .catch((err) => {
        console.error("[AuthCallback] OTT verification failed:", err);
        setError("Authentication failed. Please try again.");
        toast({
          title: "Sign in failed",
          description: "Could not complete sign in. Please try again.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/login"), 2000);
      });
  }, [searchParams, navigate]);

  // Navigate to dashboard once the session is detected by AuthProvider
  useEffect(() => {
    if (verified && isAuthenticated) {
      console.log("[AuthCallback] Session detected, navigating to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [verified, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-red-500 mb-2">{error}</p>
            <p className="text-muted-foreground text-sm">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-coral mx-auto mb-4" />
            <p className="text-muted-foreground">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
