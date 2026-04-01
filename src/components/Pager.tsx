interface Props {
  page: number;
  pageCount: number;
  hasPrev: boolean;
  hasNext: boolean;
  prev: () => void;
  next: () => void;
}

export default function Pager({ page, pageCount, hasPrev, hasNext, prev, next }: Props) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center gap-1.5 text-gray-500 text-sm">
      <button
        onClick={prev}
        disabled={!hasPrev}
        className="w-6 h-6 flex items-center justify-center rounded hover:text-white disabled:opacity-30 transition-colors text-base"
      >
        ‹
      </button>
      <span className="text-xs">{page + 1} / {pageCount}</span>
      <button
        onClick={next}
        disabled={!hasNext}
        className="w-6 h-6 flex items-center justify-center rounded hover:text-white disabled:opacity-30 transition-colors text-base"
      >
        ›
      </button>
    </div>
  );
}
