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
export const signInWithDiscord = () => {
  return authClient.signIn.social({
    provider: "discord",
    callbackURL: "/dashboard",
  });
};

export const signInWithGoogle = () => {
  return authClient.signIn.social({
    provider: "google",
    callbackURL: "/dashboard",
  });
};

/**
 * Verify one-time token from OAuth callback
 * Call this on the dashboard page if `?ott=` is present in URL
 */
export const verifyOneTimeToken = async (token: string) => {
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
    throw new Error("Failed to verify one-time token");
  }
  
  const data = await response.json();
  
  // Step 2: Get session from Better Auth (now that cookie is set)
  const sessionResponse = await fetch(`${CONVEX_SITE_URL}/api/auth/get-session`, {
    method: "GET",
    credentials: "include",
  });
  
  if (sessionResponse.ok) {
    const session = await sessionResponse.json();
    if (session?.user) {
      // Step 3: Bridge to our JWT auth system by storing user in localStorage
      // This makes AuthProvider recognize the user
      const user = {
        userId: session.user.id,
        username: session.user.name || session.user.email?.split("@")[0] || "User",
        email: session.user.email,
        avatar: session.user.image,
      };
      localStorage.setItem("moltyverse_user", JSON.stringify(user));
      // Use session token as our access token
      if (session.session?.token) {
        localStorage.setItem("moltyverse_access_token", session.session.token);
      }
    }
  }
  
  return data;
};
