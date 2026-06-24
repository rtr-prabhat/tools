import Link from 'next/link';
import ToolClientWrapper from './ToolClientWrapper';
import ToolSidebar from '../../components/ToolSidebar';
import ToolPreviewPanel from '../../components/ToolPreviewPanel';
import ToolBlogSection from '../../components/ToolBlogSection';
import { ToolStateProvider } from '../../context/ToolStateContext';
import { getToolContent } from '../../data/toolContent';

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

export async function generateMetadata({ params }) {
  const { toolId } = await params;
  const tool = await getTool(toolId);
  const content = getToolContent(toolId);

  const name = tool?.name || toolId.replace(/-/g, ' ');
  const description = content?.longDescription || tool?.description || `Free online ${name} tool — no signup required.`;

  return {
    title: `${name} — Free Online Tool | ToolKit Pro`,
    description,
    openGraph: {
      title: `${name} — Free Online Tool`,
      description,
    },
  };
}

export default async function ToolPage({ params }) {
  const { toolId } = await params;
  const tool = await getTool(toolId);
  const toolContent = getToolContent(toolId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-violet-50/20 dark:from-slate-950 dark:via-indigo-950/10 dark:to-slate-950">
      {/* Anchor for "back to top" */}
      <div id="tool-top" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 lg:py-6 lg:h-[calc(100vh-4rem)] flex flex-col">
        {/* Compact breadcrumb + back link */}
        <div className="flex items-center justify-between shrink-0 mb-3 sm:mb-4 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-400 dark:text-slate-500 min-w-0">
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0">Home</Link>
            <span className="shrink-0">/</span>
            <Link href="/#tools" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 hidden sm:inline">Tools</Link>
            <span className="shrink-0 hidden sm:inline">/</span>
            <span className="text-slate-600 dark:text-slate-300 truncate">{tool?.name || toolId}</span>
          </div>
          <Link
            href="/"
            className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 flex items-center gap-1"
          >
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </div>

        {/* Wrapped with ToolStateProvider + key to reset state on tool change */}
        <ToolStateProvider key={toolId}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 sm:gap-6 flex-1 min-h-0 overflow-y-auto lg:overflow-y-visible">
          {/* Left: Interactive tool */}
          <div className="overflow-y-auto min-h-0 pr-0 sm:pr-1 scroll-smooth">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-4 sm:p-5 lg:p-6">
              <ToolClientWrapper toolId={toolId} />
            </div>
          </div>

          {/* Right: Live preview + Tool info/SEO */}
          <div className="overflow-y-auto min-h-0 space-y-3">
            {/* Live Preview Panel — shown for tools that support it */}
            <ToolPreviewPanel toolId={toolId} tool={tool} content={toolContent} />
            {/* Guide, Benefits, FAQ tabs */}
            <ToolSidebar tool={tool} content={toolContent} />
          </div>
        </div>
        </ToolStateProvider>
      </div>

      {/* Blog/Article Section — full width below the tool */}
      <ToolBlogSection content={toolContent} tool={tool} />
    </div>
  );
}
