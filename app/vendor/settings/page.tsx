'use client';
import { useEffect, useRef, useState } from 'react';
import { vendorApi } from '@/lib/vendorAuth';
import { useVendorAuth } from '@/lib/vendorAuth';
import { Loader2, CheckCircle, ExternalLink, Upload, ShieldCheck, ShieldAlert, Clock, FileText } from 'lucide-react';
import PhoneInput from '@/components/PhoneInput';
import CountrySelect from '@/components/CountrySelect';

const INPUT: React.CSSProperties = { width: '100%', padding: '9px 13px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#111827', fontSize: 13, outline: 'none' };
const CARD: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };

const VERIFICATION_STATUS: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  not_submitted: { label: 'Not Submitted', color: '#6b7280', bg: '#f3f4f6', icon: ShieldAlert },
  pending_review: { label: 'Under Review', color: '#d97706', bg: '#fef9c3', icon: Clock },
  verified:       { label: 'Verified',      color: '#059669', bg: '#d1fae5', icon: ShieldCheck },
  rejected:       { label: 'Rejected',      color: '#dc2626', bg: '#fee2e2', icon: ShieldAlert },
};

export default function VendorSettingsPage() {
  const { vendor, refresh } = useVendorAuth();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [stripeLoading, setStripeLoading] = useState(false);
  const [form, setForm] = useState({ ownerName: '', businessName: '', phone: '', description: '', website: '', businessType: 'individual', businessRegistrationNumber: '', taxId: '', address: { city: '', country: '', street: '', state: '', zipCode: '' } });
  const [profile, setProfile] = useState<any>(null);

  // Verification
  const [govIdUploading, setGovIdUploading] = useState(false);
  const [bizDocUploading, setBizDocUploading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');
  const govIdRef = useRef<HTMLInputElement>(null);
  const bizDocRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (vendor) {
      vendorApi.get('/vendor/profile').then(r => {
        const v = r.data.vendor;
        setProfile(v);
        setForm({
          ownerName: v.ownerName || '', businessName: v.businessName || '',
          phone: v.phone || '', description: v.description || '',
          website: v.website || '', businessType: v.businessType || 'individual',
          businessRegistrationNumber: v.businessRegistrationNumber || '',
          taxId: v.taxId || '',
          address: v.address || { city: '', country: '', street: '', state: '', zipCode: '' },
        });
      });
    }
  }, [vendor]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg('');
    try {
      await vendorApi.patch('/vendor/profile', form);
      setMsg('✓ Profile updated successfully');
      refresh?.();
    } catch (err: any) { setMsg(`✗ ${err.response?.data?.message || 'Failed'}`); }
    finally { setSaving(false); }
  };

  const handleStripeOnboard = async () => {
    setStripeLoading(true);
    try {
      const { data } = await vendorApi.post('/vendor/auth/stripe/onboard', {});
      window.location.href = data.url;
    } catch { alert('Failed to start Stripe onboarding'); }
    finally { setStripeLoading(false); }
  };

  const uploadDoc = async (file: File, docType: 'governmentId' | 'businessDocument') => {
    const setUploading = docType === 'governmentId' ? setGovIdUploading : setBizDocUploading;
    setUploading(true); setVerifyMsg('');
    try {
      const fd = new FormData();
      fd.append('document', file);
      fd.append('docType', docType);
      await vendorApi.post('/vendor/profile/verification/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const r = await vendorApi.get('/vendor/profile');
      setProfile(r.data.vendor);
      setVerifyMsg('✓ Document uploaded successfully');
    } catch (err: any) { setVerifyMsg(`✗ ${err.response?.data?.message || 'Upload failed'}`); }
    finally { setUploading(false); }
  };

  const submitVerification = async () => {
    setSubmitLoading(true); setVerifyMsg('');
    try {
      await vendorApi.post('/vendor/profile/verification/submit', {});
      const r = await vendorApi.get('/vendor/profile');
      setProfile(r.data.vendor);
      setVerifyMsg('✓ Submitted! Admin will review within 24-48 hours.');
    } catch (err: any) { setVerifyMsg(`✗ ${err.response?.data?.message || 'Failed'}`); }
    finally { setSubmitLoading(false); }
  };

  const inp = (label: string, key: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <input type={type} placeholder={placeholder} value={(form as any)[key] || ''}
        onChange={e => setForm({ ...form, [key]: e.target.value })} style={INPUT}
        onFocus={e => (e.target.style.borderColor = '#cf3232')}
        onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
    </div>
  );

  const vs = VERIFICATION_STATUS[profile?.verificationStatus || 'not_submitted'];
  const VsIcon = vs.icon;

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your store profile and payment settings</p>
      </div>

      {/* Profile */}
      <div style={CARD}>
        <p className="font-semibold text-gray-800 mb-4">Store Profile</p>
        {msg && <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ background: msg.startsWith('✓') ? '#d1fae5' : '#fee2e2', color: msg.startsWith('✓') ? '#065f46' : '#991b1b' }}>{msg}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {inp('Owner Name', 'ownerName', 'text', 'Your full name')}
            {inp('Business Name', 'businessName', 'text', 'Store name')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone</label>
            <PhoneInput value={form.phone} onChange={val => setForm({ ...form, phone: val })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Store Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3} placeholder="Tell buyers about your store..." style={{ ...INPUT, resize: 'none' } as any}
              onFocus={e => (e.target.style.borderColor = '#cf3232')}
              onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
          </div>
          {inp('Website', 'website', 'url', 'https://yourbusiness.com')}
          <div className="grid grid-cols-2 gap-3">
            {[['City', 'city'], ['State', 'state'], ['Zip Code', 'zipCode']].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                <input type="text" placeholder={label} value={(form.address as any)[key] || ''}
                  onChange={e => setForm({ ...form, address: { ...form.address, [key]: e.target.value } })}
                  style={INPUT}
                  onFocus={e => (e.target.style.borderColor = '#cf3232')}
                  onBlur={e => (e.target.style.borderColor = '#d1d5db')} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Country</label>
              <CountrySelect value={form.address.country} onChange={val => setForm({ ...form, address: { ...form.address, country: val } })} style={{ ...INPUT }} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 disabled:opacity-60" style={{ background: '#cf3232' }}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* ── Verification / KYB ── */}
      <div style={CARD}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-gray-800">Business Verification</p>
            <p className="text-xs text-gray-400 mt-0.5">Get a ✅ verified badge on your store</p>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: vs.bg, color: vs.color }}>
            <VsIcon className="w-3.5 h-3.5" /> {vs.label}
          </span>
        </div>

        {profile?.verificationNote && profile?.verificationStatus === 'rejected' && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
            <p className="font-bold mb-0.5">Rejection Reason:</p>
            <p>{profile.verificationNote}</p>
          </div>
        )}

        {verifyMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: verifyMsg.startsWith('✓') ? '#d1fae5' : '#fee2e2', color: verifyMsg.startsWith('✓') ? '#065f46' : '#991b1b' }}>
            {verifyMsg}
          </div>
        )}

        <div className="space-y-4">
          {/* Business info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Business Type</label>
              <select value={form.businessType} onChange={e => setForm({ ...form, businessType: e.target.value })} style={INPUT}>
                <option value="individual">Individual / Freelancer</option>
                <option value="sole_proprietor">Sole Proprietor</option>
                <option value="partnership">Partnership</option>
                <option value="llc">LLC / Private Limited</option>
                <option value="corporation">Corporation / Public Limited</option>
                <option value="ngo">NGO / Non-Profit</option>
                <option value="other">Other</option>
              </select>
            </div>
            {inp('Tax ID / VAT / GST', 'taxId', 'text', 'VAT, GST, TIN...')}
            {inp('Business Reg. Number', 'businessRegistrationNumber', 'text', 'Company reg. no...')}
          </div>

          {/* Document uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Government ID */}
            <div className="p-4 rounded-xl" style={{ border: '1.5px dashed #e5e7eb', background: '#fafafa' }}>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-bold text-gray-700">Government ID <span className="text-red-500">*</span></p>
              </div>
              <p className="text-xs text-gray-400 mb-3">Passport, Driver's License, National ID</p>
              {profile?.governmentIdUrl ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs text-green-700 font-semibold">Uploaded</span>
                  <button onClick={() => govIdRef.current?.click()} className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline">Replace</button>
                </div>
              ) : (
                <button onClick={() => govIdRef.current?.click()} disabled={govIdUploading}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition"
                  style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                  {govIdUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {govIdUploading ? 'Uploading...' : 'Upload File'}
                </button>
              )}
              <input ref={govIdRef} type="file" accept="image/*,.pdf" className="hidden"
                onChange={e => e.target.files?.[0] && uploadDoc(e.target.files[0], 'governmentId')} />
            </div>

            {/* Business Document */}
            <div className="p-4 rounded-xl" style={{ border: '1.5px dashed #e5e7eb', background: '#fafafa' }}>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-bold text-gray-700">Business Document <span className="text-gray-400">(optional)</span></p>
              </div>
              <p className="text-xs text-gray-400 mb-3">Registration cert, Tax cert, Trade license</p>
              {profile?.businessDocumentUrl ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs text-green-700 font-semibold">Uploaded</span>
                  <button onClick={() => bizDocRef.current?.click()} className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline">Replace</button>
                </div>
              ) : (
                <button onClick={() => bizDocRef.current?.click()} disabled={bizDocUploading}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition"
                  style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                  {bizDocUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {bizDocUploading ? 'Uploading...' : 'Upload File'}
                </button>
              )}
              <input ref={bizDocRef} type="file" accept="image/*,.pdf" className="hidden"
                onChange={e => e.target.files?.[0] && uploadDoc(e.target.files[0], 'businessDocument')} />
            </div>
          </div>

          {/* Submit button */}
          {['not_submitted', 'rejected'].includes(profile?.verificationStatus || 'not_submitted') && (
            <button onClick={submitVerification} disabled={submitLoading || !profile?.governmentIdUrl}
              className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #cf3232, #b82a2a)' }}>
              {submitLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><ShieldCheck className="w-4 h-4" /> Submit for Verification</>}
            </button>
          )}
          {profile?.verificationStatus === 'pending_review' && (
            <div className="text-center py-3 text-sm text-yellow-700 font-semibold">
              ⏳ Documents under review — typically 24-48 hours
            </div>
          )}
          {profile?.verificationStatus === 'verified' && (
            <div className="text-center py-3 text-sm text-green-700 font-semibold">
              ✅ Your business is verified! Verified badge is shown on your store.
            </div>
          )}
        </div>
      </div>

      {/* Stripe */}
      <div style={CARD}>
        <p className="font-semibold text-gray-800 mb-1">Payment Settings</p>
        <p className="text-xs text-gray-400 mb-4">Connect your bank account to receive payouts</p>
        {vendor?.stripeOnboardingComplete ? (
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: '#d1fae5', border: '1px solid #a7f3d0' }}>
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-green-800">Stripe Connected</p>
              <p className="text-xs text-green-700 mt-0.5">Your bank account is connected and ready to receive payments.</p>
            </div>
            <button onClick={handleStripeOnboard} disabled={stripeLoading}
              className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:underline">
              <ExternalLink className="w-3.5 h-3.5" /> Manage
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-xl" style={{ background: '#fef9c3', border: '1px solid #fde68a' }}>
              <p className="text-sm font-semibold text-yellow-800">Stripe Not Connected</p>
              <p className="text-xs text-yellow-700 mt-1">You need to complete Stripe onboarding to receive payments from orders.</p>
            </div>
            <button onClick={handleStripeOnboard} disabled={stripeLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: '#2563eb' }}>
              {stripeLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Connect Stripe Account →
            </button>
          </div>
        )}
      </div>

      {/* Store URL */}
      <div style={CARD}>
        <p className="font-semibold text-gray-800 mb-3">Store URL</p>
        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#FAEFEF', border: '1px solid #e5e7eb' }}>
          <span className="text-sm text-gray-400">bazaar.com/store/</span>
          <span className="text-sm font-bold text-gray-800">{vendor?.slug}</span>
          <a href={`/store/${vendor?.slug}`} target="_blank" className="ml-auto text-gray-400 hover:text-gray-600">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}


