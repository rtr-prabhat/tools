'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import ToolCard from './ToolCard';

export default function ToolSearch({ categories }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const normalizedQuery = query.toLowerCase().trim();

  // Flatten all tools for search + count
  const allTools = useMemo(() => {
    const flat = [];
    categories.forEach((cat) => {
      cat.tools.forEach((tool) => {
        flat.push({ ...tool, categoryName: cat.name, categoryIcon: cat.icon });
      });
    });
    return flat;
  }, [categories]);

  // Filter tools + categories
  const filtered = useMemo(() => {
    if (!normalizedQuery) return { categories, total: allTools.length, results: [] };

    const matching = allTools.filter((tool) => {
      const name = tool.name.toLowerCase();
      const desc = (tool.description || '').toLowerCase();
      const tags = (tool.tags || []).join(' ').toLowerCase();
      const cat = tool.categoryName.toLowerCase();
      return (
        name.includes(normalizedQuery) ||
        desc.includes(normalizedQuery) ||
        tags.includes(normalizedQuery) ||
        cat.includes(normalizedQuery)
      );
    });

    // Group matches back into categories
    const catMap = {};
    matching.forEach((tool) => {
      const catKey = tool.categoryName;
      if (!catMap[catKey]) {
        const original = categories.find((c) =>
          c.tools.some((t) => t.id === tool.id)
        );
        if (original) {
          catMap[catKey] = { ...original, tools: [] };
        }
      }
      if (catMap[catKey]) {
        const originalTool = categories
          .find((c) => c.tools.some((t) => t.id === tool.id))
          ?.tools.find((t) => t.id === tool.id);
        if (originalTool) {
          catMap[catKey].tools.push(originalTool);
        }
      }
    });

    return {
      categories: Object.values(catMap),
      total: matching.length,
    };
  }, [normalizedQuery, categories, allTools]);

  // Keyboard shortcut: Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto">
        <div
          className={`flex items-center gap-3 bg-white dark:bg-slate-900 border-2 rounded-2xl px-4 py-3 transition-all duration-200 ${
            isFocused
              ? 'border-indigo-400 dark:border-indigo-500 shadow-lg shadow-indigo-500/10'
              : 'border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search tools by name, tag, or category..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none min-w-0"
            aria-label="Search tools"
          />

          {/* Keyboard shortcut badge */}
          {!query && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
              <span>⌘</span>K
            </kbd>
          )}

          {/* Clear button */}
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Results count */}
        {query && (
          <div className="text-center mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-full px-4 py-1.5 border border-slate-200 dark:border-slate-700 shadow-sm">
              {filtered.total === 0 ? (
                <>😕 No tools found for &quot;{query}&quot;</>
              ) : (
                <>🔍 Found {filtered.total} {filtered.total === 1 ? 'tool' : 'tools'} for &quot;{query}&quot;</>
              )}
            </span>
          </div>
        )}
      </div>

      {/* No results */}
      {normalizedQuery && filtered.total === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">🔍</span>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            No tools match your search
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Try different keywords like &quot;image&quot;, &quot;pdf&quot;, or &quot;calculator&quot;
          </p>
          <button
            onClick={clearSearch}
            className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Filtered tools grouped by category */}
      {normalizedQuery && filtered.total > 0 && (
        <div className="space-y-10">
          {filtered.categories.map((category) => (
            <div key={category.id}>
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <span className="text-2xl sm:text-3xl">{category.icon}</span>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                    {category.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
                    {category.tools.length} {category.tools.length === 1 ? 'tool' : 'tools'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {category.tools.map((tool, idx) => (
                  <div key={tool.id} className="stagger-item">
                    <ToolCard tool={tool} index={idx} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Default: show all categories only when no search */}
      {!normalizedQuery && (
        <div className="space-y-10 sm:space-y-16">
          {categories.map((category, catIdx) => (
            <div key={category.id}>
              <div className="flex items-center gap-3 mb-5 sm:mb-6 group">
                <div className="relative">
                  <span className="text-2xl sm:text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 block">
                    {category.icon}
                  </span>
                  <div className="absolute -inset-2 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                    {category.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
                    {category.tools.length} {category.tools.length === 1 ? 'tool' : 'tools'} available
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {category.tools.map((tool, toolIdx) => (
                  <div key={tool.id} className="stagger-item">
                    <ToolCard tool={tool} index={catIdx * 10 + toolIdx} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
