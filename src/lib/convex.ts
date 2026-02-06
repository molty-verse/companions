// Convex client for direct query/mutation calls
// Use this for moltys, posts, verses, etc.
// Auth endpoints use HTTP routes in api.ts

import { ConvexHttpClient } from "convex/browser";

// The Convex deployment URL
const CONVEX_URL = "https://colorless-gull-839.convex.cloud";

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

// Re-export for convenience
export { CONVEX_URL };
