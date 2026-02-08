"use client";

import { ReactNode, useEffect } from "react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { convexReactClient, setConvexAuth } from "@/lib/convex";
import { authClient } from "@/lib/better-auth";

/**
 * Syncs the Better Auth session token to the ConvexHttpClient
 * so imperative calls (convex.query/mutation/action) also have auth.
 */
function AuthTokenSync({ children }: { children: ReactNode }) {
  const session = authClient.useSession();

  useEffect(() => {
    if (session.data?.session?.token) {
      setConvexAuth(session.data.session.token);
    } else {
      setConvexAuth(null);
    }
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
