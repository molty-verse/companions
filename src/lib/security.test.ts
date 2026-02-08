/**
 * Security regression tests for critical fixes.
 *
 * These tests verify that the critical security issues identified in the audit
 * remain fixed. Each test maps to a specific critical issue number.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const SRC = resolve(__dirname, "..");

function readSource(relativePath: string): string {
  return readFileSync(resolve(SRC, relativePath), "utf-8");
}

describe("Critical #4: No hardcoded usernames in A2AMessages", () => {
  const source = readSource("pages/A2AMessages.tsx");

  it('should not contain hardcoded "shau" username in filter logic', () => {
    expect(source).not.toContain('senderName === "shau"');
    expect(source).not.toContain('receiverName === "shau"');
  });

  it("should only filter messages by userMoltyIds", () => {
    const filterBlock = source.match(/const userMessages = messages\.filter\([\s\S]*?\);/);
    expect(filterBlock).toBeTruthy();
    const filterCode = filterBlock![0];
    expect(filterCode).toContain("userMoltyIds.includes(m.senderId)");
    expect(filterCode).toContain("userMoltyIds.includes(m.receiverId)");
    expect(filterCode).not.toContain("senderName");
    expect(filterCode).not.toContain("receiverName");
  });
});

describe("Critical #6: Observability endpoint uses cookie auth", () => {
  const source = readSource("pages/A2AMessages.tsx");

  it("should use credentials include for observability fetch", () => {
    const fetchBlock = source.match(
      /fetchWithTimeout\(`\$\{CONVEX_SITE_URL\}\/api\/observability\/messages`[\s\S]*?\)/
    );
    expect(fetchBlock).toBeTruthy();
    expect(fetchBlock![0]).toContain("credentials");
  });

  it("should not use Bearer token for observability fetch", () => {
    const fetchBlock = source.match(
      /fetchWithTimeout\(`\$\{CONVEX_SITE_URL\}\/api\/observability\/messages`[\s\S]*?\)/
    );
    expect(fetchBlock).toBeTruthy();
    expect(fetchBlock![0]).not.toContain("Authorization");
    expect(fetchBlock![0]).not.toContain("Bearer");
  });

  it("should only fetch messages when authenticated", () => {
    expect(source).toContain("if (!isAuthenticated) return;");
  });
});

describe("Critical #5: No client-side auth tokens in API args", () => {
  it("Dashboard should not pass userId/tokenHash to delete action", () => {
    const source = readSource("pages/Dashboard.tsx");
    expect(source).not.toContain('tokenHash: "oauth"');
    expect(source).not.toContain("tokenHash,");
    expect(source).not.toContain("tokenHash:");
  });

  it("MoltySettings should not pass userId/tokenHash to delete action", () => {
    const source = readSource("pages/MoltySettings.tsx");
    expect(source).not.toContain('tokenHash: "oauth"');
    const deleteBlock = source.match(/deleteMolty[\s\S]*?\}\)/);
    expect(deleteBlock).toBeTruthy();
    expect(deleteBlock![0]).not.toContain("userId:");
  });

  it("MoltySettings should use singleton Convex client", () => {
    const source = readSource("pages/MoltySettings.tsx");
    expect(source).not.toContain("new ConvexHttpClient(");
    expect(source).toContain('from "@/lib/convex"');
  });

  it("api.ts should not contain JWT token management", () => {
    const source = readSource("lib/api.ts");
    expect(source).not.toContain("ACCESS_TOKEN_KEY");
    expect(source).not.toContain("REFRESH_TOKEN_KEY");
    expect(source).not.toContain("getAccessToken");
    expect(source).not.toContain("Authorization");
    expect(source).not.toContain("Bearer");
  });
});

describe("Critical #2: No localStorage token management", () => {
  it("api.ts should not store tokens in localStorage", () => {
    const source = readSource("lib/api.ts");
    expect(source).not.toContain("localStorage.setItem");
    expect(source).not.toContain("localStorage.getItem");
    expect(source).not.toContain("localStorage.removeItem");
  });

  it("auth.tsx should not use localStorage for auth state", () => {
    const source = readSource("lib/auth.tsx");
    expect(source).not.toContain("localStorage");
    expect(source).not.toContain("moltyverse_oauth");
    expect(source).not.toContain("moltyverse_user");
    expect(source).not.toContain("moltyverse_access_token");
  });
});

describe("Critical #3: Auth uses Better Auth sessions", () => {
  const source = readSource("lib/auth.tsx");

  it("should use Better Auth session for auth state", () => {
    expect(source).toContain("authClient.useSession()");
    expect(source).toContain("authClient.signIn.email");
    expect(source).toContain("authClient.signUp.email");
    expect(source).toContain("authClient.signOut");
  });

  it("should use getMe() for Convex user profile", () => {
    expect(source).toContain("getMe()");
  });

  it("should not use old JWT auth patterns", () => {
    expect(source).not.toContain("getAccessToken");
    expect(source).not.toContain("verifyToken");
    expect(source).not.toContain("clearTokens");
    expect(source).not.toContain("setOAuthUser");
  });
});
