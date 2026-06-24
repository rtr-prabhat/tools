import Link from 'next/link';
import ToolClientWrapper from './ToolClientWrapper';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getTool(toolId) {
  try {
    const res = await fetch(`${API}/api/tools/tool/${toolId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export default async function ToolPage({ params }) {
  const { toolId } = await params;
  const tool = await getTool(toolId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900" style={{ paddingBottom: '4rem' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-6">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
          <span>/</span>
          <span>Tools</span>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300">{tool?.name || toolId}</span>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-5"
        >
          ← Back to all tools
        </Link>

        {tool ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 mb-6 flex items-start gap-4 shadow-sm">
            <span className="text-5xl leading-none">{tool.icon}</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{tool.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{tool.description}</p>
              {tool.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {tool.tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 mb-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{toolId.replace(/-/g, ' ')}</h1>
          </div>
        )}

        <ToolClientWrapper toolId={toolId} />
      </div>
    </div>
  );
}
