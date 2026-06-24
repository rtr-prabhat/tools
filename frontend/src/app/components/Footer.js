export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
          {/* Brand */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xl font-bold mb-3">
              <span>🛠️</span>
              <span>ToolKit Pro</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Free tools for everyone, no signup required. Fast, private, and always available.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Tools
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/#tools" className="hover:text-white transition-colors">Image Tools</a></li>
              <li><a href="/#tools" className="hover:text-white transition-colors">PDF Tools</a></li>
              <li><a href="/#tools" className="hover:text-white transition-colors">Text Tools</a></li>
              <li><a href="/tools/cv-builder" className="hover:text-white transition-colors">CV Builder</a></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Info
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/#tools" className="hover:text-white transition-colors">All Tools</a></li>
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 dark:border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-slate-500">
          © 2025 ToolKit Pro. Built for everyone, free forever.
        </div>
      </div>
    </footer>
  );
}
