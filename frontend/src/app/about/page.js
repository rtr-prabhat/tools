export const metadata = {
  title: "About Us – ToolKit Pro",
  description: "Why ToolKit Pro exists and what we're building.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
        About ToolKit Pro
      </h1>

      <div className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed">
        <p>
          ToolKit Pro is a free collection of everyday online tools — image and PDF
          utilities, text and developer helpers, Indian financial calculators, and a
          few games — built for anyone who needs a quick, reliable tool without
          creating an account or paying a subscription.
        </p>

        <p>
          We built ToolKit Pro around three simple ideas: tools should be instant,
          they should be free, and they shouldn't require you to hand over your
          email address just to use them.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white pt-4">
          What you'll find here
        </h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Image tools — compress, resize, convert, crop, and watermark</li>
          <li>PDF tools — compress and merge documents</li>
          <li>Indian financial calculators — EMI, SIP, GST, PPF, HRA, Income Tax, and more</li>
          <li>Text and developer utilities — JSON formatting, regex testing, hashing, and more</li>
          <li>A resume builder and a few classic games</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white pt-4">
          How we handle your data
        </h2>
        <p>
          Most tools run entirely in your browser — nothing is uploaded anywhere.
          For the few tools that do process files on our server, uploads are deleted
          automatically after your download. See our{" "}
          <a href="/privacy-policy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Privacy Policy
          </a>{" "}
          for details.
        </p>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-white pt-4">
          Get in touch
        </h2>
        <p>
          Have feedback, found a bug, or want to suggest a new tool? Visit our{" "}
          <a href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Contact page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
