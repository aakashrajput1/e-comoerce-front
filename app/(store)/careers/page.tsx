import Link from 'next/link';
import { Briefcase, MapPin, Clock, ChevronRight } from 'lucide-react';

export const dynamic = 'force-static';

const JOBS = [
  { title: 'Senior Frontend Engineer', dept: 'Engineering', location: 'New York, NY', type: 'Full-time' },
  { title: 'Product Manager — Marketplace', dept: 'Product', location: 'Remote', type: 'Full-time' },
  { title: 'Data Scientist', dept: 'Data & Analytics', location: 'New York, NY', type: 'Full-time' },
  { title: 'UX Designer', dept: 'Design', location: 'Remote', type: 'Full-time' },
  { title: 'Backend Engineer (Node.js)', dept: 'Engineering', location: 'New York, NY', type: 'Full-time' },
  { title: 'Seller Success Manager', dept: 'Operations', location: 'Chicago, IL', type: 'Full-time' },
  { title: 'Marketing Manager', dept: 'Marketing', location: 'Remote', type: 'Full-time' },
  { title: 'Customer Support Lead', dept: 'Support', location: 'Remote', type: 'Full-time' },
];

const PERKS = [
  { emoji: '🏥', title: 'Health Insurance', desc: 'Full medical, dental & vision coverage for you and your family' },
  { emoji: '🏖️', title: 'Unlimited PTO', desc: 'Take the time you need to recharge and come back refreshed' },
  { emoji: '💻', title: 'Remote Friendly', desc: 'Work from anywhere — we trust you to get things done' },
  { emoji: '📈', title: 'Equity Package', desc: 'Own a piece of what you\'re building with competitive stock options' },
  { emoji: '🎓', title: 'Learning Budget', desc: '$2,000/year for courses, conferences, and books' },
  { emoji: '🍔', title: 'Free Meals', desc: 'Daily catered lunch and fully stocked kitchen at HQ' },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FAEFEF' }}>
      <div style={{ background: 'linear-gradient(135deg, #cf3232 0%, #b82a2a 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Briefcase className="w-14 h-14 text-white/80 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-white mb-3">Careers at Bazaar</h1>
          <p className="text-white/70 text-base max-w-xl mx-auto">Build the future of commerce. Join a team that's passionate about making shopping better for everyone.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        {/* Perks */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-6">Why Bazaar?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PERKS.map(({ emoji, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                <span className="text-3xl">{emoji}</span>
                <p className="font-black text-gray-900 mt-3 mb-1">{title}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Open roles */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-6">Open Positions</h2>
          <div className="space-y-3">
            {JOBS.map(job => (
              <div key={job.title} className="bg-white rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow" style={{ border: '1px solid #e5e7eb' }}>
                <div>
                  <p className="font-black text-gray-900">{job.title}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FAEFEF', color: '#cf3232' }}>{job.dept}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin className="w-3 h-3" />{job.location}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{job.type}</span>
                  </div>
                </div>
                <Link href="/contact" className="flex items-center gap-1 text-sm font-bold flex-shrink-0" style={{ color: '#cf3232' }}>
                  Apply <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 text-center shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
          <p className="font-black text-gray-900 text-lg mb-2">Don't see your role?</p>
          <p className="text-sm text-gray-500 mb-5">Send us your resume and we'll reach out when something fits.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white" style={{ background: '#cf3232' }}>
            Send Open Application
          </Link>
        </div>
      </div>
    </div>
  );
}
