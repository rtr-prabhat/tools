import Link from "next/link";
import ToolSearch from "./components/ToolSearch";
import ParticleField from "./components/ParticleField";

async function getTools() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tools`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

const stats = [
  { value: "44+", label: "Tools Available", icon: "🛠️" },
  { value: "100%", label: "Free Forever", icon: "🎯" },
  { value: "0", label: "Signup Required", icon: "🚫" },
  { value: "⚡", label: "Instant Results", icon: "⚡" },
];

export default async function Home() {
  const categories = await getTools();

  return (
    <>
      {/* Hero Section with 3D Particles */}
      <section className="relative min-h-[80vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950">
        {/* Three.js Particle Background */}
        <div className="absolute inset-0">
          <ParticleField />
        </div>

        {/* Gradient Orbs - hidden on mobile to prevent overflow */}
        <div className="hidden sm:block absolute top-1/4 -left-32 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-float" />
        <div className="hidden sm:block absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-400/20 dark:bg-violet-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-indigo-100 dark:border-indigo-900/50 rounded-full px-5 py-2 mb-8 shadow-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Free · No Signup · Instant
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-slate-900 dark:text-white mb-4 sm:mb-6 animate-fade-in">
            Your All-in-One
            <br />
            <span className="gradient-text">Online Toolkit</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed animate-fade-in px-2 sm:px-0">
            Free tools for image editing, PDF management, text processing, and
            more. Works instantly in your browser — no account needed.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in px-4 sm:px-0">
            <a
              href="#tools"
              className="group inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 sm:px-8 py-3 sm:py-3.5 font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95 sm:hover:-translate-y-0.5"
            >
              <span>Explore All Tools</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <Link
              href="/tools/cv-builder"
              className="group inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-6 sm:px-8 py-3 sm:py-3.5 font-semibold text-sm sm:text-base transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-600 active:scale-95 sm:hover:-translate-y-0.5"
            >
              <span>Build Your CV</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Floating stats preview */}
          <div className="mt-10 sm:mt-16 flex flex-wrap justify-center gap-4 sm:gap-12 animate-fade-in">
            {stats.slice(0, 3).map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg sm:text-2xl font-bold bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {s.icon} {s.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-10 sm:gap-20">
          {stats.map((s) => (
            <div key={s.label} className="text-center group">
              <div className="text-3xl mb-1 transition-transform group-hover:scale-110">{s.icon}</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{s.value}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>        {/* Tools Grid */}
      <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="mb-6 sm:mb-8 text-center">
          <span className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-3 sm:mb-4">
            🚀 Explore All Tools
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white px-2">
            Everything you need,
            <span className="gradient-text"> all in one place</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 sm:mt-3 max-w-xl mx-auto px-4">
            Pick a tool below — no login, no fees, just results.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">🔧</span>
            <p className="text-slate-400 dark:text-slate-500">
              Could not load tools. Make sure the backend is running on port 5000.
            </p>
          </div>
        ) : (
          <ToolSearch categories={categories} />
        )}
      </section>
    </>
  );
}
