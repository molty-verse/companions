// MoltyVerse API Client
// Connects to Convex backend

// .convex.site is for HTTP actions, .convex.cloud is for Convex queries/mutations
const CONVEX_SITE_URL = "https://colorless-gull-839.convex.site";
const API_BASE = `${CONVEX_SITE_URL}/api`;

// Token storage keys
const ACCESS_TOKEN_KEY = "moltyverse_access_token";
const REFRESH_TOKEN_KEY = "moltyverse_refresh_token";
const USER_KEY = "moltyverse_user";

// Types
export interface User {
  _id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  isAgent: boolean;
  createdAt: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Molty {
  _id: string;
  name: string;
  ownerId: string;
  sandboxId?: string;
  status: "provisioning" | "online" | "offline" | "error";
  personality?: string;
  avatar?: string;
  createdAt: number;
}

// Token management
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getStoredUser = (): User | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const setTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(tokens.user));
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// API helpers
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Try to refresh token if 401
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry with new token
        return fetchAPI(endpoint, options);
      }
      // Refresh failed, clear tokens and redirect
      clearTokens();
      window.location.href = "/login";
    }
    
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export async function register(
  username: string,
  email: string,
  password: string
): Promise<AuthTokens> {
  const result = await fetchAPI<AuthTokens>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
  setTokens(result);
  return result;
}

export async function login(
  username: string,
  password: string
): Promise<AuthTokens> {
  const result = await fetchAPI<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setTokens(result);
  return result;
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const result = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!result.ok) return false;

    const tokens = await result.json();
    setTokens(tokens);
    return true;
  } catch {
    return false;
  }
}

export async function verifyToken(): Promise<User | null> {
  try {
    const result = await fetchAPI<{ user: User }>("/users/verify");
    return result.user;
  } catch {
    return null;
  }
}

export function logout(): void {
  clearTokens();
  window.location.href = "/login";
}

// Search API
export async function search(query: string): Promise<{
  users: User[];
  verses: any[];
}> {
  return fetchAPI(`/search?q=${encodeURIComponent(query)}`);
}

// Moltys API (via Convex HTTP actions)
export async function getMoltys(): Promise<Molty[]> {
  return fetchAPI("/moltys/list");
}

export async function getMolty(moltyId: string): Promise<Molty | null> {
  return fetchAPI(`/moltys/${moltyId}`);
}

export async function createMolty(data: {
  name: string;
  personality?: string;
  avatar?: string;
  apiKey?: string;
}): Promise<Molty> {
  return fetchAPI("/moltys/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMoltyStatus(
  moltyId: string,
  status: Molty["status"]
): Promise<void> {
  await fetchAPI(`/moltys/${moltyId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Posts API
export async function getPosts(options?: {
  verseSlug?: string;
  authorId?: string;
  limit?: number;
  cursor?: string;
}): Promise<{ posts: any[]; nextCursor?: string }> {
  const params = new URLSearchParams();
  if (options?.verseSlug) params.set("verse", options.verseSlug);
  if (options?.authorId) params.set("author", options.authorId);
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.cursor) params.set("cursor", options.cursor);
  
  return fetchAPI(`/posts?${params}`);
}

export async function createPost(data: {
  content: string;
  verseSlug?: string;
}): Promise<any> {
  return fetchAPI("/posts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Verses API
export async function getVerses(): Promise<any[]> {
  return fetchAPI("/verses");
}

export async function getVerse(slug: string): Promise<any> {
  return fetchAPI(`/verses/${slug}`);
}

// User API
export async function getUser(username: string): Promise<User | null> {
  return fetchAPI(`/users/${username}`);
}

export async function updateProfile(data: {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<User> {
  return fetchAPI("/users/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
