'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, CheckCircle, Send, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setError('');
    try {
      await api.post('/contact', form);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send. Please try again.');
    } finally { setSending(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <MessageCircle className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white mb-2">Contact Us</h1>
          <p className="text-white/70 text-sm">We're here to help. Reach out and we'll get back to you shortly.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info */}
          <div className="space-y-4">
            {[
              { icon: Mail, title: 'Email', value: 'support@bazaar.com', sub: 'We reply within 24 hours' },
              { icon: Phone, title: 'Phone', value: '+1 (800) BAZAAR-1', sub: 'Mon–Fri, 9am–6pm EST' },
              { icon: MapPin, title: 'Address', value: 'New York, NY 10001', sub: 'United States' },
              { icon: Clock, title: 'Support Hours', value: 'Mon–Fri 9am–6pm', sub: 'Eastern Standard Time' },
            ].map(({ icon: Icon, title, value, sub }) => (
              <div key={title} className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FAEFEF' }}>
                  <Icon className="w-4 h-4" style={{ color: '#cf3232' }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#d1fae5' }}>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-sm text-gray-500">Thanks for reaching out. We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <h2 className="font-black text-gray-900 text-lg mb-5">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Your Name', key: 'name', type: 'text', placeholder: 'John Doe' },
                      { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com' },
                    ].map(({ label, key, type, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">{label}</label>
                        <input type={type} required placeholder={placeholder}
                          value={(form as any)[key]}
                          onChange={e => setForm({ ...form, [key]: e.target.value })}
                          className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
                          style={{ borderColor: '#e5e7eb' }}
                          onFocus={e => (e.target.style.borderColor = '#cf3232')}
                          onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Subject</label>
                    <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required
                      className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
                      style={{ borderColor: '#e5e7eb', background: '#fff', color: form.subject ? '#111827' : '#9ca3af' }}>
                      <option value="">Select a topic...</option>
                      <option>Order Issue</option>
                      <option>Return / Refund</option>
                      <option>Payment Problem</option>
                      <option>Seller Support</option>
                      <option>Account Help</option>
                      <option>Report a Problem</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Message</label>
                    <textarea required rows={5} placeholder="Describe your issue in detail..."
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                      style={{ borderColor: '#e5e7eb' }}
                      onFocus={e => (e.target.style.borderColor = '#cf3232')}
                      onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                  </div>
                  <button type="submit" disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-60"
                    style={{ background: '#cf3232' }}>
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                  {error && <p className="text-sm text-red-600 font-medium text-center">{error}</p>}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
