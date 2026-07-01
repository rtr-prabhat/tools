'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const CATEGORIES = [
  {
    name: "Image Tools",
    icon: "🖼️",
    color: "from-blue-500 to-cyan-500",
    tools: [
      { id: "compress-image", name: "Compress Image", icon: "🗜️" },
      { id: "resize-image", name: "Resize Image", icon: "↔️" },
      { id: "convert-image", name: "Convert Format", icon: "🔄" },
      { id: "image-to-pdf", name: "Image to PDF", icon: "📄" },
      { id: "image-cropper", name: "Image Cropper", icon: "✂️" },
      { id: "watermark-adder", name: "Watermark Adder", icon: "💧" },
    ],
  },
  {
    name: "PDF Tools",
    icon: "📑",
    color: "from-red-500 to-orange-500",
    tools: [
      { id: "compress-pdf", name: "Compress PDF", icon: "🗜️" },
      { id: "merge-pdf", name: "Merge PDFs", icon: "🔗" },
    ],
  },
  {
    name: "Text Tools",
    icon: "✏️",
    color: "from-teal-500 to-emerald-500",
    tools: [
      { id: "word-counter", name: "Word Counter", icon: "📝" },
      { id: "password-generator", name: "Password Generator", icon: "🔐" },
      { id: "json-formatter", name: "JSON Formatter", icon: "{ }" },
      { id: "color-converter", name: "Color Converter", icon: "🎨" },
      { id: "unit-converter", name: "Unit Converter", icon: "📏" },
      { id: "age-calculator", name: "Age Calculator", icon: "🗓️" },
      { id: "number-to-words", name: "Number to Words", icon: "🔢" },
      { id: "url-encoder", name: "URL Encoder/Decoder", icon: "🔗" },
      { id: "currency-converter", name: "Currency Converter", icon: "💱" },
      { id: "ocr-tool", name: "Image to Text (OCR)", icon: "👁️" },
      { id: "markdown-preview", name: "Markdown Preview", icon: "📝" },
    ],
  },
  {
    name: "Financial Tools",
    icon: "💰",
    color: "from-green-500 to-emerald-500",
    tools: [
      { id: "gst-calculator", name: "GST Calculator", icon: "🧾" },
      { id: "emi-calculator", name: "EMI Calculator", icon: "🏦" },
      { id: "sip-calculator", name: "SIP Calculator", icon: "📈" },
      { id: "fd-calculator", name: "FD Calculator", icon: "💵" },
      { id: "bmi-calculator", name: "BMI Calculator", icon: "⚖️" },
      { id: "income-tax-calculator", name: "Income Tax Calculator", icon: "📊" },
      { id: "ppf-calculator", name: "PPF Calculator", icon: "🏛️" },
      { id: "hra-calculator", name: "HRA Calculator", icon: "🏠" },
    ],
  },
  {
    name: "Productivity",
    icon: "⚡",
    color: "from-orange-500 to-amber-500",
    tools: [
      { id: "invoice-generator", name: "Invoice Generator", icon: "📜" },
      { id: "signature-maker", name: "Signature Maker", icon: "✍️" },
      { id: "typing-speed-test", name: "Typing Speed Test", icon: "⌨️" },
      { id: "pomodoro-timer", name: "Pomodoro Timer", icon: "🍅" },
      { id: "text-to-speech", name: "Text to Speech", icon: "🔊" },
    ],
  },
  {
    name: "Developer Tools",
    icon: "👨‍💻",
    color: "from-slate-500 to-slate-700",
    tools: [
      { id: "hash-generator", name: "Hash Generator", icon: "🔐" },
      { id: "regex-tester", name: "Regex Tester", icon: "🔍" },
      { id: "jwt-decoder", name: "JWT Decoder", icon: "🔑" },
      { id: "lorem-ipsum", name: "Lorem Ipsum", icon: "📄" },
      { id: "csv-json-converter", name: "CSV ↔ JSON", icon: "🔄" },
    ],
  },
  {
    name: "More",
    icon: "🎮",
    color: "from-purple-500 to-pink-500",
    tools: [
      { id: "cv-builder", name: "CV / Resume Builder", icon: "📋" },
      { id: "qr-generator", name: "QR Code Generator", icon: "📱" },
      { id: "base64-encode", name: "Base64 Encode/Decode", icon: "🔤" },
    ],
  },
  {
    name: "Games",
    icon: "🎮",
    color: "from-violet-500 to-purple-500",
    tools: [
      { id: "snake-game", name: "Snake Game", icon: "🐍" },
      { id: "memory-game", name: "Memory Match", icon: "🃏" },
      { id: "tetris-game", name: "Tetris", icon: "🟦" },
    ],
  },
];

