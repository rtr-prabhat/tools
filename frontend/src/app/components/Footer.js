import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 text-lg sm:text-xl font-bold mb-3 hover:opacity-80 transition-opacity">
              <span>🛠️</span>
              <span>ToolKit Pro</span>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xs">
              Free tools for everyone, no signup required. Fast, private, and always available.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 sm:mb-4">
              Tools
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-400">
              <li><Link href="/#tools" className="hover:text-white transition-colors">Image Tools</Link></li>
              <li><Link href="/#tools" className="hover:text-white transition-colors">PDF Tools</Link></li>
              <li><Link href="/#tools" className="hover:text-white transition-colors">Text Tools</Link></li>
              <li><Link href="/#tools" className="hover:text-white transition-colors">Financial Tools</Link></li>
              <li><Link href="/tools/cv-builder" className="hover:text-white transition-colors">CV Builder</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 sm:mb-4">
              Quick Links
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-400">
              <li><Link href="/#tools" className="hover:text-white transition-colors">All Tools</Link></li>
              <li><Link href="/tools/snake-game" className="hover:text-white transition-colors">Snake Game</Link></li>
              <li><Link href="/tools/memory-game" className="hover:text-white transition-colors">Memory Game</Link></li>
              <li><Link href="/tools/tetris-game" className="hover:text-white transition-colors">Tetris</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 sm:mb-4">
              Company
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <p className="text-center text-xs sm:text-sm text-slate-500">
            © {currentYear} ToolKit Pro. Built for everyone, free forever.
          </p>
        </div>
      </div>
    </footer>
  );
}
