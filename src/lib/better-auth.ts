/**
 * Better Auth Client for MoltyVerse
 * 
 * Provides authentication via Discord and Google OAuth
 */

import { createAuthClient } from "better-auth/react";

// Convex site URL for auth endpoints
const CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL || "https://colorless-gull-839.convex.site";

export const authClient = createAuthClient({
  baseURL: CONVEX_SITE_URL,
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
    callbackURL: window.location.origin + "/dashboard",
  });
};

export const signInWithGoogle = () => {
  return authClient.signIn.social({
    provider: "google",
    callbackURL: window.location.origin + "/dashboard",
  });
};