// Flatten categories + tools for quick search lookup
const ALL_TOOLS = CATEGORIES.flatMap(cat =>
  cat.tools.map(tool => ({
    ...tool,
    categoryName: cat.name,
    categoryIcon: cat.icon,
  }))
);

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const megaRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter tools based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return ALL_TOOLS.filter(tool => {
      const name = tool.name.toLowerCase();
      const desc = (tool.description || '').toLowerCase();
      const tags = (tool.tags || []).join(' ').toLowerCase();
      const cat = tool.categoryName.toLowerCase();
      return name.includes(q) || desc.includes(q) || tags.includes(q) || cat.includes(q);
    }).slice(0, 8); // Max 8 results
  }, [searchQuery]);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) {
        setOpenCategory(null);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Keyboard shortcut: Cmd+K / Ctrl+K to open search
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      // Escape to close search
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchOpen]);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    setDark(isDark);
  };

  const navigateTo = (path) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchFocused(false);
    router.push(path);
  };

  const ThemeIcon = () => dark ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm border-b border-slate-100 dark:border-slate-800'
        : 'bg-white dark:bg-slate-950 border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-2">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group shrink-0"
          >
            <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">🛠️</span>
            <span className="text-indigo-700 dark:text-indigo-400 font-bold text-xl hidden sm:inline">
              ToolKit
              <span className="text-slate-800 dark:text-slate-200"> Pro</span>
            </span>
          </Link>

          {/* Desktop: Search bar in header */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4" ref={searchRef}>
            <div className="relative w-full">
              <div className={`flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border rounded-xl px-3 py-1.5 transition-all duration-200 ${
                searchFocused || searchOpen
                  ? 'border-indigo-400 dark:border-indigo-500 bg-white dark:bg-slate-900 shadow-sm'
                  : 'border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}>
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => { setSearchOpen(true); setSearchFocused(true); }}
                  placeholder="Search tools..."
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none min-w-0"
                  aria-label="Search tools"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }} className="p-0.5 rounded text-slate-400 hover:text-slate-600 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {!searchQuery && (
                  <kbd className="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
                )}
              </div>

              {/* Search results dropdown */}
              {searchOpen && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-indigo-500/5 overflow-hidden">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-400">
                      <p>No tools found for &ldquo;{searchQuery}&rdquo;</p>
                    </div>
                  ) : (
                    <div className="py-1.5">
                      {searchResults.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => navigateTo(`/tools/${tool.id}`)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left"
                        >
                          <span className="text-lg shrink-0">{tool.icon}</span>
                          <div className="min-w-0 flex-1">
                            <span className="font-medium">{tool.name}</span>
                            <span className="text-xs text-slate-400 ml-2">{tool.categoryName}</span>
                          </div>
                          <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 text-[10px] text-slate-400 text-center">
                      Press <kbd className="font-mono bg-slate-100 dark:bg-slate-800 rounded px-1">Enter</kbd> to select · <kbd className="font-mono bg-slate-100 dark:bg-slate-800 rounded px-1">Esc</kbd> to close
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1" ref={megaRef}>
            {/* Mega Menu Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setOpenCategory('all')}
              onMouseLeave={() => setOpenCategory(null)}
            >
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                All Tools
              </button>
              {openCategory === 'all' && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[720px]">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl shadow-indigo-500/5 p-5 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      {CATEGORIES.map((cat) => (
                        <div key={cat.name}>
                          <Link href="/#tools" className={`inline-flex items-center gap-2 text-sm font-semibold mb-2 px-2 py-1 rounded-lg bg-gradient-to-r ${cat.color} bg-clip-text text-transparent`}>
                            <span>{cat.icon}</span>{cat.name}
                          </Link>
                          <div className="space-y-0.5">
                            {cat.tools.map((tool) => (
                              <Link key={tool.id} href={`/tools/${tool.id}`} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all" onClick={() => setOpenCategory(null)}>
                                <span className="text-base">{tool.icon}</span>{tool.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/tools/cv-builder" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
              CV Builder
            </Link>

            <Link href="/tools/qr-generator" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
              QR Code
            </Link>

            <Link href="/blog" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
              Blog
            </Link>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

            <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all" aria-label="Toggle dark mode">
              <ThemeIcon />
            </button>
          </div>

          {/* Mobile: search icon + theme toggle + hamburger */}
          <div className="lg:hidden flex items-center gap-1 flex-1 justify-end">
            <button
              onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchInputRef.current?.focus(), 50); }}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
              aria-label="Search tools"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all" aria-label="Toggle dark mode">
              <ThemeIcon />
            </button>
            <button className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile: search bar below nav */}
        {searchOpen && (
          <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5" ref={searchRef}>
            <div className={`flex items-center gap-2 border-2 rounded-xl px-3 py-2 transition-all ${searchFocused ? 'border-indigo-400' : 'border-slate-200 dark:border-slate-700'}`}>
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search tools by name, tag, or category..."
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 p-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 max-h-60 overflow-y-auto space-y-0.5">
                {searchResults.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-4">No tools found</p>
                ) : (
                  searchResults.map((tool) => (
                    <button key={tool.id} onClick={() => navigateTo(`/tools/${tool.id}`)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left">
                      <span className="text-lg">{tool.icon}</span>
                      <span className="font-medium">{tool.name}</span>
                      <span className="text-xs text-slate-400 ml-auto">{tool.categoryName}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile menu - accordion style */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 max-h-[80vh] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            <Link href="/blog" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all" onClick={() => setMobileOpen(false)}>
              <span>📖</span>Blog
            </Link>
            {CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <button onClick={() => setOpenCategory(openCategory === cat.name ? null : cat.name)} className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                  <span className="flex items-center gap-2"><span>{cat.icon}</span>{cat.name}</span>
                  <svg className={`w-4 h-4 transition-transform ${openCategory === cat.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openCategory === cat.name && (
                  <div className="ml-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800 space-y-0.5 mt-1 mb-2">
                    {cat.tools.map((tool) => (
                      <Link key={tool.id} href={`/tools/${tool.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all" onClick={() => { setMobileOpen(false); setOpenCategory(null); }}>
                        <span>{tool.icon}</span>{tool.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
