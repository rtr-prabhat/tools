import Link from "next/link";

export default function ToolCard({ tool }) {
  const isComingSoon = tool.status === "coming-soon";

  return (
    <Link
      href={`/tools/${tool.id}`}
      className={
        "group block bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500 hover:shadow-md shadow-sm p-5 transition-all duration-200" +
        (isComingSoon ? " opacity-60 pointer-events-none" : "")
      }
    >
      {/* Icon + badge row */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{tool.icon}</span>
        {isComingSoon && (
          <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full px-2 py-0.5 font-medium">
            Coming Soon
          </span>
        )}
      </div>

      {/* Name */}
      <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {tool.name}
      </p>

      {/* Description */}
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{tool.description}</p>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        {!isComingSoon && (
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Try it →</span>
        )}
        <div className="flex gap-1 ml-auto">
          {(tool.tags || []).slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
