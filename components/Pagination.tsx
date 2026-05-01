'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  pages: number;
  total?: number;
  onChange: (p: number) => void;
}

export default function Pagination({ page, pages, total, onChange }: Props) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <span className="text-gray-500 text-xs">{total != null ? `${total} total records` : ''}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-[#FAEFEF] disabled:opacity-40 transition">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {[...Array(Math.min(pages, 7))].map((_, i) => {
          const p = i + 1;
          return (
            <button key={p} onClick={() => onChange(p)}
              className="w-8 h-8 rounded-lg text-xs font-semibold transition"
              style={p === page
                ? { background: '#cf3232', color: '#fff', border: 'none' }
                : { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' }}>
              {p}
            </button>
          );
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === pages}
          className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-[#FAEFEF] disabled:opacity-40 transition">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
