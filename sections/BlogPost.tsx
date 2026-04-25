import React, { useEffect } from 'react';
import { BLOG_POST_BY_SLUG } from '../data/blogPosts';

interface BlogPostProps {
  isDark: boolean;
  slug: string;
  onNavigate: (path: string) => void;
}

function countWords(text: string): number {
  return text.replace(/[#*\[\]()>`]/g, '').split(/\s+/).filter(Boolean).length;
}

function parseInline(text: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      result.push(<strong key={match.index} className="font-black">{match[1]}</strong>);
    } else {
      result.push(
        <a key={match.index} href={match[3]} className="text-blue-500 hover:opacity-70 transition-opacity underline">
          {match[2]}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

function renderMarkdown(content: string, isDark: boolean): React.ReactNode[] {
  const mutedText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const bodyText = isDark ? 'text-zinc-100' : 'text-zinc-700';
  const panelBorder = isDark ? 'border-zinc-800' : 'border-zinc-200';
  const panelBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
  const textColor = isDark ? 'text-white' : 'text-zinc-900';

  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    if (line.startsWith('# ')) { i++; continue; }

    if (line.startsWith('## ')) {
      nodes.push(
        <h2 key={i} className={`text-xl sm:text-2xl font-bold mt-12 mb-4 ${textColor}`}>
          {line.slice(3)}
        </h2>
      );
      i++; continue;
    }

    if (line.startsWith('### ')) {
      nodes.push(
        <h3 key={i} className={`text-base sm:text-lg font-bold mt-8 mb-3 ${textColor}`}>
          {line.slice(4)}
        </h3>
      );
      i++; continue;
    }

    if (line.startsWith('---')) {
      nodes.push(<hr key={i} className={`border-t ${panelBorder} my-10`} />);
      i++; continue;
    }

    if (line.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter(l => !l.match(/^\|[-| ]+\|$/));
      nodes.push(
        <div key={`table-${i}`} className={`overflow-x-auto my-8 border ${panelBorder} rounded-2xl ${panelBg}`}>
          <table className="w-full text-sm font-bold">
            {rows.map((row, ri) => {
              const cells = row.split('|').filter((_, ci) => ci > 0 && ci < row.split('|').length - 1);
              return ri === 0 ? (
                <thead key={ri}><tr>
                  {cells.map((cell, ci) => (
                    <th key={ci} className={`text-left px-4 py-3 text-[10px] uppercase tracking-widest font-black ${mutedText} border-b ${panelBorder}`}>
                      {cell.trim()}
                    </th>
                  ))}
                </tr></thead>
              ) : (
                <tbody key={ri}><tr className={`border-t ${panelBorder}`}>
                  {cells.map((cell, ci) => (
                    <td key={ci} className={`px-4 py-3 ${bodyText} leading-relaxed`}>{parseInline(cell.trim())}</td>
                  ))}
                </tr></tbody>
              );
            })}
          </table>
        </div>
      );
      continue;
    }

    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-5 space-y-2 pl-1">
          {items.map((item, idx) => (
            <li key={idx} className={`text-base leading-[1.7] ${bodyText} flex gap-3`}>
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      i++; continue;
    }

    nodes.push(
      <p key={i} className={`text-base sm:text-[17px] leading-[1.75] ${bodyText} mt-5`}>
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return nodes;
}

const BlogPost: React.FC<BlogPostProps> = ({ isDark, slug, onNavigate }) => {
  const post = BLOG_POST_BY_SLUG[slug];

  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-zinc-900';
  const mutedText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const panelBorder = isDark ? 'border-zinc-800' : 'border-zinc-200';
  const panelBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';

  useEffect(() => {
    if (!post) return;
    const existing = document.querySelector('meta[property="article:published_time"]');
    if (existing) {
      existing.setAttribute('content', post.dateIso);
    } else {
      const el = document.createElement('meta');
      el.setAttribute('property', 'article:published_time');
      el.setAttribute('content', post.dateIso);
      document.head.appendChild(el);
    }
    return () => {
      document.querySelector('meta[property="article:published_time"]')?.remove();
    };
  }, [post]);

  if (!post) {
    return (
      <div className={`${bgColor} ${textColor} font-['Helvetica'] p-4 sm:p-8 max-w-4xl mx-auto text-center`}>
        <p className={`text-sm font-bold ${mutedText}`}>Post not found.</p>
        <button
          onClick={() => onNavigate('/blog')}
          className="mt-4 text-blue-500 text-sm font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          ← Back to Blog
        </button>
      </div>
    );
  }

  const title = post.content.match(/^# (.+)$/m)?.[1] ?? post.title;
  const wordCount = countWords(post.content);
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className={`${bgColor} ${textColor} font-['Helvetica'] px-4 sm:px-8 py-4 max-w-4xl mx-auto`}>

      <button
        onClick={() => onNavigate('/blog')}
        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] ${mutedText} hover:text-blue-500 transition-colors mb-10`}
      >
        <span>←</span> Blog
      </button>

      {/* Header */}
      <header className="mb-10 max-w-[740px]">
        <div className={`flex items-center gap-3 text-[11px] font-semibold ${mutedText} mb-5`}>
          <span>{post.date}</span>
          <span>·</span>
          <span>{readingTime} min read</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold leading-tight tracking-tight">
          {title}
        </h1>
        <p className={`mt-3 text-sm ${mutedText}`}>
          By {post.author}
        </p>
      </header>

      {/* Article body */}
      <div className="max-w-[740px]">
        {renderMarkdown(post.content, isDark)}
      </div>

      {/* Related conversions */}
      {post.relatedLinks.length > 0 && (
        <div className={`max-w-[740px] mt-12 border ${panelBorder} rounded-[1.5rem] sm:rounded-[2rem] ${panelBg} p-6 sm:p-8`}>
          <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-5`}>
            Related Conversions
          </h2>
          <div className="flex flex-col gap-3">
            {post.relatedLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => onNavigate(link.path)}
                className={`text-left text-sm font-black uppercase tracking-wide ${mutedText} hover:text-blue-500 transition-colors flex items-center gap-2`}
              >
                <span className="text-blue-500">→</span> {link.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className={`max-w-[740px] mt-6 border ${panelBorder} rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 bg-blue-500/10`}>
        <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] ${mutedText} mb-3`}>
          Try Our Free Converter
        </h2>
        <p className={`text-sm font-bold leading-relaxed ${mutedText} mb-5`}>
          Convert time between any two cities or time zones — DST-aware, instant, and free.
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="px-5 py-2.5 bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-blue-600 transition-colors"
        >
          Open Time Zone Converter →
        </button>
      </div>

      {/* Back link */}
      <div className="max-w-[740px] mt-10 pt-8 border-t border-zinc-800">
        <button
          onClick={() => onNavigate('/blog')}
          className="text-blue-500 text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          ← All Articles
        </button>
      </div>

    </div>
  );
};

export default BlogPost;
