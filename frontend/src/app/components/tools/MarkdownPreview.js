'use client';
import { useState, useRef, useCallback } from 'react';
import { marked } from 'marked';

marked.setOptions({ breaks: true, gfm: true });

const DEFAULT_MARKDOWN = `# Welcome to Markdown Preview

Write your **Markdown** here and see a *live preview* on the right.

## Features
- Live preview as you type
- Export as PDF
- Copy HTML output

## Example

> This is a blockquote.

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |

---

Happy writing! 🎉
`;

const TOOLBAR = [
  { label: 'B', title: 'Bold', wrap: ['**', '**'] },
  { label: 'I', title: 'Italic', wrap: ['*', '*'] },
  { label: 'H1', title: 'Heading 1', prefix: '# ' },
  { label: 'H2', title: 'Heading 2', prefix: '## ' },
  { label: '`', title: 'Inline Code', wrap: ['`', '`'] },
  { label: '❝', title: 'Blockquote', prefix: '> ' },
  { label: '—', title: 'Horizontal Rule', insert: '\n---\n' },
];

export default function MarkdownPreview() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [view, setView] = useState('split');
  const [copied, setCopied] = useState(false);
  const editorRef = useRef(null);

  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;

  const applyFormat = useCallback((item) => {
    const ta = editorRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = markdown.slice(start, end);
    let newText = markdown;
    let newStart = start;
    let newEnd = end;

    if (item.insert) {
      newText = markdown.slice(0, start) + item.insert + markdown.slice(end);
      newStart = newEnd = start + item.insert.length;
    } else if (item.prefix) {
      const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
      newText = markdown.slice(0, lineStart) + item.prefix + markdown.slice(lineStart);
      newStart = start + item.prefix.length;
      newEnd = end + item.prefix.length;
    } else if (item.wrap) {
      const [before, after] = item.wrap;
      newText = markdown.slice(0, start) + before + selected + after + markdown.slice(end);
      newStart = start + before.length;
      newEnd = end + before.length;
    }

    setMarkdown(newText);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newStart, newEnd);
    });
  }, [markdown]);

  const copyHtml = () => {
    navigator.clipboard.writeText(marked(markdown)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadPdf = () => window.print();

  return (
    <div className="space-y-4">
      <style>{`
        #markdown-output h1{font-size:2em;font-weight:700;margin:.5em 0}
        #markdown-output h2{font-size:1.5em;font-weight:600;margin:.5em 0;border-bottom:1px solid #e2e8f0;padding-bottom:.3em}
        #markdown-output h3{font-size:1.2em;font-weight:600;margin:.5em 0}
        #markdown-output p{margin:.8em 0;line-height:1.7;color:#374151}
        #markdown-output ul,#markdown-output ol{margin:.5em 0;padding-left:1.5em}
        #markdown-output li{margin:.3em 0}
        #markdown-output code{background:#f1f5f9;padding:.1em .4em;border-radius:4px;font-family:monospace;font-size:.9em;color:#e11d48}
        #markdown-output pre{background:#1e293b;color:#e2e8f0;padding:1em;border-radius:8px;overflow-x:auto;margin:1em 0}
        #markdown-output pre code{background:none;color:#e2e8f0;padding:0}
        #markdown-output blockquote{border-left:4px solid #6366f1;padding-left:1em;margin:1em 0;color:#64748b;font-style:italic}
        #markdown-output table{width:100%;border-collapse:collapse;margin:1em 0}
        #markdown-output th{background:#f8fafc;padding:.5em 1em;border:1px solid #e2e8f0;font-weight:600}
        #markdown-output td{padding:.5em 1em;border:1px solid #e2e8f0}
        #markdown-output hr{border:none;border-top:2px solid #e2e8f0;margin:1.5em 0}
        #markdown-output a{color:#6366f1;text-decoration:underline}
        #markdown-output img{max-width:100%;border-radius:8px}
        @media print{
          body>*{visibility:hidden!important}
          #markdown-output,#markdown-output *{visibility:visible!important}
          #markdown-output{position:fixed;top:0;left:0;width:100%;padding:1in}
        }
      `}</style>

      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View mode */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          {[['editor', '📝 Editor'], ['split', '⧉ Split'], ['preview', '👁 Preview']].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === v ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-3 py-1">{wordCount} words</span>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={copyHtml}
            className="text-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-4 py-2 font-medium transition-colors"
          >
            {copied ? '✅ Copied!' : '📋 Copy HTML'}
          </button>
          <button
            onClick={downloadPdf}
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-medium transition-colors"
          >
            📥 Download PDF
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {(view === 'editor' || view === 'split') && (
        <div className="flex flex-wrap gap-1">
          {TOOLBAR.map((item) => (
            <button
              key={item.label}
              onClick={() => applyFormat(item)}
              title={item.title}
              className="px-3 py-1 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => setMarkdown('')}
            className="px-3 py-1 text-sm bg-white border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-slate-400 transition-colors ml-auto"
          >
            Clear
          </button>
        </div>
      )}

      {/* Editor / Preview panes */}
      <div className={view === 'split' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}>
        {(view === 'editor' || view === 'split') && (
          <textarea
            ref={editorRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={20}
            spellCheck={false}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 resize-y"
            style={{ fontFamily: "'Geist Mono', 'Courier New', monospace", fontSize: '0.875rem', lineHeight: '1.6' }}
            placeholder="Write your Markdown here..."
          />
        )}

        {(view === 'preview' || view === 'split') && (
          <div
            id="markdown-output"
            className="p-4 bg-white rounded-xl border border-slate-200 min-h-80 overflow-auto"
            style={{ minHeight: view === 'split' ? '480px' : '400px' }}
            dangerouslySetInnerHTML={{ __html: marked(markdown) }}
          />
        )}
      </div>
    </div>
  );
}
