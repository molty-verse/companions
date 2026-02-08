/* eslint-disable react-refresh/only-export-components */
// This file exports both AuthProvider and hooks - intentional pattern

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "./api";
import { convex, setConvexAuth } from "./convex";
import { authClient } from "./better-auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use Better Auth session hook to track auth state
  const session = authClient.useSession();

  // Fetch Convex JWT, set it on the HTTP client, then ensure user record exists
  const refreshUser = useCallback(async () => {
    // 1. Get Convex JWT via Better Auth (includes cross-domain headers)
    try {
      const { data: tokenData } = await authClient.convex.token();
      if (tokenData?.token) {
        setConvexAuth(tokenData.token);
      } else {
        // No token — can't authenticate with Convex
        setConvexAuth(null);
      }
    } catch {
      setConvexAuth(null);
    }

    // 2. Call ensureUser (creates user record on first login)
    try {
      const convexUser = await convex.mutation("users:ensureUser" as any, {});
      if (convexUser) {
        setUser({
          userId: convexUser.id || convexUser.userId,
          username: convexUser.username,
          email: convexUser.email,
          displayName: convexUser.displayName,
          avatarUrl: convexUser.avatarUrl,
          bio: convexUser.bio,
          isAgent: convexUser.isAgent,
          createdAt: convexUser.createdAt,
        });
        return;
      }
    } catch {
      // ensureUser failed — fall through to session fallback
    }

    // 3. Fallback to session data
    if (session.data?.user) {
      const sessionUser = session.data.user;
      setUser({
        userId: sessionUser.id,
        username: sessionUser.name || sessionUser.email?.split("@")[0] || "user",
        email: sessionUser.email || "",
      });
    }
  }, [session.data]);

  // React to session changes
  useEffect(() => {
    if (session.isPending) return;

    if (!session.data?.user) {
      // No session — user is logged out
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Session exists — fetch Convex user profile
    refreshUser().finally(() => setIsLoading(false));
  }, [session.data, session.isPending, refreshUser]);

  const login = async (email: string, password: string) => {
    const result = await authClient.signIn.email({ email, password });
    if (result.error) {
      throw new Error(result.error.message || "Sign in failed");
    }
    // Session hook will auto-update, triggering user fetch
  };

  const register = async (username: string, email: string, password: string) => {
    const result = await authClient.signUp.email({
      email,
      password,
      name: username,
    });
    if (result.error) {
      throw new Error(result.error.message || "Registration failed");
    }
    // Session hook will auto-update, triggering user fetch
  };

  const logout = async () => {
    await authClient.signOut();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook to require authentication
export function useRequireAuth(redirectTo = "/login") {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
}

// Hook to redirect if already authenticated
export function useRedirectIfAuthenticated(redirectTo = "/dashboard") {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
}
