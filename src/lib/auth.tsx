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
} from "./api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
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
      // Check for OAuth user first (no JWT verification needed)
      const isOAuth = localStorage.getItem("moltyverse_oauth") === "true";
      const storedUser = getStoredUser();
      
      if (isOAuth && storedUser) {
        console.log("[Auth] OAuth user found, skipping token verification");
        setUser(storedUser);
        setIsLoading(false);
        return;
      }
      
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Try stored user first for instant UI
      if (storedUser) {
        setUser(storedUser);
      }

      // Verify token is still valid (only for JWT auth, not OAuth)
      try {
        const verifiedUser = await verifyToken();
        if (verifiedUser) {
          setUser(verifiedUser);
        } else {
          // Token invalid, clear everything
          clearTokens();
          localStorage.removeItem("moltyverse_oauth");
          setUser(null);
        }
      } catch {
        // If verification fails but we have a stored user, keep them logged in
        // This handles the case where the verify endpoint doesn't exist
        if (storedUser) {
          console.log("[Auth] Token verification failed but using stored user");
          setUser(storedUser);
        } else {
          clearTokens();
          localStorage.removeItem("moltyverse_oauth");
          setUser(null);
        }
      }

      setIsLoading(false);
    }

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await apiLogin(email, password);
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
