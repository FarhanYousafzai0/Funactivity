import { describe, expect, it } from "vitest";
import { cleanText, isValidId, PHOTO_MAX_BYTES, PHOTO_PREFIX, photoError, textError } from "./validation";

describe("cleanText", () => {
  it("collapses whitespace and ignores non-strings", () => {
    expect(cleanText("  Ayesha   Khan \n")).toBe("Ayesha Khan");
    expect(cleanText(null)).toBe("");
    expect(cleanText(42)).toBe("");
  });
});

describe("textError", () => {
  it("requires a value unless told otherwise", () => {
    expect(textError("", "Name", 10)).toBe("Name is required.");
    expect(textError("", "Tagline", 10, false)).toBeNull();
  });

  it("enforces the maximum length", () => {
    expect(textError("x".repeat(11), "Name", 10)).toBe("Name must be 10 characters or fewer.");
    expect(textError("x".repeat(10), "Name", 10)).toBeNull();
  });
});

describe("photoError", () => {
  const jpeg = (bytes: number) => PHOTO_PREFIX + Buffer.alloc(bytes, 1).toString("base64");

  it("accepts a small JPEG data URL", () => {
    expect(photoError(jpeg(1000))).toBeNull();
  });

  it("rejects anything that is not a JPEG data URL", () => {
    expect(photoError("")).toMatch(/Add your profile photo/);
    expect(photoError("data:image/png;base64,AAAA")).toMatch(/JPEG/);
    expect(photoError("data:image/svg+xml;base64,AAAA")).toMatch(/JPEG/);
    expect(photoError(PHOTO_PREFIX + "not base64!!")).toMatch(/not valid/);
  });

  it("rejects photos over the size limit", () => {
    expect(photoError(jpeg(PHOTO_MAX_BYTES))).toBeNull();
    expect(photoError(jpeg(PHOTO_MAX_BYTES + 3))).toMatch(/too large/);
  });
});

describe("isValidId", () => {
  it("only accepts ten lowercase hex characters", () => {
    expect(isValidId("abcdef0123")).toBe(true);
    expect(isValidId("ABCDEF0123")).toBe(false);
    expect(isValidId("abcdef012")).toBe(false);
    expect(isValidId("../etc/pwd")).toBe(false);
    expect(isValidId(undefined)).toBe(false);
  });
});
