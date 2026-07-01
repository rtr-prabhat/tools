import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getAllBlogPosts } from "../../data/blogPosts";

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post Not Found – ToolKit Pro" };

  return {
    title: `${post.title} – ToolKit Pro Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <Link href="/blog" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 mb-6">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Blog
      </Link>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-full px-2.5 py-1">
          {post.category}
        </span>
        <span className="text-xs text-slate-400">{post.readTime}</span>
        <span className="text-xs text-slate-400">·</span>
        <span className="text-xs text-slate-400">
          {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">
        {post.title}
      </h1>

      <div className="space-y-6">
        {post.sections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {section.heading}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Explore our free tools related to this topic.
        </p>
        <Link
          href="/#tools"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 text-sm font-medium transition-colors"
        >
          Browse All Tools
        </Link>
      </div>
    </div>
  );
}
