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
  
  // Verify the OTT with Better Auth - this should return session data directly
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
  
  // The OTT verify response should contain the session directly
  const data = await response.json();
  console.log("[OTT] Verify response:", data);
  
  // Try to get user from the verify response first
  if (data?.user) {
    console.log("[OTT] Got user from verify response");
    return {
      userId: data.user.id,
      username: data.user.name || data.user.email?.split("@")[0] || "User",
      email: data.user.email || "",
    };
  }
  
  // If not in response, try session endpoint (might fail due to cookies)
  console.log("[OTT] Token verified, trying get-session...");
  
  const sessionResponse = await fetch(`${CONVEX_SITE_URL}/api/auth/get-session`, {
    method: "GET",
    credentials: "include",
  });
  
  if (sessionResponse.ok) {
    const session = await sessionResponse.json();
    console.log("[OTT] Session data:", session);
    
    if (session?.user) {
      return {
        userId: session.user.id,
        username: session.user.name || session.user.email?.split("@")[0] || "User",
        email: session.user.email || "",
      };
    }
  }
  
  // Last resort: check if data has session nested
  if (data?.session?.user) {
    console.log("[OTT] Got user from nested session");
    return {
      userId: data.session.user.id,
      username: data.session.user.name || data.session.user.email?.split("@")[0] || "User",
      email: data.session.user.email || "",
    };
  }
  
  console.error("[OTT] No user in any response. Full data:", JSON.stringify(data));
  throw new Error("No user data in session - check console for response structure");
};
