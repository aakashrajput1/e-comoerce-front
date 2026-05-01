'use client';
import { useEffect, useState } from 'react';
import { vendorApi } from '@/lib/vendorAuth';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Wallet, ArrowDownToLine, Clock, Loader2 } from 'lucide-react';
import PeriodFilter from '@/components/vendor/PeriodFilter';

export default function VendorWalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [msg, setMsg] = useState('');
  const [txDays, setTxDays] = useState(30);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [wRes, tRes, pRes] = await Promise.all([
        vendorApi.get('/vendor/wallet'),
        vendorApi.get(`/vendor/wallet/transactions?days=${txDays}`),
        vendorApi.get('/vendor/wallet/pending-orders'),
      ]);
      setWallet(wRes.data.wallet);
      setTransactions(tRes.data.transactions || []);
      setPendingOrders(pRes.data.orders || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [txDays]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 1) return;
    setWithdrawing(true); setMsg('');
    try {
      await vendorApi.post('/vendor/wallet/withdraw', { amount: parseFloat(withdrawAmount) });
      setMsg('✓ Withdrawal initiated successfully!');
      setWithdrawAmount('');
      fetchAll();
    } catch (err: any) {
      setMsg(`✗ ${err.response?.data?.message || 'Withdrawal failed'}`);
    } finally { setWithdrawing(false); }
  };

  const CARD: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your earnings and withdrawals</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-gray-300" /></div>
      ) : (
        <>
          {/* Balance cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Available', value: formatCurrency(wallet?.availableBalance || 0), color: '#059669', sub: 'Ready to withdraw' },
              { label: 'Pending', value: formatCurrency(wallet?.pendingBalance || 0), color: '#d97706', sub: 'Return window active' },
              { label: 'Withdrawn', value: formatCurrency(wallet?.withdrawnBalance || 0), color: '#6b7280', sub: 'All time' },
              { label: 'Total Earned', value: formatCurrency(wallet?.totalEarned || 0), color: '#cf3232', sub: 'Lifetime' },
            ].map(({ label, value, color, sub }) => (
              <div key={label} style={CARD}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-black mt-1" style={{ color }}>{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Withdraw */}
          <div style={CARD}>
            <div className="flex items-center gap-2 mb-4">
              <ArrowDownToLine className="w-4 h-4 text-gray-400" />
              <p className="font-semibold text-gray-800">Withdraw Funds</p>
            </div>
            <p className="text-xs text-gray-500 mb-3">Available balance: <strong>{formatCurrency(wallet?.availableBalance || 0)}</strong></p>
            <div className="flex gap-3 max-w-sm">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" min="1" step="0.01" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="0.00" className="w-full pl-7 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid #d1d5db' }}
                  onFocus={e => (e.target.style.borderColor = '#cf3232')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
              </div>
              <button onClick={handleWithdraw} disabled={withdrawing || !withdrawAmount}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 disabled:opacity-50"
                style={{ background: '#cf3232' }}>
                {withdrawing && <Loader2 className="w-4 h-4 animate-spin" />}
                Withdraw
              </button>
            </div>
            {msg && <p className="text-sm mt-2 font-medium" style={{ color: msg.startsWith('✓') ? '#059669' : '#dc2626' }}>{msg}</p>}
          </div>

          {/* Pending orders (return window) */}
          {pendingOrders.length > 0 && (
            <div style={CARD}>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-orange-400" />
                <p className="font-semibold text-gray-800">Funds in Return Window ({pendingOrders.length})</p>
              </div>
              <div className="space-y-2">
                {pendingOrders.map(o => (
                  <div key={o._id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Order #{o._id?.slice(-8)}</p>
                      <p className="text-xs text-orange-600 mt-0.5">{o.timeRemainingHours}h remaining in return window</p>
                    </div>
                    <p className="font-black text-gray-800">{formatCurrency(o.vendorAmount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction history */}
          <div style={CARD}>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <p className="font-semibold text-gray-800">Transaction History</p>
              <PeriodFilter days={txDays} onChange={setTxDays} onRefresh={fetchAll} />
            </div>
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.map(t => (
                  <div key={t._id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#FAEFEF' }}>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 capitalize">{t.type?.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>
                      <p className="text-xs text-gray-400">{formatDate(t.createdAt)}</p>
                    </div>
                    <p className="font-black" style={{ color: t.type === 'withdrawal' || t.type === 'refund_deduction' ? '#dc2626' : '#059669' }}>
                      {t.type === 'withdrawal' || t.type === 'refund_deduction' ? '-' : '+'}{formatCurrency(t.amount / 100)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
