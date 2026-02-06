// Convex client for direct query/mutation calls
// Use this for moltys, posts, verses, etc.
// Auth endpoints use HTTP routes in api.ts

import { ConvexHttpClient } from "convex/browser";

// The Convex deployment URL (use env var with fallback)
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || "https://colorless-gull-839.convex.cloud";

// Create a singleton client
export const convex = new ConvexHttpClient(CONVEX_URL);

// Helper to set auth token for authenticated queries
export function setConvexAuth(token: string | null) {
  if (token) {
    convex.setAuth(token);
  } else {
    convex.clearAuth();
  }
}

// Convex Site URL for HTTP routes (auth, posts API, etc.)
export const CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL || "https://colorless-gull-839.convex.site";

// Re-export for convenience
export { CONVEX_URL };
