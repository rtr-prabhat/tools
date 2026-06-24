import Link from "next/link";

const BG_GRADIENTS = [
  'from-indigo-500/10 via-purple-500/10 to-pink-500/10',
  'from-blue-500/10 via-cyan-500/10 to-teal-500/10',
  'from-orange-500/10 via-amber-500/10 to-yellow-500/10',
  'from-green-500/10 via-emerald-500/10 to-teal-500/10',
  'from-rose-500/10 via-pink-500/10 to-purple-500/10',
  'from-sky-500/10 via-blue-500/10 to-indigo-500/10',
];

const BORDER_GRADIENTS = [
  'hover:border-indigo-400 dark:hover:border-indigo-500',
  'hover:border-blue-400 dark:hover:border-blue-500',
  'hover:border-amber-400 dark:hover:border-amber-500',
  'hover:border-emerald-400 dark:hover:border-emerald-500',
  'hover:border-pink-400 dark:hover:border-pink-500',
  'hover:border-sky-400 dark:hover:border-sky-500',
];

export default function ToolCard({ tool, index = 0 }) {
  const isComingSoon = tool.status === "coming-soon";
  const gIndex = index % BG_GRADIENTS.length;

  return (
    <Link
      href={`/tools/${tool.id}`}
      className={`group relative block rounded-2xl border-2 border-slate-100 dark:border-slate-700/50 ${BORDER_GRADIENTS[gIndex]} shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 ${
        isComingSoon ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Hover glow effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${BG_GRADIENTS[gIndex]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* Shine effect on hover */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute -inset-full top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] group-hover:animate-shimmer" />
      </div>

      <div className="relative p-5">
        {/* Icon + badge row */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 block">
            {tool.icon}
          </span>
          {isComingSoon ? (
            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full px-2.5 py-1 font-medium">
              Coming Soon
            </span>
          ) : (
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full px-2.5 py-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Try Free →
            </span>
          )}
        </div>

        {/* Name */}
        <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
          {tool.name}
        </p>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
          {tool.description}
        </p>

        {/* Footer tags */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {(tool.tags || []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full px-2.5 py-0.5 border border-slate-200 dark:border-slate-700"
              >
                #{tag}
              </span>
            ))}
          </div>
          <svg
            className="w-4 h-4 text-indigo-400 dark:text-indigo-500 transition-all duration-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
