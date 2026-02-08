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
    // The old code had: m.senderName === "shau" || m.receiverName === "shau"
    expect(source).not.toContain('senderName === "shau"');
    expect(source).not.toContain('receiverName === "shau"');
  });

  it("should only filter messages by userMoltyIds", () => {
    // The filter should only use userMoltyIds.includes()
    const filterBlock = source.match(/const userMessages = messages\.filter\([\s\S]*?\);/);
    expect(filterBlock).toBeTruthy();
    const filterCode = filterBlock![0];
    expect(filterCode).toContain("userMoltyIds.includes(m.senderId)");
    expect(filterCode).toContain("userMoltyIds.includes(m.receiverId)");
    expect(filterCode).not.toContain("senderName");
    expect(filterCode).not.toContain("receiverName");
  });
});

describe("Critical #6: Observability endpoint requires auth", () => {
  const source = readSource("pages/A2AMessages.tsx");

  it("should include Authorization header in observability fetch", () => {
    // The fetch to /api/observability/messages should include auth headers
    const fetchBlock = source.match(
      /fetchWithTimeout\(`\$\{CONVEX_SITE_URL\}\/api\/observability\/messages`[\s\S]*?\)/
    );
    expect(fetchBlock).toBeTruthy();
    expect(fetchBlock![0]).toContain("Authorization");
  });

  it("should only fetch messages when authenticated", () => {
    // The useEffect should check isAuthenticated before fetching
    expect(source).toContain("if (!isAuthenticated) return;");
  });
});

describe("Critical #5: No client-side auth tokens in API args", () => {
  it("Dashboard should not pass userId/tokenHash to delete action", () => {
    const source = readSource("pages/Dashboard.tsx");
    // Should NOT contain the hardcoded "oauth" tokenHash
    expect(source).not.toContain('tokenHash: "oauth"');
    // With Better Auth, should NOT pass tokenHash at all in API args
    expect(source).not.toContain("tokenHash,");
    expect(source).not.toContain("tokenHash:");
  });

  it("MoltySettings should not pass userId/tokenHash to delete action", () => {
    const source = readSource("pages/MoltySettings.tsx");
    // Should NOT contain the hardcoded "oauth" tokenHash
    expect(source).not.toContain('tokenHash: "oauth"');
    // With Better Auth, delete call should not include userId or tokenHash in args
    const deleteBlock = source.match(/deleteMolty[\s\S]*?\}\)/);
    expect(deleteBlock).toBeTruthy();
    expect(deleteBlock![0]).not.toContain("userId:");
  });

  it("MoltySettings should use singleton Convex client", () => {
    const source = readSource("pages/MoltySettings.tsx");
    // Should NOT create its own ConvexHttpClient
    expect(source).not.toContain("new ConvexHttpClient(");
    // Should import from lib/convex
    expect(source).toContain('from "@/lib/convex"');
  });
});

describe("Critical #3/#7: Auth verification is strict", () => {
  const source = readSource("lib/auth.tsx");

  it("should not skip verification for OAuth users", () => {
    // The old code had a shortcut: if isOAuth && storedUser, skip verification entirely.
    // The new code reads moltyverse_oauth to show stored user optimistically,
    // but ALWAYS verifies via get-session. Ensure no skip-verification shortcuts remain.
    expect(source).not.toContain("skipping token verification");
    // Ensure the session is always verified via get-session endpoint
    expect(source).toContain("api/auth/get-session");
  });

  it("should not fall back to stale cached user on verification failure", () => {
    // The old code had: "If verification fails but we have a stored user, keep them logged in"
    expect(source).not.toContain("using stored user");
    expect(source).not.toContain("keep them logged in");
  });

  it("should clear tokens on verification failure", () => {
    // The catch block should call clearTokens, not fall back
    // Check that the catch block contains clearTokens()
    const catchBlocks = source.match(/catch\s*(\([^)]*\))?\s*\{[\s\S]*?\}/g) || [];
    const authCatchBlocks = catchBlocks.filter(
      (block) => block.includes("clearTokens") || block.includes("setUser")
    );
    // At least one catch block should clear tokens
    const clearsCatch = authCatchBlocks.some(
      (block) => block.includes("clearTokens") && block.includes("setUser(null)")
    );
    expect(clearsCatch).toBe(true);
  });
});

describe("Critical #1: getStoredUser handles corrupted data", () => {
  const source = readSource("lib/api.ts");

  it("should wrap JSON.parse in try-catch", () => {
    // The getStoredUser function should contain try-catch
    const fnMatch = source.match(
      /export const getStoredUser[\s\S]*?^};/m
    );
    expect(fnMatch).toBeTruthy();
    const fn = fnMatch![0];
    expect(fn).toContain("try");
    expect(fn).toContain("catch");
    expect(fn).toContain("JSON.parse");
  });
});
