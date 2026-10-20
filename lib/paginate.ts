export const PAGE_SIZE = 10;

/** Reads ?page= style values: whole numbers from 1 up, anything else is page 1. */
export function parsePage(value: unknown) {
  const page = typeof value === "string" ? Number(value) : NaN;
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/** Slices a list into one page and clamps the page number into range. */
export function paginate<T>(items: readonly T[], requestedPage: number, pageSize = PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageCount, total: items.length, start };
}
