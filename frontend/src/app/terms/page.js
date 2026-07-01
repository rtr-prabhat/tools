export const metadata = {
  title: "Terms of Service – ToolKit Pro",
  description: "Terms and conditions for using ToolKit Pro's free online tools.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
        Last updated: July 2026
      </p>

      <div className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Acceptance of terms
          </h2>
          <p>
            By using ToolKit Pro, you agree to these terms. If you do not agree,
            please do not use the site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Free service
          </h2>
          <p>
            ToolKit Pro is provided free of charge, with no account or signup
            required. We reserve the right to modify, suspend, or discontinue any
            tool at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Acceptable use
          </h2>
          <p>You agree not to use ToolKit Pro to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Upload or process illegal, infringing, or harmful content.</li>
            <li>Attempt to disrupt, overload, or gain unauthorized access to our systems.</li>
            <li>Use the tools in a way that violates any applicable law.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Your content
          </h2>
          <p>
            You are solely responsible for any file, text, or data you process
            through ToolKit Pro. You confirm that you have the right to use and
            upload any content you submit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Financial and calculator tools
          </h2>
          <p>
            Calculators such as EMI, SIP, GST, PPF, HRA, and Income Tax tools are
            provided for general informational and estimation purposes only. Results
            are approximate and should not be treated as financial, tax, or legal
            advice. Please consult a qualified professional for decisions involving
            actual finances.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No warranty
          </h2>
          <p>
            ToolKit Pro is provided "as is" without warranties of any kind, express
            or implied. We do not guarantee that any tool will be error-free,
            uninterrupted, or fit for a particular purpose.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Limitation of liability
          </h2>
          <p>
            To the maximum extent permitted by law, ToolKit Pro and its operators
            shall not be liable for any indirect, incidental, or consequential
            damages arising from your use of the site or its tools.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Intellectual property
          </h2>
          <p>
            The ToolKit Pro name, logo, and site design are the property of their
            respective owners. Tool results you generate belong to you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Governing law
          </h2>
          <p>These terms are governed by the laws of India.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Changes to these terms
          </h2>
          <p>
            We may update these terms from time to time. Continued use of the site
            after changes are posted constitutes acceptance of the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
