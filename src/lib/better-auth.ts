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
    callbackURL: "/auth/callback",  // Must match AuthCallback route
  });
  console.log("[OAuth] Discord sign-in result:", result);
  return result;
};

export const signInWithGoogle = async () => {
  console.log("[OAuth] Starting Google sign-in...");
  const result = await authClient.signIn.social({
    provider: "google",
    callbackURL: "/auth/callback",  // Must match AuthCallback route
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
  
  // Extract Better Auth user from response
  let betterAuthUser: { id: string; name?: string; email?: string } | null = null;
  
  if (data?.user) {
    betterAuthUser = data.user;
  } else if (data?.session?.user) {
    betterAuthUser = data.session.user;
  }
  
  // If not in response, try session endpoint (might fail due to cookies)
  if (!betterAuthUser) {
    console.log("[OTT] Token verified, trying get-session...");
    const sessionResponse = await fetch(`${CONVEX_SITE_URL}/api/auth/get-session`, {
      method: "GET",
      credentials: "include",
    });
    
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      console.log("[OTT] Session data:", session);
      if (session?.user) {
        betterAuthUser = session.user;
      }
    }
  }
  
  if (!betterAuthUser) {
    console.error("[OTT] No user in any response. Full data:", JSON.stringify(data));
    throw new Error("No user data in session - check console for response structure");
  }
  
  console.log("[OTT] Got Better Auth user:", betterAuthUser);
  
  // Now sync to our users table to get a proper userId
  console.log("[OTT] Syncing to MoltyVerse users table...");
  const syncResponse = await fetch(`${CONVEX_SITE_URL}/api/auth/oauth-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      betterAuthUserId: betterAuthUser.id,
      email: betterAuthUser.email,
      name: betterAuthUser.name,
    }),
  });
  
  if (!syncResponse.ok) {
    const err = await syncResponse.text();
    console.error("[OTT] OAuth sync failed:", err);
    throw new Error("Failed to sync OAuth user to MoltyVerse");
  }
  
  const syncData = await syncResponse.json();
  console.log("[OTT] Sync response:", syncData);
  
  // Store JWT tokens if provided (for authenticated API calls)
  if (syncData.accessToken) {
    localStorage.setItem("moltyverse_access_token", syncData.accessToken);
  }
  if (syncData.refreshToken) {
    localStorage.setItem("moltyverse_refresh_token", syncData.refreshToken);
  }
  
  // Return the synced user data (with proper MoltyVerse userId)
  return {
    userId: syncData.userId,
    username: syncData.username,
    email: betterAuthUser.email || "",
  };
};
