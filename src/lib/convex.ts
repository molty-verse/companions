// Convex client for direct query/mutation calls
// Use this for moltys, posts, verses, etc.
// Auth endpoints use HTTP routes in api.ts

import { ConvexHttpClient } from "convex/browser";
import { ConvexReactClient } from "convex/react";

// The Convex deployment URL
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  throw new Error("VITE_CONVEX_URL environment variable is required");
}

// React client for ConvexBetterAuthProvider (handles auth token automatically)
export const convexReactClient = new ConvexReactClient(CONVEX_URL);

// HTTP client for imperative queries/mutations/actions outside React hooks
export const convex = new ConvexHttpClient(CONVEX_URL);

// Helper to set auth token on the HTTP client for imperative calls
export function setConvexAuth(token: string | null) {
  if (token) {
    convex.setAuth(token);
  } else {
    convex.clearAuth();
  }
}

// Convex Site URL for HTTP routes (auth, posts API, etc.)
export const CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL;
if (!CONVEX_SITE_URL) {
  throw new Error("VITE_CONVEX_SITE_URL environment variable is required");
}

// Re-export for convenience
export { CONVEX_URL };
