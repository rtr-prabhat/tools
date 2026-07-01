import Link from "next/link";
import { getAllBlogPosts } from "../data/blogPosts";

export const metadata = {
  title: "Blog – ToolKit Pro",
  description: "Guides and articles on personal finance, productivity, and web tools — from the team behind ToolKit Pro.",
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-10 text-center">
        <span className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-3 sm:mb-4">
          📖 ToolKit Pro Blog
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Guides on Finance, Productivity & Web Tools
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Practical, India-focused articles to go along with the tools on this site.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md p-6 transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-full px-2.5 py-1">
                {post.category}
              </span>
              <span className="text-xs text-slate-400">{post.readTime}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {post.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {post.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
