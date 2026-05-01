'use client';
import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T extends { _id?: string; id?: string }>({
  columns, data, loading, emptyMessage = 'No data found', onRowClick,
}: Props<T>) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 px-5 py-4 animate-pulse" style={{ borderBottom: '1px solid #f3f4f6' }}>
            {columns.map((c) => (
              <div key={c.key} className="h-4 rounded flex-1 bg-gray-100" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#FAEFEF' }}>
              {columns.map((col) => (
                <th key={col.key}
                  className={`px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide ${col.className || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : data.map((row, i) => (
              <tr key={row._id || row.id || i}
                onClick={() => onRowClick?.(row)}
                className="transition-colors hover:bg-[#FAEFEF]"
                style={{ borderBottom: '1px solid #f3f4f6', cursor: onRowClick ? 'pointer' : 'default' }}>
                {columns.map((col) => (
                  <td key={col.key} className={`px-5 py-3.5 text-gray-700 ${col.className || ''}`}>
                    {col.render ? col.render(row) : String((row as any)[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
