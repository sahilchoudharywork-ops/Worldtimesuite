import React from 'react';

interface PrivacyProps {
  isDark: boolean;
}

const Privacy: React.FC<PrivacyProps> = ({ isDark }) => {
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-black';
  const mutedText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const panelBorder = isDark ? 'border-zinc-800' : 'border-zinc-200';
  const panelBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className={`border ${panelBorder} rounded-[1.5rem] sm:rounded-[2rem] ${panelBg} p-6 sm:p-10`}>
      <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-4">{title}</h2>
      <div className={`text-sm sm:text-base font-bold leading-relaxed ${mutedText} space-y-3`}>
        {children}
      </div>
    </div>
  );

  return (
    <div className={`${bgColor} ${textColor} font-['Helvetica'] p-4 sm:p-8 max-w-4xl mx-auto`}>

      <header className="mb-12 sm:mb-16">
        <div className={`flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] ${mutedText} mb-6`}>
          <div className="w-10 sm:w-20 h-px bg-current"></div>Legal
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter">
          Privacy Policy
        </h1>
        <p className={`mt-4 text-xs font-black uppercase tracking-widest ${mutedText}`}>
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <div className="space-y-6">

        <Section title="Overview">
          <p>
            This Privacy Policy describes how WorldTimeSuite ("we", "our", or "the Service") at
            worldtimesuite.com collects, uses, and shares information when you visit our website.
            By using WorldTimeSuite, you agree to the practices described in this policy.
          </p>
        </Section>

        <Section title="Information We Collect">
          <p>
            WorldTimeSuite is designed with privacy in mind. All time zone conversions are
            processed entirely within your browser — we do not transmit your search queries,
            conversion history, or any personal information to our servers.
          </p>
          <p>
            We collect the following limited, anonymous information through third-party analytics:
          </p>
          <ul className="list-none space-y-2 mt-2">
            {[
              'Pages visited and time spent on the site (anonymous)',
              'Browser type, device type, and operating system (anonymous)',
              'Approximate geographic region based on IP address (country/city level only)',
              'Referring website or search query that brought you to our site',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-blue-500 font-black mt-0.5">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            We do not collect names, email addresses, payment information, or any other
            personally identifiable information unless you contact us directly.
          </p>
        </Section>

        {/* ── ADSENSE-REQUIRED SECTION ─────────────────────────────────────────
            Google AdSense requires explicit disclosure of:
            1. Third-party vendors (including Google) use cookies to serve ads
            2. Google advertising cookies track prior site visits
            3. Users can opt out via Google Ads Settings
            Source: https://support.google.com/adsense/answer/1348695
        ── */}
        <Section title="Advertising and Cookies">
          <p>
            WorldTimeSuite uses Google AdSense to display advertisements. Google AdSense uses
            cookies to serve ads based on your prior visits to this website and other websites
            on the internet.
          </p>
          <p>
            Third-party vendors, including Google, use cookies to serve ads based on a user's
            prior visits to worldtimesuite.com or other websites. Google's use of advertising
            cookies enables it and its partners to serve ads to you based on your visit to our
            site and/or other sites on the internet.
          </p>
          <p>
            You may opt out of personalised advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:opacity-70 transition-opacity"
            >
              Google Ads Settings
            </a>
            . Alternatively, you can opt out of a third-party vendor's use of cookies for
            interest-based advertising by visiting{' '}
            <a
              href="https://www.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:opacity-70 transition-opacity"
            >
              aboutads.info
            </a>
            .
          </p>
          <p>
            If you prefer, you can choose to have your computer warn you each time a cookie is
            being sent, or you can choose to turn off all cookies, via your browser settings.
            Note that disabling cookies may affect the functionality of some parts of this site.
          </p>
        </Section>

        <Section title="Google Analytics">
          <p>
            We use Google Analytics to understand how visitors use WorldTimeSuite. Google
            Analytics collects anonymous usage data using cookies and similar tracking technologies.
            This data is aggregated and does not identify individual users.
          </p>
          <p>
            You can opt out of Google Analytics tracking by installing the{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:opacity-70 transition-opacity"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            Cookies are small text files stored on your device by your browser. WorldTimeSuite
            and its third-party partners (including Google) use cookies for the following purposes:
          </p>
          <ul className="list-none space-y-2 mt-2">
            {[
              'Analytics — to understand how visitors use the site (Google Analytics)',
              'Advertising — to serve relevant ads based on browsing history (Google AdSense)',
              'Preferences — to remember your display settings such as light or dark mode',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-blue-500 font-black mt-0.5">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            You can control cookie settings through the cookie consent banner on this site
            or through your browser's privacy settings.
          </p>
        </Section>

        <Section title="Data Sharing">
          <p>
            We do not sell, trade, or rent your personal information to any third party.
            Anonymous analytics data is shared with Google Analytics solely for the purpose
            of understanding site usage. Advertising data is handled by Google AdSense under
            Google's own privacy policy.
          </p>
          <p>
            We may disclose information if required by law, regulation, or legal process.
          </p>
        </Section>

        <Section title="Children's Privacy">
          <p>
            WorldTimeSuite does not knowingly collect any personal information from children
            under the age of 13. If you believe a child has provided personal information
            through our site, please contact us and we will take steps to remove it.
          </p>
        </Section>

        <Section title="Your Rights">
          <p>
            Depending on your location, you may have the following rights regarding your data:
          </p>
          <ul className="list-none space-y-2 mt-2">
            {[
              'The right to access information we hold about you',
              'The right to request correction or deletion of your data',
              'The right to opt out of interest-based advertising',
              'The right to opt out of analytics tracking',
              'The right to withdraw consent at any time',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-blue-500 font-black mt-0.5">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            Since we do not store personal data on our servers, most data rights requests
            should be directed to Google (for Analytics and AdSense data) at{' '}
            <a
              href="https://myaccount.google.com/data-and-privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:opacity-70 transition-opacity"
            >
              Google's Data & Privacy page
            </a>
            .
          </p>
        </Section>

        <Section title="Third-Party Links">
          <p>
            WorldTimeSuite may contain links to third-party websites. We are not responsible
            for the privacy practices or content of those websites. We encourage you to review
            the privacy policies of any third-party sites you visit.
          </p>
        </Section>

        <Section title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on
            this page with an updated date. Your continued use of WorldTimeSuite after any
            changes constitutes your acceptance of the updated policy.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            If you have any questions about this Privacy Policy or our data practices,
            please contact us at{' '}
            <a
              href="mailto:hello@worldtimesuite.com"
              className="text-blue-500 hover:opacity-70 transition-opacity"
            >
              hello@worldtimesuite.com
            </a>
          </p>
        </Section>

      </div>

      <div className={`mt-12 text-center text-[10px] font-black uppercase tracking-[0.3em] ${mutedText}`}>
        WorldTimeSuite — Global Time, Simplified
      </div>

    </div>
  );
};

export default Privacy;