import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { verifyOneTimeToken } from "@/lib/better-auth";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

/**
 * OAuth Callback Handler
 * Handles the one-time token from crossDomain OAuth redirect
 * Route: /auth/callback?ott=TOKEN
 */
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setOAuthUser, user, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [authComplete, setAuthComplete] = useState(false);

  // Handle OTT verification
  useEffect(() => {
    const ott = searchParams.get("ott");
    console.log("[AuthCallback] Received OTT:", ott ? "present" : "missing");
    console.log("[AuthCallback] Full URL:", window.location.href);

    if (!ott) {
      console.error("[AuthCallback] No OTT token found");
      setError("No authentication token received");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // Verify the one-time token and get user data
    verifyOneTimeToken(ott)
      .then((userData) => {
        console.log("[AuthCallback] OTT verified, full userData:", JSON.stringify(userData));
        
        if (!userData || !userData.userId) {
          console.error("[AuthCallback] Invalid userData received:", userData);
          setError("Invalid user data received");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }
        
        // Set user in auth context (this also persists to localStorage)
        const userToStore = {
          userId: userData.userId,
          username: userData.username,
          email: userData.email,
        };
        console.log("[AuthCallback] Storing user:", JSON.stringify(userToStore));
        setOAuthUser(userToStore);
        
        toast({
          title: "Welcome!",
          description: "You've been signed in successfully",
        });
        
        // Mark auth as complete - navigation will happen in separate effect
        setAuthComplete(true);
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
  }, [searchParams, navigate, setOAuthUser]);

  // Navigate to dashboard AFTER user state is actually set
  useEffect(() => {
    if (authComplete && isAuthenticated && user) {
      console.log("[AuthCallback] User confirmed in state, navigating to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [authComplete, isAuthenticated, user, navigate]);

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
