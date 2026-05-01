'use client';
import { RefreshCw } from 'lucide-react';

export const PERIODS = [
  { label: '7D',  value: 7  },
  { label: '15D', value: 15 },
  { label: '30D', value: 30 },
  { label: '60D', value: 60 },
  { label: '90D', value: 90 },
];

interface Props {
  days: number;
  onChange: (d: number) => void;
  onRefresh?: () => void;
  extra?: React.ReactNode;
}

export default function PeriodFilter({ days, onChange, onRefresh, extra }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex gap-0.5 p-1 rounded-xl" style={{ background: '#FAEFEF', border: '1.5px solid #e5e7eb' }}>
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: days === p.value ? '#cf3232' : 'transparent',
              color: days === p.value ? '#fff' : '#6b7280',
              minWidth: 36,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="p-2 rounded-xl transition hover:bg-[#FAEFEF]"
          style={{ border: '1.5px solid #e5e7eb', background: '#fff' }}
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" style={{ color: '#cf3232' }} />
        </button>
      )}
      {extra}
    </div>
  );
}
