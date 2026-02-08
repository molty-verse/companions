"use client";

import { ReactNode, useEffect } from "react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { convexReactClient, CONVEX_SITE_URL, setConvexAuth } from "@/lib/convex";
import { authClient } from "@/lib/better-auth";

/**
 * Syncs a proper Convex JWT to the ConvexHttpClient
 * so imperative calls (convex.query/mutation/action) also have auth.
 *
 * ConvexBetterAuthProvider handles the React client automatically.
 * This component fetches the same JWT for the imperative HTTP client.
 */
function AuthTokenSync({ children }: { children: ReactNode }) {
  const session = authClient.useSession();

  useEffect(() => {
    if (!session.data?.session) {
      setConvexAuth(null);
      return;
    }

    // Fetch proper Convex JWT from the token endpoint (same as ConvexBetterAuthProvider uses)
    fetch(`${CONVEX_SITE_URL}/api/auth/convex/token`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Token endpoint returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.token) {
          setConvexAuth(data.token);
        }
      })
      .catch((err) => {
        console.error("[AuthTokenSync] Failed to get Convex token:", err);
        setConvexAuth(null);
      });
  }, [session.data]);

  return <>{children}</>;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexBetterAuthProvider
      client={convexReactClient}
      authClient={authClient}
    >
      <AuthTokenSync>
        {children}
      </AuthTokenSync>
    </ConvexBetterAuthProvider>
  );
}
