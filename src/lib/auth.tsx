/* eslint-disable react-refresh/only-export-components */
// This file exports both AuthProvider and hooks - intentional pattern

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  getStoredUser,
  getAccessToken,
  verifyToken,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  clearTokens,
  fetchWithTimeout,
} from "./api";
import { CONVEX_SITE_URL } from "./convex";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setOAuthUser: (user: User) => void; // For OAuth bridge
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    async function checkAuth() {
      const token = getAccessToken();

      if (token) {
        // JWT login flow — show stored user immediately, then verify
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }

        try {
          const verifiedUser = await verifyToken();
          if (verifiedUser) {
            setUser(verifiedUser);
          } else {
            clearTokens();
            localStorage.removeItem("moltyverse_oauth");
            setUser(null);
          }
        } catch {
          clearTokens();
          localStorage.removeItem("moltyverse_oauth");
          setUser(null);
        }

        setIsLoading(false);
        return;
      }

      // No JWT token — check for an active Better Auth session cookie
      const isOAuth = localStorage.getItem("moltyverse_oauth") === "true";
      const storedOAuthUser = getStoredUser();

      if (isOAuth && storedOAuthUser) {
        // Show stored OAuth user immediately while verifying session
        setUser(storedOAuthUser);
      }

      try {
        const sessionResponse = await fetchWithTimeout(
          `${CONVEX_SITE_URL}/api/auth/get-session`,
          { method: "GET", credentials: "include" }
        );

        if (sessionResponse.ok) {
          const session = await sessionResponse.json();
          if (session?.user) {
            const username =
              session.user.name ||
              session.user.email?.split("@")[0] ||
              "user";
            const sessionUser: User = {
              userId: session.user.id,
              username,
              email: session.user.email || "",
            };
            localStorage.setItem("moltyverse_user", JSON.stringify(sessionUser));
            localStorage.setItem("moltyverse_oauth", "true");
            setUser(sessionUser);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Session check failed — fall through to clear state
      }

      // No valid session of any kind
      clearTokens();
      localStorage.removeItem("moltyverse_oauth");
      setUser(null);
      setIsLoading(false);
    }

    checkAuth();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    const result = await apiLogin(emailOrUsername, password);
    setUser(result.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const result = await apiRegister(username, email, password);
    setUser(result.user);
  };

  const logout = () => {
    clearTokens();
    localStorage.removeItem("moltyverse_oauth");
    setUser(null);
    // Navigate to home instead of login
    window.location.href = "/";
  };

  // For OAuth: directly set user without going through JWT flow
  const setOAuthUser = (oauthUser: User) => {
    console.log("[Auth] setOAuthUser called with:", oauthUser);
    
    if (!oauthUser || !oauthUser.userId) {
      console.error("[Auth] Invalid user data passed to setOAuthUser:", oauthUser);
      return;
    }
    
    try {
      // Store in localStorage for persistence
      localStorage.setItem("moltyverse_user", JSON.stringify(oauthUser));
      // Mark as OAuth user (no JWT to verify)
      localStorage.setItem("moltyverse_oauth", "true");
      console.log("[Auth] Successfully wrote to localStorage");
    } catch (err) {
      console.error("[Auth] Failed to write to localStorage:", err);
    }
    
    setUser(oauthUser);
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
        setOAuthUser,
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
