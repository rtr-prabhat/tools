export default function ToolBlogSection({ content, tool }) {
  if (!content?.blogArticle) {
    // Show generic content if no blog article exists
    if (!tool) return null;
    return (
      <section className="max-w-4xl mx-auto py-10 sm:py-16">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{tool.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">About {tool.name}</h2>
              <p className="text-sm text-slate-400">{tool.description}</p>
            </div>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {tool.name} is a free online tool available on ToolKit Pro. Use it directly in your browser — no downloads,
              no signups, no hidden charges. Simply navigate to the tool, configure your settings, and get instant results.
              All file processing is done securely, and your data is automatically deleted after processing.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const { title, sections } = content.blogArticle;

  return (
    <section className="max-w-4xl mx-auto py-10 sm:py-16">
      {/* Article Header */}
      <div className="mb-8 text-center">
        <span className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-full px-3 py-1 mb-3">
          📖 Blog Article
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
          {title}
        </h2>
        {tool && (
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
            A complete guide to using the {tool.icon} {tool.name} tool effectively
          </p>
        )}
      </div>

      {/* Article Sections */}
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start gap-4">
              {/* Section number */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  {section.heading}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 p-6 shadow-sm">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
          Ready to try {tool?.name || 'this tool'}? It&apos;s free, fast, and requires no signup.
        </p>
        <a
          href="#tool-top"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span>Try it now</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </a>
      </div>
    </section>
  );
}
