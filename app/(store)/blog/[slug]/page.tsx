import Link from 'next/link';
import { ChevronRight, Clock, ArrowLeft } from 'lucide-react';

const POSTS: Record<string, any> = {
  '10-must-have-gadgets-2026': {
    title: '10 Must-Have Gadgets in 2026', category: 'Electronics', time: '5 min read', emoji: '💻', date: 'Apr 5, 2026',
    content: `Technology moves fast, and 2026 is no exception. Whether you're a tech enthusiast or just looking to upgrade your daily life, these gadgets are worth every penny.\n\n**1. Wireless Earbuds with ANC**\nActive noise cancellation has become standard, but the latest models offer 40+ hours of battery life and crystal-clear audio.\n\n**2. Smart Watch with Health Monitoring**\nTrack your heart rate, sleep, blood oxygen, and even stress levels — all from your wrist.\n\n**3. Portable Power Bank (20,000mAh)**\nNever run out of battery again. The latest slim designs fit in your pocket.\n\n**4. USB-C Hub 7-in-1**\nOne hub to rule them all — HDMI, USB-A, SD card, and more.\n\n**5. Smart Home Speaker**\nControl your entire home with your voice.\n\n**6. Mechanical Keyboard**\nFor the productivity enthusiasts — tactile feedback makes typing a joy.\n\n**7. Webcam 4K**\nWork from home in style with crystal-clear video calls.\n\n**8. Laptop Stand**\nErgonomics matter. A good stand can save your neck and back.\n\n**9. Smart Plug**\nAutomate any appliance in your home.\n\n**10. LED Desk Lamp with USB Charging**\nIlluminate your workspace and charge your devices simultaneously.`,
  },
  'style-home-on-budget': {
    title: 'How to Style Your Home on a Budget', category: 'Home & Living', time: '4 min read', emoji: '🏠', date: 'Apr 3, 2026',
    content: `You don't need to spend a fortune to have a beautiful home. Here are our top tips for stylish decorating on a budget.\n\n**Start with a Color Palette**\nChoose 2-3 colors and stick to them throughout your space. This creates cohesion without spending much.\n\n**Invest in Key Pieces**\nSpend more on items you use daily — a good sofa, quality bedding. Save on decorative items.\n\n**Shop Second-Hand**\nThrift stores and online marketplaces are goldmines for unique, affordable pieces.\n\n**DIY Where Possible**\nA fresh coat of paint can transform any room. Reupholstering old furniture is easier than you think.\n\n**Use Plants**\nNothing adds life to a space like greenery. Plants are affordable and improve air quality too.`,
  },
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];

  if (!post) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">📰</p>
      <p className="text-lg font-bold text-gray-700">Post not found</p>
      <Link href="/blog" className="mt-4 inline-block text-sm font-semibold hover:underline" style={{ color: '#cf3232' }}>← Back to Blog</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/blog" className="hover:text-gray-600">Blog</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 truncate max-w-xs">{post.title}</span>
      </div>

      <Link href="/blog" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Stories
      </Link>

      <div className="h-56 rounded-2xl flex items-center justify-center text-9xl mb-6"
        style={{ background: 'linear-gradient(135deg, #FAEFEF, #f5d5d5)' }}>
        {post.emoji}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#FAEFEF', color: '#cf3232' }}>{post.category}</span>
        <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{post.time}</span>
        <span className="text-xs text-gray-400">{post.date}</span>
      </div>

      <h1 className="text-3xl font-black text-gray-900 mb-6">{post.title}</h1>

      <div className="prose prose-sm max-w-none">
        {post.content.split('\n\n').map((para: string, i: number) => {
          if (para.startsWith('**') && para.endsWith('**')) {
            return <h3 key={i} className="font-bold text-gray-900 text-base mt-5 mb-2">{para.replace(/\*\*/g, '')}</h3>;
          }
          if (para.includes('**')) {
            const parts = para.split(/\*\*(.*?)\*\*/g);
            return <p key={i} className="text-sm text-gray-600 leading-relaxed mb-3">{parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-gray-800">{p}</strong> : p)}</p>;
          }
          return <p key={i} className="text-sm text-gray-600 leading-relaxed mb-3">{para}</p>;
        })}
      </div>
    </div>
  );
}
