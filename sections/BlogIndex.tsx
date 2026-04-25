import React from 'react';
import { BLOG_POSTS } from '../data/blogPosts';

function getReadingTime(content: string): number {
  const words = content.replace(/[#*\[\]()>`]/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function getExcerpt(content: string, maxLen = 150): string {
  const plain = content
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#') && !line.startsWith('|') && !line.startsWith('---'))
    .map(line => line.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/^[*-] /, '').trim())
    .find(line => line.length > 40) || '';
  return plain.length > maxLen ? plain.slice(0, maxLen).trimEnd() + '…' : plain;
}

interface BlogIndexProps {
  isDark: boolean;
  onNavigate: (path: string) => void;
}

const BlogIndex: React.FC<BlogIndexProps> = ({ isDark, onNavigate }) => {
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-black';
  const mutedText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const panelBorder = isDark ? 'border-zinc-800' : 'border-zinc-200';
  const panelBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
  const hoverBg = isDark ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100';

  return (
    <div className={`${bgColor} ${textColor} font-['Helvetica'] p-4 sm:p-8 max-w-4xl mx-auto`}>

      <header className="mb-12 sm:mb-16">
        <div className={`flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] ${mutedText} mb-6`}>
          <div className="w-10 sm:w-20 h-px bg-current"></div>Blog
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
          Time Zones, Explained.
        </h1>
        <p className={`mt-6 text-base sm:text-lg leading-relaxed ${mutedText} max-w-2xl`}>
          Guides, explainers, and deep dives on time zones, scheduling, and global productivity.
        </p>
      </header>

      <div className="space-y-4">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            onClick={(e) => { e.preventDefault(); onNavigate(`/blog/${post.slug}`); }}
            className={`border ${panelBorder} rounded-[1.5rem] sm:rounded-[2rem] ${panelBg} ${hoverBg} p-6 sm:p-8 cursor-pointer transition-colors group`}
          >
            <div className={`text-[11px] font-semibold ${mutedText} mb-3`}>
              {post.date} &nbsp;·&nbsp; {post.author}
            </div>
            <h2 className="text-lg sm:text-xl font-bold leading-snug tracking-tight group-hover:text-blue-500 transition-colors mb-3">
              {post.title}
            </h2>
            <p className={`text-sm font-bold leading-relaxed ${mutedText}`}>
              {getExcerpt(post.content)}
            </p>
            <div className={`text-[11px] font-semibold ${mutedText} mt-4`}>
              {getReadingTime(post.content)} min read
            </div>
          </article>
        ))}
      </div>

      <div className={`mt-12 text-center text-[10px] font-black uppercase tracking-[0.3em] ${mutedText}`}>
        WorldTimeSuite — Global Time, Simplified
      </div>

    </div>
  );
};

export default BlogIndex;
