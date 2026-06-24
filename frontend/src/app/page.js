import Link from "next/link";
import ToolCard from "./components/ToolCard";

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
  { value: "44+", label: "Tools Available" },
  { value: "100%", label: "Free Forever" },
  { value: "0", label: "Signup Required" },
  { value: "⚡", label: "Instant Results" },
];

export default async function Home() {
  const categories = await getTools();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 sm:py-28 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            ⚡ Free · No Signup · Instant
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white mb-4">
            Your All-in-One{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Online Toolkit
            </span>
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto mt-4 mb-8 leading-relaxed">
            Free tools for image editing, PDF management, text processing, and
            more. Works instantly in your browser — no account needed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#tools"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors text-base"
            >
              Explore All Tools
            </a>
            <Link
              href="/tools/cv-builder"
              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl px-6 py-3 font-medium transition-colors text-base"
            >
              Build Your CV
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-8 sm:gap-16">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{s.value}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tools grid */}
      <section id="tools" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">All Tools</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Pick a tool below — no login, no fees, just results.
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 text-center py-16">
            Could not load tools. Make sure the backend is running on port 5000.
          </p>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => (
              <div key={category.id}>
                {/* Category header */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                    {category.name}
                  </h3>
                </div>

                {/* Tool cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
