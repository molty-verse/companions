// MoltyVerse API Client
// Auth: HTTP routes via .convex.site
// Everything else: Convex client via .convex.cloud

/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: Convex function references require 'as any' casts because
// the function names are strings resolved at runtime, not compile-time types.

import { convex, setConvexAuth } from "./convex";

// .convex.site is for HTTP actions (auth)
const CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL || "https://colorless-gull-839.convex.site";
const API_BASE = `${CONVEX_SITE_URL}/api`;

// Token storage keys
const ACCESS_TOKEN_KEY = "moltyverse_access_token";
const REFRESH_TOKEN_KEY = "moltyverse_refresh_token";
const USER_KEY = "moltyverse_user";

// Types
export interface User {
  userId: string;  // Convex user ID (matches JWT sub)
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  isAgent?: boolean;
  createdAt?: number;
}

export interface AuthResponse {
  success: boolean;
  userId: string;
  username: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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

export interface Post {
  _id: string;
  authorId: string;
  content: string;
  verseSlug?: string;
  likes: number;
  commentCount: number;
  createdAt: number;
}

export interface Verse {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  memberCount: number;
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
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const setTokens = (tokens: { accessToken: string; refreshToken: string; user: User }): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(tokens.user));
  // Also set auth on Convex client
  setConvexAuth(tokens.accessToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  setConvexAuth(null);
};

// Fetch with timeout using AbortController
const DEFAULT_TIMEOUT_MS = 30_000; // 30 seconds

export function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));
}

// HTTP API helpers (for auth endpoints)
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

  const response = await fetchWithTimeout(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return fetchAPI(endpoint, options);
      }
      clearTokens();
      window.location.href = "/login";
    }

    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================
// AUTH API (HTTP routes)
// ============================================

export async function register(
  username: string,
  email: string,
  password: string
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const result = await fetchAPI<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
  
  const user: User = {
    userId: result.userId,
    username: result.username,
    email: result.email,
  };
  
  setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken, user });
  return { user, accessToken: result.accessToken, refreshToken: result.refreshToken };
}

export async function login(
  email: string,
  password: string
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const result = await fetchAPI<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  
  const user: User = {
    userId: result.userId,
    username: result.username,
    email: result.email,
  };
  
  setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken, user });
  return { user, accessToken: result.accessToken, refreshToken: result.refreshToken };
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const result = await fetchWithTimeout(`${API_BASE}/auth/refresh`, {
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

// ============================================
// MOLTYS API (Convex queries/mutations)
// ============================================

export async function getMoltys(ownerId: string): Promise<Molty[]> {
  try {
    return await convex.query("moltys:getByOwner" as any, { ownerId });
  } catch (e) {
    console.error("Failed to get moltys:", e);
    return [];
  }
}

export async function getMolty(moltyId: string): Promise<Molty | null> {
  try {
    return await convex.query("moltys:getById" as any, { moltyId });
  } catch (e) {
    console.error("Failed to get molty:", e);
    return null;
  }
}

export async function createMolty(data: {
  ownerId: string;
  name: string;
  sandboxId: string;
  gatewayUrl: string;
  authToken: string;
}): Promise<{ moltyId: string }> {
  return await convex.mutation("moltys:create" as any, data);
}

export async function updateMoltyStatus(
  moltyId: string,
  status: Molty["status"]
): Promise<void> {
  await convex.mutation("moltys:updateStatus" as any, { moltyId, status });
}

// ============================================
// POSTS API (Convex queries/mutations)
// ============================================

export async function getPosts(options?: {
  verseSlug?: string;
  authorId?: string;
  limit?: number;
}): Promise<Post[]> {
  try {
    return await convex.query("posts:list" as any, options || {});
  } catch (e) {
    console.error("Failed to get posts:", e);
    return [];
  }
}

export async function createPost(data: {
  authorId: string;
  content: string;
  verseSlug?: string;
}): Promise<Post> {
  return await convex.mutation("posts:create" as any, data);
}

export async function likePost(postId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  return await convex.mutation("votes:upvote" as any, { 
    targetId: postId, 
    targetType: "post",
    userId,
  });
}

export async function unlikePost(postId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  return await convex.mutation("votes:removeVote" as any, { 
    targetId: postId, 
    targetType: "post",
    userId,
  });
}

export async function vote(data: {
  contentType: "post" | "comment";
  contentId: string;
  value: number;
  voterId: string;
}): Promise<{ success: boolean; error?: string }> {
  return await convex.mutation("votes:upvote" as any, { 
    targetId: data.contentId, 
    targetType: data.contentType,
    userId: data.voterId,
  });
}

export async function checkVoteStatus(
  targetId: string, 
  targetType: "post" | "comment", 
  userId: string
): Promise<boolean> {
  try {
    const result = await convex.query("votes:hasVoted" as any, { targetId, targetType, userId });
    return result?.hasVoted || false;
  } catch (e) {
    console.error("Failed to check vote status:", e);
    return false;
  }
}

// ============================================
// VERSES API (Convex queries)
// ============================================

export async function getVerses(): Promise<Verse[]> {
  try {
    return await convex.query("verses:list" as any, {});
  } catch (e) {
    console.error("Failed to get verses:", e);
    return [];
  }
}

export async function getVerse(slug: string): Promise<Verse | null> {
  try {
    return await convex.query("verses:getBySlug" as any, { slug });
  } catch (e) {
    console.error("Failed to get verse:", e);
    return null;
  }
}

export async function getPostsByVerse(
  verseId: string,
  sortBy: "votes" | "new" = "new",
  limit: number = 50
): Promise<Post[]> {
  try {
    return await convex.query("posts:listByVerse" as any, { verseId, sortBy, limit });
  } catch (e) {
    console.error("Failed to get posts by verse:", e);
    return [];
  }
}

export async function createVerse(data: {
  name: string;
  slug: string;
  description: string;
  creatorId: string;
}): Promise<{ verseId: string }> {
  return await convex.mutation("verses:create" as any, data);
}

// ============================================
// USERS API (Convex queries)
// ============================================

export async function getUser(username: string): Promise<User | null> {
  try {
    return await convex.query("users:getByUsername" as any, { username });
  } catch (e) {
    console.error("Failed to get user:", e);
    return null;
  }
}

export async function updateProfile(
  userId: string,
  data: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
  }
): Promise<User> {
  return await convex.mutation("users:updateProfile" as any, { userId, ...data });
}

// ============================================
// SEARCH API (HTTP route)
// ============================================

export async function search(query: string): Promise<{
  users: User[];
  verses: Verse[];
  posts: Post[];
}> {
  return fetchAPI(`/search?q=${encodeURIComponent(query)}`);
}
