const statusMap: Record<string, { bg: string; color: string }> = {
  active:           { bg: '#d1fae5', color: '#065f46' },
  approved:         { bg: '#d1fae5', color: '#065f46' },
  completed:        { bg: '#d1fae5', color: '#065f46' },
  paid:             { bg: '#d1fae5', color: '#065f46' },
  pending:          { bg: '#fef9c3', color: '#854d0e' },
  pending_payment:  { bg: '#fef9c3', color: '#854d0e' },
  processing:       { bg: '#dbeafe', color: '#1e40af' },
  shipped:          { bg: '#ede9fe', color: '#5b21b6' },
  delivered:        { bg: '#cffafe', color: '#155e75' },
  suspended:        { bg: '#fee2e2', color: '#991b1b' },
  rejected:         { bg: '#fee2e2', color: '#991b1b' },
  cancelled:        { bg: '#fee2e2', color: '#991b1b' },
  refunded:         { bg: '#fee2e2', color: '#991b1b' },
  return_requested: { bg: '#ffedd5', color: '#9a3412' },
  return_approved:  { bg: '#d1fae5', color: '#065f46' },
  draft:            { bg: '#f3f4f6', color: '#4b5563' },
  archived:         { bg: '#f3f4f6', color: '#4b5563' },
  failed:           { bg: '#fee2e2', color: '#991b1b' },
};

export default function Badge({ status, label }: { status?: string; label?: string }) {
  const key = status || '';
  const text = label || key.replace(/_/g, ' ');
  const s = statusMap[key] || { bg: '#f3f4f6', color: '#4b5563' };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: s.bg, color: s.color }}>
      {text}
    </span>
  );
}
