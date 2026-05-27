'use client';

import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, AlertCircle, Loader2, ArrowLeft, RefreshCw, Sun, Moon } from 'lucide-react';
import { useCachedData } from '@/hooks/useCachedData';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DocumentationData {
  title: string;
  content: string;
  updated_at?: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function cleanMarkdownText(text: string) {
  return text
    .replace(/[\*_`~]/g, '') // Remove formatting characters
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Extract text from markdown links
}

function getHeaderText(children: any): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(getHeaderText).join('');
  if (children && children.props && children.props.children) {
    return getHeaderText(children.props.children);
  }
  return '';
}

function parseFirestoreDate(dateVal: any): Date | null {
  if (!dateVal) return null;
  if (typeof dateVal === 'object') {
    if (typeof dateVal.toDate === 'function') {
      return dateVal.toDate();
    }
    const seconds = dateVal._seconds ?? dateVal.seconds;
    if (typeof seconds === 'number') {
      return new Date(seconds * 1000);
    }
  }
  if (typeof dateVal === 'number' || typeof dateVal === 'string') {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d;
    }
  }
  return null;
}

export default function DocumentationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('zander-doc-theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
    } else if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  const handleToggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('zander-doc-theme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  useEffect(() => {
    // Save original background colors
    const origHtmlBg = document.documentElement.style.background;
    const origBodyBg = document.body.style.background;

    let meta = document.querySelector('meta[name="theme-color"]');
    const metaExisted = !!meta;
    const origThemeColor = meta ? meta.getAttribute('content') || '' : '';

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }

    // Apply background based on theme state
    if (isDarkMode) {
      document.documentElement.style.background = '#0a0a0a'; // neutral-950
      document.body.style.background = '#0a0a0a';
      meta.setAttribute('content', '#0a0a0a');
    } else {
      document.documentElement.style.background = ''; // reset to stylesheet default (light)
      document.body.style.background = '';
      meta.setAttribute('content', '#f9fafb'); // neutral-50
    }

    return () => {
      // Restore original background colors on unmount
      document.documentElement.style.background = origHtmlBg;
      document.body.style.background = origBodyBg;

      // Restore original theme-color meta tag
      if (meta) {
        if (metaExisted) {
          if (origThemeColor) {
            meta.setAttribute('content', origThemeColor);
          } else {
            meta.removeAttribute('content');
          }
        } else {
          meta.remove();
        }
      }
    };
  }, [isDarkMode]);

  const { data, isLoading, isRefetching, error, refetch } = useCachedData<DocumentationData>(
    'zander_documentation',
    async () => {
      const res = await axios.get('/api/admin/documentation');
      return res.data;
    },
    { 
      enabled: !authLoading && !!user,
      ttl: 5 * 60 * 1000 // 5 minutes TTL
    }
  );

  const [activeId, setActiveId] = React.useState<string>('');

  // Remove the redundant H1 title from the markdown content if it exists at the top
  const cleanContent = (() => {
    const content = data?.content;
    if (!content) return '';
    const lines = content.split('\n');
    const firstH1Idx = lines.findIndex((line, idx) => idx < 5 && line.trim().startsWith('# '));
    if (firstH1Idx !== -1) {
      lines.splice(firstH1Idx, 1);
    }
    return lines.join('\n').trim();
  })();

  const toc = React.useMemo(() => {
    if (!cleanContent) return [];
    const lines = cleanContent.split('\n');
    const items: { text: string; id: string; level: number }[] = [];
    const seenSlugs: Record<string, number> = {};

    lines.forEach((line) => {
      const match = line.match(/^(#{1,4})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const rawText = match[2].trim();
        const text = cleanMarkdownText(rawText);
        if (text) {
          let slug = slugify(text);
          if (seenSlugs[slug] !== undefined) {
            seenSlugs[slug]++;
            slug = `${slug}-${seenSlugs[slug]}`;
          } else {
            seenSlugs[slug] = 0;
          }
          items.push({ text, id: slug, level });
        }
      }
    });
    return items;
  }, [cleanContent]);

  useEffect(() => {
    if (!cleanContent || toc.length === 0) return;

    const headingElements = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id]');
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    headingElements.forEach((el) => observer.observe(el));

    // Handle initial hash check if present in URL
    const hash = window.location.hash;
    if (hash) {
      const id = hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        setActiveId(id);
      }
    } else if (toc.length > 0) {
      setActiveId(toc[0].id);
    }

    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
    };
  }, [cleanContent, toc]);

  const displayError = error
    ? (error.response?.data?.error || error.message || 'Failed to load system documentation.')
    : null;

  const updatedDate = data?.updated_at ? parseFirestoreDate(data.updated_at) : null;

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('from') === 'settings') {
        router.push('/dashboard/settings');
        return;
      }
    }
    router.push('/dashboard');
  };

  const mdComponents = {
    h1: ({ node, children, ...props }: any) => {
      const text = getHeaderText(children);
      const id = slugify(text);
      return (
        <h1 id={id} className={`scroll-mt-24 text-3xl font-black mt-12 mb-6 border-b pb-3 tracking-tight transition-colors duration-300 ${isDarkMode ? 'text-white border-neutral-900' : 'text-neutral-900 border-neutral-200'}`} {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ node, children, ...props }: any) => {
      const text = getHeaderText(children);
      const id = slugify(text);
      return (
        <h2 id={id} className={`scroll-mt-24 text-2xl font-bold mt-10 mb-4 border-b pb-2 tracking-tight transition-colors duration-300 ${isDarkMode ? 'text-white border-neutral-900' : 'text-neutral-900 border-neutral-200'}`} {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }: any) => {
      const text = getHeaderText(children);
      const id = slugify(text);
      return (
        <h3 id={id} className={`scroll-mt-24 text-xl font-bold mt-8 mb-3 tracking-tight transition-colors duration-300 ${isDarkMode ? 'text-neutral-100' : 'text-neutral-800'}`} {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ node, children, ...props }: any) => {
      const text = getHeaderText(children);
      const id = slugify(text);
      return (
        <h4 id={id} className={`scroll-mt-24 text-lg font-semibold mt-6 mb-2 tracking-tight transition-colors duration-300 ${isDarkMode ? 'text-neutral-200' : 'text-neutral-700'}`} {...props}>
          {children}
        </h4>
      );
    },
    p: ({ node, ...props }: any) => <p className={`text-sm leading-relaxed mb-6 font-light transition-colors duration-300 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`} {...props} />,
    ul: ({ node, ...props }: any) => <ul className={`list-disc pl-6 mb-6 space-y-2 text-sm font-light transition-colors duration-300 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`} {...props} />,
    ol: ({ node, ...props }: any) => <ol className={`list-decimal pl-6 mb-6 space-y-2 text-sm font-light transition-colors duration-300 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`} {...props} />,
    li: ({ node, ...props }: any) => <li className="pl-1" {...props} />,
    pre: ({ node, children, ...props }: any) => {
      if (React.isValidElement(children)) {
        return (
          <pre className={`border p-5 rounded-2xl overflow-x-auto text-xs font-mono my-6 leading-relaxed transition-colors duration-300 ${isDarkMode ? 'bg-neutral-900 border-neutral-800/80 text-neutral-200' : 'bg-neutral-50 border-neutral-200/80 text-neutral-800'}`} {...props}>
            {React.cloneElement(children as React.ReactElement<any>, { isBlock: true })}
          </pre>
        );
      }
      return (
        <pre className={`border p-5 rounded-2xl overflow-x-auto text-xs font-mono my-6 leading-relaxed transition-colors duration-300 ${isDarkMode ? 'bg-neutral-900 border-neutral-800/80 text-neutral-200' : 'bg-neutral-50 border-neutral-200/80 text-neutral-800'}`} {...props}>
          {children}
        </pre>
      );
    },
    code: ({ node, className, children, isBlock, ...props }: any) => {
      return isBlock ? (
        <code className={className} {...props}>
          {children}
        </code>
      ) : (
        <code className={`px-1.5 py-0.5 rounded font-mono text-xs font-semibold border transition-colors duration-300 ${isDarkMode ? 'bg-neutral-900 text-mint border-neutral-800' : 'bg-neutral-100 text-dark-green border-neutral-200'}`} {...props}>
          {children}
        </code>
      );
    },
    hr: ({ node, ...props }: any) => <hr className={`my-10 transition-colors duration-300 ${isDarkMode ? 'border-neutral-900' : 'border-neutral-200'}`} {...props} />,
    blockquote: ({ node, ...props }: any) => (
      <blockquote className={`border-l-4 border-mint px-5 py-4 rounded-r-2xl my-6 italic text-sm font-light transition-colors duration-300 ${isDarkMode ? 'bg-mint/5 text-neutral-300' : 'bg-mint/10 text-neutral-700'}`} {...props} />
    ),
    table: ({ node, ...props }: any) => (
      <div className={`overflow-x-auto my-8 border rounded-2xl transition-colors duration-300 ${isDarkMode ? 'border-neutral-900 bg-neutral-900/30' : 'border-neutral-200 bg-neutral-50/50'}`}>
        <table className="w-full text-left border-collapse text-sm" {...props} />
      </div>
    ),
    thead: ({ node, ...props }: any) => <thead className={`border-b font-semibold transition-colors duration-300 ${isDarkMode ? 'bg-neutral-900/80 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-200 text-neutral-700'}`} {...props} />,
    tbody: ({ node, ...props }: any) => <tbody className={`divide-y font-light transition-colors duration-300 ${isDarkMode ? 'divide-neutral-900 text-neutral-300' : 'divide-neutral-200 text-neutral-600'}`} {...props} />,
    tr: ({ node, ...props }: any) => <tr className={`transition-colors duration-300 ${isDarkMode ? 'hover:bg-neutral-900/40' : 'hover:bg-neutral-100/40'}`} {...props} />,
    th: ({ node, ...props }: any) => <th className="px-5 py-4 font-semibold" {...props} />,
    td: ({ node, ...props }: any) => <td className="px-5 py-4 align-top" {...props} />,
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans flex flex-col ${
      isDarkMode 
        ? 'bg-neutral-950 text-neutral-200 selection:bg-mint/30' 
        : 'bg-neutral-50 text-neutral-900 selection:bg-mint/10'
    }`}>
      {/* Sticky Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md px-6 py-4 border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-neutral-950/80 border-neutral-900' 
          : 'bg-white/80 border-neutral-200/60'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBack}
              className={`p-2.5 border rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                isDarkMode 
                  ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:text-white text-neutral-400' 
                  : 'bg-white border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 text-neutral-500'
              }`}
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center text-mint shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-base font-black leading-none tracking-tight transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-neutral-900'
              }`}>System Documentation</h1>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 transition-colors duration-300 ${
                isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
              }`}>Zander Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {updatedDate && (
              <span className={`text-[9px] font-bold uppercase tracking-widest border px-4 py-1.5 rounded-full hidden sm:inline-block transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-500' 
                  : 'bg-neutral-100 border-neutral-200 text-neutral-500'
              }`}>
                Last Updated: {updatedDate.toLocaleDateString()}
              </span>
            )}
            <button 
              onClick={() => refetch()}
              disabled={isRefetching || isLoading}
              className={`p-2.5 border rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 ${
                isDarkMode 
                  ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:text-white text-neutral-400' 
                  : 'bg-white border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 text-neutral-500'
              }`}
              title="Refresh Content"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-mint' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12">
        {displayError && (
          <div className={`mb-8 p-5 rounded-2xl flex items-start gap-3 border transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-red-950/20 border-red-900/50 text-red-400' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Error Loading Documentation</p>
              <p className={`text-xs mt-1 transition-colors duration-300 ${isDarkMode ? 'text-red-500/80' : 'text-red-600'}`}>{displayError}</p>
            </div>
          </div>
        )}

        <div className="min-h-[500px]">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-[400px]">
              <Loader2 className="animate-spin rounded-full h-8 w-8 text-mint mb-3" />
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Fetching documentation from Firebase...</p>
            </div>
          ) : data ? (
            <div className="lg:flex lg:gap-16">
              {/* Sticky Table of Contents */}
              {toc.length > 0 && (
                <aside 
                  className="hidden lg:block w-60 shrink-0 sticky top-28 self-start max-h-[calc(100vh-10rem)] overflow-y-auto pr-4"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: isDarkMode ? '#262626 transparent' : '#e5e7eb transparent'
                  }}
                >
                  <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-4 transition-colors duration-300 ${
                    isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
                  }`}>On this page</h4>
                  <nav className="space-y-1">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(item.id);
                          if (el) {
                            el.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start'
                            });
                            window.history.pushState(null, '', `#${item.id}`);
                            setActiveId(item.id);
                          }
                        }}
                        className={`block text-xs py-1.5 transition-all duration-200 border-l pl-4 ${
                          activeId === item.id
                            ? 'border-mint font-semibold ' + (isDarkMode ? 'text-white' : 'text-neutral-900')
                            : (isDarkMode ? 'border-neutral-900 text-neutral-400 hover:text-neutral-200 hover:border-neutral-800' : 'border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300')
                        }`}
                        style={{
                          paddingLeft: `${(item.level - 1) * 12 + 16}px`
                        }}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </aside>
              )}

              {/* Document Body */}
              <div className="flex-1 min-w-0">
                <div className={`mb-10 pb-8 border-b transition-colors duration-300 ${
                  isDarkMode ? 'border-neutral-900' : 'border-neutral-200'
                }`}>
                  <h1 className={`text-4xl font-black tracking-tight leading-tight transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-neutral-900'
                  }`}>{data.title}</h1>
                  {updatedDate && (
                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-2.5 sm:hidden transition-colors duration-300 ${
                      isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
                    }`}>
                      Last Updated: {updatedDate.toLocaleString()}
                    </p>
                  )}
                </div>
                <article className="max-w-none">
                  <ReactMarkdown components={mdComponents}>
                    {cleanContent}
                  </ReactMarkdown>
                </article>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-[400px]">
              <AlertCircle className={`h-8 w-8 mb-3 ${isDarkMode ? 'text-neutral-700' : 'text-neutral-400'}`} />
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">No documentation content available.</p>
            </div>
          )}
        </div>
      </main>

      {/* Immersive Dark/Light Footer */}
      <footer className={`px-8 py-12 mt-12 shrink-0 border-t transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-neutral-950 border-neutral-900/60' 
          : 'bg-white border-neutral-200'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Branding */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4 group cursor-pointer" onClick={handleBack}>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 ${
                  isDarkMode 
                    ? 'bg-mint/10 border-mint/20 text-mint' 
                    : 'bg-mint/20 border-mint/30 text-dark-green'
                }`}>
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className={`text-sm font-black tracking-tight group-hover:text-mint transition-colors ${
                    isDarkMode ? 'text-white' : 'text-neutral-900'
                  }`}>Zander</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider block transition-colors duration-300 ${
                    isDarkMode ? 'text-neutral-500' : 'text-neutral-400'
                  }`}>Admin Control Center</span>
                </div>
              </div>
              <p className={`text-xs max-w-sm leading-relaxed mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-neutral-500' : 'text-neutral-500'
              }`}>
                Advanced AI core and knowledge ingestion control center. Designed and engineered for high-fidelity database synchronisation and diagnostics.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-mint"></span>
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                  isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                }`}>System Status: Operational</span>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
              }`}>Navigation</h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="/dashboard" className={`transition-colors ${
                    isDarkMode ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-neutral-800'
                  }`}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/users" className={`transition-colors ${
                    isDarkMode ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-neutral-800'
                  }`}>
                    User Management
                  </Link>
                </li>
                <li>
                  <Link href="/imports" className={`transition-colors ${
                    isDarkMode ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-neutral-800'
                  }`}>
                    Import Monitor
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/settings" className={`transition-colors ${
                    isDarkMode ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-neutral-800'
                  }`}>
                    System Settings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Support & Legal */}
            <div>
              <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
              }`}>Support & Legal</h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link href="/dashboard/support" className={`transition-colors ${
                    isDarkMode ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-neutral-800'
                  }`}>
                    Help & Support
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className={`transition-colors ${
                    isDarkMode ? 'text-neutral-500 hover:text-white' : 'text-neutral-500 hover:text-neutral-800'
                  }`}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`transition-colors cursor-pointer text-left focus:outline-none ${
                      isDarkMode ? 'text-neutral-500 hover:text-mint' : 'text-neutral-500 hover:text-dark-green'
                    }`}
                  >
                    Back to Top ↑
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className={`border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300 ${
            isDarkMode ? 'border-neutral-900/40' : 'border-neutral-200'
          }`}>
            <p className={`text-[10px] font-medium transition-colors duration-300 ${
              isDarkMode ? 'text-neutral-600' : 'text-neutral-400'
            }`}>
              &copy; {new Date().getFullYear()} Zander Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {/* Theme Toggle Button */}
              <button
                onClick={handleToggleTheme}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800' 
                    : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-mint" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-dark-green" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              <span className={`text-[9px] font-bold uppercase tracking-widest border px-3.5 py-1.5 rounded-full transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-neutral-900/60 border-neutral-800/40 text-neutral-600' 
                  : 'bg-neutral-100 border-neutral-200 text-neutral-500'
              }`}>
                V1.2.4-Production
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
