"use client";

import { ReactNode, useEffect } from "react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { convexReactClient, setConvexAuth } from "@/lib/convex";
import { authClient } from "@/lib/better-auth";

/**
 * Syncs a proper Convex JWT to the ConvexHttpClient
 * so imperative calls (convex.query/mutation/action) also have auth.
 *
 * ConvexBetterAuthProvider handles the React client automatically.
 * This component uses authClient.convex.token() (same method the provider uses)
 * which includes the cross-domain Better-Auth-Cookie header.
 */
function AuthTokenSync({ children }: { children: ReactNode }) {
  const session = authClient.useSession();

  useEffect(() => {
    if (!session.data?.session) {
      setConvexAuth(null);
      return;
    }

    // Use authClient's built-in token method — includes cross-domain auth headers
    authClient.convex.token()
      .then(({ data }) => {
        if (data?.token) {
          setConvexAuth(data.token);
        }
      })
      .catch((err: unknown) => {
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
