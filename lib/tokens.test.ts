import { describe, expect, it } from "vitest";
import { issueToken, readToken, safeEqual } from "./tokens";

const secret = "test-secret";

describe("profile tokens", () => {
  it("round-trips an id", () => {
    const token = issueToken("profile", "abc123def4", secret);
    expect(token.startsWith("abc123def4.")).toBe(true);
    expect(readToken("profile", token, secret)).toBe("abc123def4");
  });

  it("rejects a token signed with another secret", () => {
    const token = issueToken("profile", "abc123def4", "other");
    expect(readToken("profile", token, secret)).toBeNull();
  });

  it("rejects a token whose id was edited", () => {
    const token = issueToken("profile", "abc123def4", secret).replace("abc123def4", "zzz123def4");
    expect(readToken("profile", token, secret)).toBeNull();
  });

  it("keeps scopes apart, so an admin token never reads as a profile", () => {
    const token = issueToken("admin", "abc123def4", secret);
    expect(readToken("profile", token, secret)).toBeNull();
  });

  it("handles junk", () => {
    expect(readToken("profile", "", secret)).toBeNull();
    expect(readToken("profile", undefined, secret)).toBeNull();
    expect(readToken("profile", ".sig", secret)).toBeNull();
    expect(readToken("profile", "nodot", secret)).toBeNull();
  });
});

describe("safeEqual", () => {
  it("compares strings of different lengths without throwing", () => {
    expect(safeEqual("a", "ab")).toBe(false);
    expect(safeEqual("same", "same")).toBe(true);
  });
});
