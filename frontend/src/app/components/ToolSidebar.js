'use client';

import { useState } from 'react';

export default function ToolSidebar({ tool, content }) {
  const [activeTab, setActiveTab] = useState('guide');

  if (!tool) return null;

  const tabs = [
    { id: 'guide', label: '📖 Guide', icon: '📖' },
    { id: 'benefits', label: '✨ Benefits', icon: '✨' },
    { id: 'faq', label: '❓ FAQ', icon: '❓' },
  ];

  return (
    <div className="space-y-3">
      {/* Tool Identity */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{tool.icon}</span>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">{tool.name}</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{tool.status || 'active'}</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {content?.longDescription || tool.description}
        </p>
        {tool.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tool.tags.map(tag => (
              <span key={tag} className="text-xs bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 text-indigo-600 dark:text-indigo-400 rounded-full px-2.5 py-1 border border-indigo-100 dark:border-indigo-800/50">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tool tips mini-card */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">💡</span>
          <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Pro Tip</span>
        </div>
        <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 leading-relaxed">
          All processing happens on our secure servers. Your files are automatically deleted after processing — no traces left behind.
        </p>
      </div>

      {/* Tabbed Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
        {/* Tab buttons */}
        <div className="flex border-b border-slate-100 dark:border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-3 py-2.5 text-xs font-medium transition-all duration-200 relative ${
                activeTab === tab.id
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.icon}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-4 max-h-[320px] overflow-y-auto">
          {activeTab === 'guide' && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                How to Use
              </h4>
              {content?.howToUse ? (
                <ul className="space-y-2.5">
                  {content.howToUse.map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-snug">{step}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center py-4 text-slate-400 dark:text-slate-500">
                  <span className="text-2xl mb-2">🚀</span>
                  <p className="text-sm">Start using the tool on the left. It&apos;s intuitive and easy!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Key Benefits
              </h4>
              {(content?.benefits || []).length > 0 ? (
                <ul className="space-y-2">
                  {content.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xs mt-0.5">✓</span>
                      <span className="leading-snug">{benefit}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center py-4 text-slate-400 dark:text-slate-500">
                  <span className="text-2xl mb-2">⭐</span>
                  <p className="text-sm">Free, fast, and private — use it anytime!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Frequently Asked Questions
              </h4>
              {(content?.faq || []).length > 0 ? (
                <div className="space-y-3">
                  {content.faq.map((item, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/30">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{item.q}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 text-slate-400 dark:text-slate-500">
                  <span className="text-2xl mb-2">❓</span>
                  <p className="text-sm">No FAQs available. Try the tool and see how it works!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
