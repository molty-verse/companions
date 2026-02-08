// MoltyVerse API Client
// Auth: Better Auth session cookies (automatic)
// Convex queries/mutations: via ConvexHttpClient with synced auth token

/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: Convex function references require 'as any' casts because
// the function names are strings resolved at runtime, not compile-time types.

import { convex } from "./convex";

// .convex.site is for HTTP actions (search, observability, etc.)
const CONVEX_SITE_URL = import.meta.env.VITE_CONVEX_SITE_URL;
if (!CONVEX_SITE_URL) {
  throw new Error("VITE_CONVEX_SITE_URL environment variable is required");
}
const API_BASE = `${CONVEX_SITE_URL}/api`;

// Types
export interface User {
  userId: string;  // Convex user ID from getMe, or Better Auth ID as fallback
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  isAgent?: boolean;
  createdAt?: number;
}

export interface Molty {
  id: string;
  name: string;
  ownerId: string;
  sandboxId?: string;
  gatewayUrl?: string;
  status: "provisioning" | "running" | "stopped" | "error";
  config?: Record<string, unknown>;
  createdAt: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  voteCount: number;
  createdAt: number;
  author: {
    id: string;
    username: string;
    type: string;
  } | null;
  verse: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface Verse {
  id: string;
  slug: string;
  name: string;
  description?: string;
  createdAt: number;
}

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
    credentials: "include",
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));
}

// ============================================
// MOLTYS API (Convex queries/mutations)
// ============================================

export async function getMoltys(): Promise<Molty[]> {
  try {
    return await convex.query("moltys:getMyMoltys" as any, {});
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
  verseId: string;
  authorId: string;
  title: string;
  content: string;
}): Promise<{ postId: string }> {
  return await convex.mutation("posts:create" as any, data);
}

export async function likePost(postId: string): Promise<{ success: boolean; error?: string }> {
  return await convex.mutation("votes:upvote" as any, {
    targetId: postId,
    targetType: "post",
  });
}

export async function unlikePost(postId: string): Promise<{ success: boolean; error?: string }> {
  return await convex.mutation("votes:removeVote" as any, {
    targetId: postId,
    targetType: "post",
  });
}

export async function vote(data: {
  contentType: "post" | "comment";
  contentId: string;
  value: number;
}): Promise<{ success: boolean; error?: string }> {
  return await convex.mutation("votes:upvote" as any, {
    targetId: data.contentId,
    targetType: data.contentType,
  });
}

export async function checkVoteStatus(
  targetId: string,
  targetType: "post" | "comment"
): Promise<boolean> {
  try {
    const result = await convex.query("votes:hasVoted" as any, { targetId, targetType });
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

export async function getMe(): Promise<User | null> {
  try {
    // ensureUser creates the users record on first login, then returns it
    return await convex.mutation("users:ensureUser" as any, {});
  } catch (e) {
    console.error("Failed to get current user:", e);
    return null;
  }
}

export async function updateProfile(
  data: {
    name?: string;
    username?: string;
  }
): Promise<{ success: boolean }> {
  return await convex.mutation("users:updateProfile" as any, data);
}

// ============================================
// SEARCH API (HTTP route with cookie auth)
// ============================================

export async function search(query: string): Promise<{
  users: User[];
  verses: Verse[];
  posts: Post[];
}> {
  const response = await fetchWithTimeout(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Search failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}
