import { useState, useMemo } from 'react';

export function usePagination(total: number, pageSize: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const range = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    return { start, end };
  }, [page, pageSize, total]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pages = useMemo(() => {
    const result: (number | string)[] = [];
    const showAround = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - showAround && i <= page + showAround)) {
        result.push(i);
      } else if (result[result.length - 1] !== '...') {
        result.push('...');
      }
    }
    return result;
  }, [page, totalPages]);

  return { page, setPage, totalPages, range, canPrev, canNext, pages };
}
