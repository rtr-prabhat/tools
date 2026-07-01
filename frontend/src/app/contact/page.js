export const metadata = {
  title: "Contact Us – ToolKit Pro",
  description: "Get in touch with the ToolKit Pro team.",
};

const CONTACT_EMAIL = "support@toolkitpro.com";

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
        Contact Us
      </h1>

      <div className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed">
        <p>
          Have a question, found a bug, or want to suggest a new tool? We'd love to
          hear from you.
        </p>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Email us
          </h2>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            We typically respond within 2–3 business days.
          </p>
        </div>

        <p className="text-sm text-slate-400 dark:text-slate-500">
          For privacy-related questions, please see our{" "}
          <a href="/privacy-policy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Privacy Policy
          </a>.
        </p>
      </div>
    </div>
  );
}
