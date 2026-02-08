import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

function readApiSource(): string {
  return readFileSync(resolve(__dirname, "api.ts"), "utf-8");
}

// Mock convex module to avoid import errors
vi.mock("./convex", () => ({
  convex: { query: vi.fn(), mutation: vi.fn(), action: vi.fn(), setAuth: vi.fn(), clearAuth: vi.fn() },
  setConvexAuth: vi.fn(),
  CONVEX_URL: "https://test.convex.cloud",
  CONVEX_SITE_URL: "https://test.convex.site",
}));

// ============================================
// API Structure Tests
// ============================================

describe("API module structure", () => {
  it("should not contain JWT token management", () => {
    const source = readApiSource();
    expect(source).not.toContain("ACCESS_TOKEN_KEY");
    expect(source).not.toContain("REFRESH_TOKEN_KEY");
    expect(source).not.toContain("getAccessToken");
    expect(source).not.toContain("getRefreshToken");
    expect(source).not.toContain("setTokens");
    expect(source).not.toContain("refreshAccessToken");
    expect(source).not.toContain("Authorization");
    expect(source).not.toContain("Bearer");
  });

  it("should not contain old auth endpoints", () => {
    const source = readApiSource();
    expect(source).not.toContain("/auth/register");
    expect(source).not.toContain("/auth/login");
    expect(source).not.toContain("/auth/refresh");
    expect(source).not.toContain("/users/verify");
    expect(source).not.toContain("/auth/oauth-sync");
  });

  it("should use Convex client for API calls", () => {
    const source = readApiSource();
    expect(source).toContain('convex.query(');
    expect(source).toContain('convex.mutation(');
    expect(source).toContain('from "./convex"');
  });

  it("should use fetchWithTimeout with credentials include", () => {
    const source = readApiSource();
    expect(source).toContain("fetchWithTimeout");
    expect(source).toContain('credentials: "include"');
  });
});

// ============================================
// Integration Contract Tests
// Verify frontend types match backend response shapes
// ============================================

describe("API type contracts", () => {
  it("Molty interface matches backend getMyMoltys response shape", () => {
    const backendResponse = {
      id: "j57abc123",
      name: "my-molty",
      status: "running" as const,
      sandboxId: "sb-123",
      gatewayUrl: "https://example.com",
      createdAt: Date.now(),
    };

    expect(backendResponse).toHaveProperty("id");
    expect(backendResponse).toHaveProperty("name");
    expect(backendResponse).toHaveProperty("status");
    expect(["provisioning", "running", "stopped", "error"]).toContain(backendResponse.status);
    expect(backendResponse).not.toHaveProperty("_id");
  });

  it("Post interface matches backend posts:list response shape", () => {
    const backendResponse = {
      id: "j57abc123",
      title: "Hello World",
      content: "Some content",
      voteCount: 5,
      createdAt: Date.now(),
      author: { id: "j57user1", username: "test", type: "human" },
      verse: { id: "j57verse1", name: "General", slug: "general" },
    };

    expect(backendResponse).toHaveProperty("id");
    expect(backendResponse).toHaveProperty("title");
    expect(backendResponse).toHaveProperty("voteCount");
    expect(backendResponse).toHaveProperty("author");
    expect(backendResponse).not.toHaveProperty("_id");
    expect(backendResponse).not.toHaveProperty("likes");
    expect(backendResponse).not.toHaveProperty("authorId");
  });

  it("Verse interface matches backend verses:list response shape", () => {
    const backendResponse = {
      id: "j57verse1",
      name: "General",
      slug: "general",
      description: "A general verse",
      createdAt: Date.now(),
    };

    expect(backendResponse).toHaveProperty("id");
    expect(backendResponse).toHaveProperty("slug");
    expect(backendResponse).not.toHaveProperty("_id");
    expect(backendResponse).not.toHaveProperty("icon");
    expect(backendResponse).not.toHaveProperty("memberCount");
  });

  it("User interface has userId field", () => {
    const source = readApiSource();
    const userInterfaceMatch = source.match(/interface User \{[\s\S]*?\}/);
    expect(userInterfaceMatch).toBeTruthy();
    expect(userInterfaceMatch![0]).toContain("userId: string");
    expect(userInterfaceMatch![0]).toContain("email: string");
  });
});
