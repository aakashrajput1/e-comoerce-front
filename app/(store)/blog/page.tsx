import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';

const POSTS = [
  { slug: '10-must-have-gadgets-2026', title: '10 Must-Have Gadgets in 2026', category: 'Electronics', time: '5 min read', emoji: '💻', date: 'Apr 5, 2026', excerpt: 'From wireless earbuds to smart home devices, here are the top gadgets you need this year.' },
  { slug: 'style-home-on-budget', title: 'How to Style Your Home on a Budget', category: 'Home & Living', time: '4 min read', emoji: '🏠', date: 'Apr 3, 2026', excerpt: 'Transform your living space without breaking the bank with these smart shopping tips.' },
  { slug: 'skincare-routine-summer', title: 'Best Skincare Routine for Summer', category: 'Beauty', time: '3 min read', emoji: '💄', date: 'Apr 1, 2026', excerpt: 'Keep your skin glowing all summer with these dermatologist-approved products.' },
  { slug: 'top-running-shoes-reviewed', title: 'Top Running Shoes Reviewed', category: 'Sports', time: '6 min read', emoji: '👟', date: 'Mar 28, 2026', excerpt: 'We tested 20 pairs so you don\'t have to. Here are the best running shoes for every budget.' },
  { slug: 'best-books-2026', title: 'Best Books to Read in 2026', category: 'Books', time: '4 min read', emoji: '📚', date: 'Mar 25, 2026', excerpt: 'From self-help to fiction, these are the must-reads of the year according to our editors.' },
  { slug: 'pet-care-essentials', title: 'Pet Care Essentials Every Owner Needs', category: 'Pets', time: '3 min read', emoji: '🐾', date: 'Mar 22, 2026', excerpt: 'Keep your furry friends happy and healthy with these top-rated pet care products.' },
  { slug: 'kitchen-gadgets-2026', title: 'Kitchen Gadgets That Will Change Your Life', category: 'Home & Living', time: '5 min read', emoji: '🍳', date: 'Mar 20, 2026', excerpt: 'Upgrade your cooking game with these innovative kitchen tools and appliances.' },
  { slug: 'fashion-trends-spring', title: 'Spring Fashion Trends 2026', category: 'Fashion', time: '4 min read', emoji: '👗', date: 'Mar 18, 2026', excerpt: 'The hottest styles and colors dominating fashion this spring season.' },
];

const catColors: Record<string, { bg: string; color: string }> = {
  'Electronics': { bg: '#dbeafe', color: '#1e40af' },
  'Home & Living': { bg: '#d1fae5', color: '#065f46' },
  'Beauty': { bg: '#fce7f0', color: '#cf3232' },
  'Sports': { bg: '#ffedd5', color: '#9a3412' },
  'Books': { bg: '#ede9fe', color: '#5b21b6' },
  'Pets': { bg: '#fef9c3', color: '#854d0e' },
  'Fashion': { bg: '#fce7f0', color: '#cf3232' },
};

export default function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">Stories & Guides</span>
      </div>

      <h1 className="text-2xl font-black text-gray-900 mb-2">Stories & Guides</h1>
      <p className="text-sm text-gray-500 mb-8">Tips, trends and product guides from our editors</p>

      {/* Featured */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {POSTS.slice(0, 2).map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`}
            className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all"
            style={{ border: '1px solid #e5e7eb' }}>
            <div className="h-48 flex items-center justify-center text-8xl"
              style={{ background: 'linear-gradient(135deg, #FAEFEF, #f5d5d5)' }}>
              {post.emoji}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={catColors[post.category] || { bg: '#f3f4f6', color: '#374151' }}>
                  {post.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{post.time}</span>
              </div>
              <h2 className="font-black text-gray-900 text-lg group-hover:text-rose-700 transition-colors">{post.title}</h2>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
              <p className="text-xs text-gray-400 mt-3">{post.date}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Rest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {POSTS.slice(2).map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`}
            className="group bg-white rounded-xl overflow-hidden hover:shadow-md transition-all"
            style={{ border: '1px solid #e5e7eb' }}>
            <div className="h-32 flex items-center justify-center text-6xl"
              style={{ background: 'linear-gradient(135deg, #FAEFEF, #f5d5d5)' }}>
              {post.emoji}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={catColors[post.category] || { bg: '#f3f4f6', color: '#374151' }}>
                  {post.category}
                </span>
                <span className="text-xs text-gray-400">{post.time}</span>
              </div>
              <h3 className="font-bold text-gray-800 text-sm group-hover:text-rose-700 transition-colors line-clamp-2">{post.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
