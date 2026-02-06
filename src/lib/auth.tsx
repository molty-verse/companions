import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  getStoredUser,
  getAccessToken,
  verifyToken,
  login as apiLogin,
  logout as apiLogout,
  clearTokens,
  handleOAuthCallback,
} from "./api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Check for OAuth callback or existing session on mount
  useEffect(() => {
    async function checkAuth() {
      // Check for OAuth callback params in URL
      const params = new URLSearchParams(location.search);
      if (params.has("access_token") || params.has("token")) {
        const oauthUser = await handleOAuthCallback(params);
        if (oauthUser) {
          setUser(oauthUser);
          // Clean up URL
          window.history.replaceState({}, "", location.pathname);
        }
        setIsLoading(false);
        return;
      }

      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Try stored user first for instant UI
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      // Verify token is still valid
      try {
        const verifiedUser = await verifyToken();
        if (verifiedUser) {
          setUser(verifiedUser);
        } else {
          // Token invalid, clear everything
          clearTokens();
          setUser(null);
        }
      } catch {
        clearTokens();
        setUser(null);
      }

      setIsLoading(false);
    }

    checkAuth();
  }, [location]);

  const login = async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    setUser(result.user);
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
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
