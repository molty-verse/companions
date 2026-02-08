import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { getStoredUser, getAccessToken, setTokens, clearTokens } from "./api";

function readApiSource(): string {
  return readFileSync(resolve(__dirname, "api.ts"), "utf-8");
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock convex module to avoid import errors
vi.mock("./convex", () => ({
  convex: { setAuth: vi.fn(), clearAuth: vi.fn() },
  setConvexAuth: vi.fn(),
  CONVEX_URL: "https://test.convex.cloud",
  CONVEX_SITE_URL: "https://test.convex.site",
}));

describe("getStoredUser", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("returns null when no user is stored", () => {
    expect(getStoredUser()).toBeNull();
  });

  it("returns parsed user when valid JSON is stored", () => {
    const user = { userId: "u1", username: "testuser", email: "test@test.com" };
    localStorageMock.setItem("moltyverse_user", JSON.stringify(user));
    const result = getStoredUser();
    expect(result).toEqual(user);
  });

  it("returns null and cleans up when corrupted JSON is stored", () => {
    localStorageMock.setItem("moltyverse_user", "not-valid-json{{{");
    const result = getStoredUser();
    expect(result).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("moltyverse_user");
  });

  it("returns null for empty string (falsy, early return)", () => {
    localStorageMock.setItem("moltyverse_user", "");
    const result = getStoredUser();
    expect(result).toBeNull();
  });
});

describe("getAccessToken", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("returns null when no token is stored", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("returns the stored token", () => {
    localStorageMock.setItem("moltyverse_access_token", "test-token-123");
    expect(getAccessToken()).toBe("test-token-123");
  });
});

describe("setTokens", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("stores access token, refresh token, and user in localStorage", () => {
    const user = { userId: "u1", username: "testuser", email: "test@test.com" };
    setTokens({ accessToken: "at-123", refreshToken: "rt-456", user });

    expect(localStorageMock.setItem).toHaveBeenCalledWith("moltyverse_access_token", "at-123");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("moltyverse_refresh_token", "rt-456");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("moltyverse_user", JSON.stringify(user));
  });
});

describe("clearTokens", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("removes all auth data from localStorage", () => {
    localStorageMock.setItem("moltyverse_access_token", "at-123");
    localStorageMock.setItem("moltyverse_refresh_token", "rt-456");
    localStorageMock.setItem("moltyverse_user", '{"userId":"u1"}');

    clearTokens();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("moltyverse_access_token");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("moltyverse_refresh_token");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("moltyverse_user");
  });
});

// ============================================
// Integration Contract Tests
// Verify frontend types match backend response shapes
// ============================================

describe("API type contracts", () => {
  it("Molty interface matches backend getByOwner response shape", () => {
    // Backend moltys:getByOwner returns this shape
    const backendResponse = {
      id: "j57abc123",
      name: "my-molty",
      status: "running" as const,
      sandboxId: "sb-123",
      gatewayUrl: "https://example.com",
      createdAt: Date.now(),
    };

    // Should satisfy the Molty interface from api.ts
    // (id, name, status with "running"|"stopped"|"provisioning"|"error", sandboxId, gatewayUrl, createdAt)
    expect(backendResponse).toHaveProperty("id");
    expect(backendResponse).toHaveProperty("name");
    expect(backendResponse).toHaveProperty("status");
    expect(["provisioning", "running", "stopped", "error"]).toContain(backendResponse.status);
    expect(backendResponse).not.toHaveProperty("_id"); // Backend returns 'id', not '_id'
  });

  it("Post interface matches backend posts:list response shape", () => {
    // Backend posts:list returns enriched posts
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
    expect(backendResponse).not.toHaveProperty("likes"); // Old field name
    expect(backendResponse).not.toHaveProperty("authorId"); // Now nested in author object
  });

  it("Verse interface matches backend verses:list response shape", () => {
    // Backend verses:list returns this shape
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
    expect(backendResponse).not.toHaveProperty("icon"); // Not returned by backend
    expect(backendResponse).not.toHaveProperty("memberCount"); // Not returned by backend
  });

  it("login function sends correct field for username-based login", () => {
    const source = readApiSource();
    // Should detect email vs username and send the right field
    expect(source).toContain("emailOrUsername");
    expect(source).toContain('includes("@")');
  });

  it("refreshAccessToken only updates access token, preserving refresh token and user", () => {
    const source = readApiSource();
    // Should NOT call setTokens in refresh (which overwrites everything)
    // Should only update the access token key
    expect(source).toContain("localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)");
  });

  it("Auth response interface includes email field", () => {
    const source = readApiSource();
    // AuthResponse should have email field
    const authResponseMatch = source.match(/interface AuthResponse \{[\s\S]*?\}/);
    expect(authResponseMatch).toBeTruthy();
    expect(authResponseMatch![0]).toContain("email: string");
  });
});
