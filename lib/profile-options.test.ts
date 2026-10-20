import { describe, expect, it } from "vitest";
import { INTEREST_OPTIONS, labelsFor, pickKeys, STUDY_OPTIONS } from "./profile-options";

describe("pickKeys", () => {
  it("keeps known keys from form values, in option order, without duplicates", () => {
    expect(pickKeys(STUDY_OPTIONS, ["working", "school", "school", "bogus"])).toEqual(["school", "working"]);
  });

  it("reads a stored JSON array", () => {
    expect(pickKeys(INTEREST_OPTIONS, '["vibe-coding","ai-expert"]')).toEqual(["ai-expert", "vibe-coding"]);
  });

  it("treats null, junk and non-strings as nothing selected", () => {
    expect(pickKeys(STUDY_OPTIONS, null)).toEqual([]);
    expect(pickKeys(STUDY_OPTIONS, "not json")).toEqual([]);
    expect(pickKeys(STUDY_OPTIONS, [42, {}])).toEqual([]);
  });
});

describe("labelsFor", () => {
  it("maps keys to labels and skips unknown ones", () => {
    expect(labelsFor(STUDY_OPTIONS, ["college", "nope"])).toEqual(["College (FSc / Intermediate)"]);
  });
});
