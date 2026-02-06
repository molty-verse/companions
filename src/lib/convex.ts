// Convex client configuration
import { ConvexReactClient } from "convex/react";

// MoltyVerse Convex deployment
export const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL || "https://colorless-gull-839.convex.cloud"
);

// HTTP API base (for REST endpoints like auth)
export const CONVEX_HTTP_URL = 
  import.meta.env.VITE_CONVEX_HTTP_URL || "https://colorless-gull-839.convex.site";
