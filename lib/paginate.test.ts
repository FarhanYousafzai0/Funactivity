import { describe, expect, it } from "vitest";
import { paginate, parsePage } from "./paginate";

describe("parsePage", () => {
  it("accepts whole numbers from 1 and falls back to 1 otherwise", () => {
    expect(parsePage("3")).toBe(3);
    expect(parsePage("1")).toBe(1);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-2")).toBe(1);
    expect(parsePage("2.5")).toBe(1);
    expect(parsePage("abc")).toBe(1);
    expect(parsePage(undefined)).toBe(1);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 23 }, (_, index) => index + 1);

  it("slices ten per page and reports the page count", () => {
    const first = paginate(items, 1);
    expect(first.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(first.pageCount).toBe(3);
    expect(first.total).toBe(23);
    expect(paginate(items, 3).items).toEqual([21, 22, 23]);
  });

  it("clamps out-of-range pages instead of returning nothing", () => {
    expect(paginate(items, 99).page).toBe(3);
    expect(paginate(items, 99).items).toEqual([21, 22, 23]);
    expect(paginate(items, 0).page).toBe(1);
  });

  it("treats an empty list as one empty page", () => {
    const empty = paginate([], 5);
    expect(empty.items).toEqual([]);
    expect(empty.page).toBe(1);
    expect(empty.pageCount).toBe(1);
  });
});
