export const metadata = {
  title: "Privacy Policy – ToolKit Pro",
  description: "How ToolKit Pro handles your data when you use our free online tools.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
        Last updated: July 2026
      </p>

      <div className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Overview
          </h2>
          <p>
            ToolKit Pro provides free online tools with no signup or account required.
            This policy explains what data is processed when you use the site and how
            it is handled.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Tools that run entirely in your browser
          </h2>
          <p>
            Most tools on ToolKit Pro — including all calculators, converters, text
            utilities, and games — run entirely on your device. The content you type
            or paste into these tools is never sent to our servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Tools that process files on our server
          </h2>
          <p>
            Image and PDF tools (compress, resize, convert, merge, watermark, etc.)
            require uploading a file to our server for processing. Uploaded files are:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Used only to generate the result you requested.</li>
            <li>Stored temporarily under a randomly generated filename.</li>
            <li>Deleted automatically once you download the result.</li>
            <li>Never viewed by us, shared with third parties, or used for any other purpose.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Cookies and local storage
          </h2>
          <p>
            We use your browser's local storage to remember preferences such as dark
            mode. We do not use cookies to track you across other websites.
          </p>
          <p className="mt-2">
            If ToolKit Pro displays advertising, our advertising partners (including
            Google) may use cookies to serve ads based on your visits to this and
            other sites. You can manage ad personalization through{" "}
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Google's Ad Settings
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Analytics
          </h2>
          <p>
            We may use aggregated, anonymized analytics to understand which tools are
            most useful and improve the site. This data cannot be used to identify you
            personally.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Data we do not collect
          </h2>
          <p>
            ToolKit Pro does not require registration and does not collect names,
            email addresses, or payment information for using any tool.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Changes to this policy
          </h2>
          <p>
            We may update this policy from time to time. Changes will be posted on
            this page with an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Contact
          </h2>
          <p>
            Questions about this policy can be sent via our{" "}
            <a href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Contact page
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
