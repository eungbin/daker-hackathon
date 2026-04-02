import { useState } from 'react';

export function usePagination(total: number, perPage: number) {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(total / perPage);
  const safePage = Math.min(page, Math.max(0, pageCount - 1));

  return {
    page: safePage,
    pageCount,
    hasPrev: safePage > 0,
    hasNext: safePage < pageCount - 1,
    prev: () => setPage(p => Math.max(0, p - 1)),
    next: () => setPage(p => Math.min(pageCount - 1, p + 1)),
    reset: () => setPage(0),
    slice: <T>(items: T[]): T[] => items.slice(safePage * perPage, (safePage + 1) * perPage),
  };
}
