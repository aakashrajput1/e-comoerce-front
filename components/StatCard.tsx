import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'red' | 'blue' | 'green' | 'orange' | 'purple' | 'cyan' | 'yellow' | 'pink';
  trend?: { value: number; label: string };
  subtitle?: string;
}

const colorMap: Record<string, { iconBg: string; iconColor: string }> = {
  red:    { iconBg: '#fee2e2', iconColor: '#dc2626' },
  pink:   { iconBg: '#ffe4e6', iconColor: '#cf3232' },
  blue:   { iconBg: '#dbeafe', iconColor: '#2563eb' },
  green:  { iconBg: '#d1fae5', iconColor: '#059669' },
  orange: { iconBg: '#ffedd5', iconColor: '#ea580c' },
  purple: { iconBg: '#ede9fe', iconColor: '#7c3aed' },
  cyan:   { iconBg: '#cffafe', iconColor: '#0891b2' },
  yellow: { iconBg: '#fef9c3', iconColor: '#ca8a04' },
};

export default function StatCard({ title, value, icon: Icon, color, trend, subtitle }: Props) {
  const c = colorMap[color] ?? colorMap.blue;
  return (
    <div className="bg-white rounded-xl p-5 transition-shadow hover:shadow-md"
      style={{ border: '1px solid #e5e7eb' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: trend.value >= 0 ? '#d1fae5' : '#fee2e2',
                  color: trend.value >= 0 ? '#065f46' : '#991b1b',
                }}>
                {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(trend.value)}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.iconBg }}>
          <Icon className="w-5 h-5" style={{ color: c.iconColor }} />
        </div>
      </div>
    </div>
  );
}
