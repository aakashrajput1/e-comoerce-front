'use client';
import { useEffect, useState } from 'react';
import { vendorApi } from '@/lib/vendorAuth';
import { formatDate } from '@/lib/utils';
import { MessageCircle, CheckCircle, Clock, Trash2, Send, Loader2, RefreshCw } from 'lucide-react';

export default function VendorQAPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'answered'>('unanswered');
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchQA = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter === 'answered')   params.answered = 'true';
      if (filter === 'unanswered') params.answered = 'false';
      const { data } = await vendorApi.get('/vendor/qa', { params });
      setQuestions(data.questions || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchQA(); }, [filter]);

  const submitAnswer = async (qaId: string) => {
    const answer = answerMap[qaId]?.trim();
    if (!answer) return;
    setSavingId(qaId);
    try {
      await vendorApi.patch(`/vendor/qa/${qaId}/answer`, { answer });
      setAnswerMap(m => ({ ...m, [qaId]: '' }));
      fetchQA();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    finally { setSavingId(null); }
  };

  const deleteQ = async (qaId: string) => {
    if (!confirm('Remove this question?')) return;
    await vendorApi.delete(`/vendor/qa/${qaId}`);
    fetchQA();
  };

  const unansweredCount = questions.filter(q => !q.answer).length;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Customer Questions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Answer questions from buyers about your products</p>
        </div>
        <button onClick={fetchQA} className="p-2 rounded-xl" style={{ border: '1.5px solid #e5e7eb', background: '#fff' }}>
          <RefreshCw className="w-4 h-4" style={{ color: '#cf3232' }} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#FAEFEF', border: '1.5px solid #e5e7eb' }}>
        {(['unanswered', 'answered', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition capitalize"
            style={{ background: filter === f ? '#cf3232' : 'transparent', color: filter === f ? '#fff' : '#6b7280' }}>
            {f === 'unanswered' ? `Unanswered${unansweredCount > 0 && filter !== 'unanswered' ? ` (${unansweredCount})` : ''}` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#cf3232' }} />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl" style={{ border: '1px solid #e5e7eb' }}>
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="font-bold text-gray-600">No questions yet</p>
          <p className="text-sm text-gray-400 mt-1">Questions from buyers will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => (
            <div key={q._id} className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
              {/* Question header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ background: '#cf3232' }}>
                      {(q.askedBy?.firstName?.[0] || q.guestName?.[0] || 'G').toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-800">
                          {q.askedBy ? `${q.askedBy.firstName} ${q.askedBy.lastName}` : (q.guestName || 'Anonymous')}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(q.createdAt)}</span>
                        {!q.answer && (
                          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef9c3', color: '#854d0e' }}>
                            <Clock className="w-3 h-3" /> Awaiting reply
                          </span>
                        )}
                        {q.answer && (
                          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#d1fae5', color: '#065f46' }}>
                            <CheckCircle className="w-3 h-3" /> Answered
                          </span>
                        )}
                      </div>
                      {/* Product ref */}
                      {q.product && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Re: <span className="font-semibold text-gray-600">{q.product.name}</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-800 mt-2 font-medium">"{q.question}"</p>
                    </div>
                  </div>
                  <button onClick={() => deleteQ(q._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-300 flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Existing answer */}
                {q.answer && (
                  <div className="mt-3 ml-11 p-3 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <p className="text-xs font-bold text-green-700 mb-1">Your Answer · {formatDate(q.answeredAt)}</p>
                    <p className="text-sm text-green-800">{q.answer}</p>
                    <button onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}
                      className="text-xs font-semibold mt-2" style={{ color: '#059669' }}>
                      Edit answer
                    </button>
                  </div>
                )}
              </div>

              {/* Answer input */}
              {(!q.answer || expandedId === q._id) && (
                <div className="px-4 pb-4 ml-11">
                  <div className="flex gap-2">
                    <textarea
                      value={answerMap[q._id] || ''}
                      onChange={e => setAnswerMap(m => ({ ...m, [q._id]: e.target.value }))}
                      placeholder="Write your answer..."
                      rows={2}
                      className="flex-1 border rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                      style={{ borderColor: '#e5e7eb', color: '#111827' }}
                      onFocus={e => (e.target.style.borderColor = '#cf3232')}
                      onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                    />
                    <button
                      onClick={() => submitAnswer(q._id)}
                      disabled={savingId === q._id || !answerMap[q._id]?.trim()}
                      className="px-4 py-2 rounded-xl font-bold text-sm text-white flex items-center gap-1.5 self-end disabled:opacity-50"
                      style={{ background: '#cf3232' }}>
                      {savingId === q._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {q.answer ? 'Update' : 'Reply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
