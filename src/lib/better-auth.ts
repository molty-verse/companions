/**
 * Better Auth Client for MoltyVerse
 * 
 * Provides authentication via Discord and Google OAuth
 * Uses cross-domain plugin for Convex backend
 */

import { createAuthClient } from "better-auth/react";
import { crossDomainClient } from "@convex-dev/better-auth/client/plugins";

// Convex site URL for auth endpoints
const CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL || "https://colorless-gull-839.convex.site";

export const authClient = createAuthClient({
  baseURL: CONVEX_SITE_URL,
  plugins: [
    crossDomainClient(),
  ],
});

// Export specific methods for convenience
export const {
  signIn,
  signOut,
  useSession,
} = authClient;

// Social sign-in helpers
export const signInWithDiscord = async () => {
  console.log("[OAuth] Starting Discord sign-in...");
  const result = await authClient.signIn.social({
    provider: "discord",
    callbackURL: "/dashboard",
  });
  console.log("[OAuth] Discord sign-in result:", result);
  return result;
};

export const signInWithGoogle = async () => {
  console.log("[OAuth] Starting Google sign-in...");
  const result = await authClient.signIn.social({
    provider: "google",
    callbackURL: "/dashboard",
  });
  console.log("[OAuth] Google sign-in result:", result);
  return result;
};

/**
 * Verify one-time token from OAuth callback
 * Call this on the dashboard page if `?ott=` is present in URL
 * 
 * Returns user data if successful, throws if failed
 */
export const verifyOneTimeToken = async (token: string): Promise<{
  userId: string;
  username: string;
  email: string;
}> => {
  console.log("[OTT] Starting verification...");
  
  // Step 1: Verify the OTT with Better Auth (sets session cookie)
  const response = await fetch(`${CONVEX_SITE_URL}/api/auth/cross-domain/one-time-token/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
    credentials: "include",
  });
  
  if (!response.ok) {
    const err = await response.text();
    console.error("[OTT] Verification failed:", err);
    throw new Error("Failed to verify one-time token");
  }
  
  console.log("[OTT] Token verified, fetching session...");
  
  // Step 2: Get session from Better Auth (now that cookie is set)
  const sessionResponse = await fetch(`${CONVEX_SITE_URL}/api/auth/get-session`, {
    method: "GET",
    credentials: "include",
  });
  
  if (!sessionResponse.ok) {
    console.error("[OTT] Failed to get session");
    throw new Error("Failed to get session after OAuth");
  }
  
  const session = await sessionResponse.json();
  console.log("[OTT] Session data:", session);
  
  if (!session?.user) {
    console.error("[OTT] No user in session");
    throw new Error("No user data in session");
  }
  
  // Return user data - the caller (AuthCallback) will handle storage
  return {
    userId: session.user.id,
    username: session.user.name || session.user.email?.split("@")[0] || "User",
    email: session.user.email || "",
  };
};
