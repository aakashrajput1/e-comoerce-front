import Link from 'next/link';
import { Building2, FileText, Users, Shield } from 'lucide-react';

export const dynamic = 'force-static';

export default function CorporatePage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Building2 className="w-14 h-14 text-white/80 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-white mb-3">Corporate Information</h1>
          <p className="text-white/70 text-base">Legal and corporate details about Bazaar Internet Private Limited.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        {[
          {
            icon: Building2, title: 'Company Details', color: '#2563eb',
            rows: [
              ['Legal Name', 'Bazaar Internet Private Limited'],
              ['CIN', 'U51109NY2012PTC066107'],
              ['Incorporated', 'January 15, 2012'],
              ['Type', 'Private Limited Company'],
              ['Industry', 'E-Commerce / Retail Technology'],
            ],
          },
          {
            icon: FileText, title: 'Registered Office', color: '#059669',
            rows: [
              ['Address', 'Buildings Alyssa, Begonia & Clove Embassy Tech Village'],
              ['City', 'New York'],
              ['State', 'New York'],
              ['ZIP', '10001'],
              ['Country', 'United States'],
              ['Phone', '+1-800-829-2291'],
              ['Email', 'corporate@bazaar.com'],
            ],
          },
          {
            icon: Users, title: 'Board of Directors', color: '#7c3aed',
            rows: [
              ['CEO & Co-Founder', 'Sachin Bansal'],
              ['CTO & Co-Founder', 'Binny Bansal'],
              ['CFO', 'Sreenivas Murthy'],
              ['Independent Director', 'Ravi Venkatesan'],
            ],
          },
          {
            icon: Shield, title: 'Compliance', color: '#cf3232',
            rows: [
              ['GST Number', '29AABCF1234A1Z5'],
              ['PAN', 'AABCF1234A'],
              ['DPIIT Recognized', 'Yes — Startup India'],
              ['ISO Certified', 'ISO 27001:2013 (Information Security)'],
            ],
          },
        ].map(({ icon: Icon, title, color, rows }) => (
          <div key={title} className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h2 className="font-black text-gray-900 text-lg">{title}</h2>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {rows.map(([key, val]) => (
                  <tr key={key} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td className="py-2.5 pr-6 text-gray-400 font-medium w-48">{key}</td>
                    <td className="py-2.5 text-gray-800 font-semibold">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
