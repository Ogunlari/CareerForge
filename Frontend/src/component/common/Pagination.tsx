import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  pages: (number | string)[];
  canPrev: boolean;
  canNext: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, pages, canPrev, canNext, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!canPrev}
        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        typeof p === 'number' ? (
          <button
            key={i}
            onClick={() => onPageChange(p)}
            className={`min-w-[40px] h-10 px-2 rounded-lg text-sm font-semibold transition-all ${
              p === page
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        ) : (
          <span key={i} className="px-2 text-slate-400 text-sm">{p}</span>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!canNext}
        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
