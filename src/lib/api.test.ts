import { describe, it, expect, beforeEach, vi } from "vitest";
import { getStoredUser, getAccessToken, setTokens, clearTokens } from "./api";

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
