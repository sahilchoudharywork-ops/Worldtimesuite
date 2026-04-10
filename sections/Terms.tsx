import React from 'react';

interface TermsProps {
  isDark: boolean;
}

const Terms: React.FC<TermsProps> = ({ isDark }) => {
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
          Terms and Conditions
        </h1>
        <p className={`mt-4 text-xs font-black uppercase tracking-widest ${mutedText}`}>
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <div className="space-y-6">

        <Section title="Acceptance of Terms">
          <p>
            By accessing and using WorldTimeSuite ("the Service") at worldtimesuite.com, you accept
            and agree to be bound by these Terms and Conditions. If you do not agree to these terms,
            please do not use the Service.
          </p>
        </Section>

        <Section title="Use of the Service">
          <p>
            WorldTimeSuite provides free online tools including a time zone converter, stopwatch,
            countdown timer, and calendar. You may use these tools for personal and commercial
            purposes subject to the following conditions:
          </p>
          <ul className="list-none space-y-2 mt-2">
            {[
              'You will not attempt to reverse engineer, copy, or redistribute the Service.',
              'You will not use the Service for any unlawful purpose.',
              'You will not attempt to disrupt or interfere with the Service or its servers.',
              'You will not use automated tools to scrape or extract data from the Service at scale.'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-blue-500 font-black mt-0.5">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Accuracy of Information">
          <p>
            WorldTimeSuite provides time zone conversion and scheduling tools for informational
            purposes only. While we strive for accuracy, we make no warranties or representations
            regarding the accuracy, reliability, or completeness of any time zone data provided.
          </p>
          <p>
            Time zone rules change periodically due to government decisions. We update our data
            regularly but cannot guarantee it reflects the most current rules at all times.
            For time-critical or legal purposes, always verify with an authoritative source.
          </p>
        </Section>

        <Section title="Intellectual Property">
          <p>
            All content on WorldTimeSuite, including but not limited to the design, layout,
            code, graphics, and text, is the property of WorldTimeSuite and is protected by
            applicable intellectual property laws.
          </p>
          <p>
            You may not reproduce, distribute, or create derivative works from any part of
            the Service without our prior written permission.
          </p>
        </Section>

        <Section title="Privacy and Data">
          <p>
            All time zone conversions are processed entirely within your browser. We do not
            store your search queries or conversion history on our servers.
          </p>
          <p>
            We use anonymous analytics to understand how the Service is used. You can opt
            out of analytics tracking via the cookie consent controls on the site. For full
            details on how we handle data, please review our Privacy Policy.
          </p>
        </Section>

        <Section title="Third-Party Services">
          <p>
            WorldTimeSuite uses third-party services including Google Analytics for anonymous
            usage tracking and Google Tag Manager for tag management. These services operate
            under their own terms and privacy policies.
          </p>
          <p>
            We are not responsible for the content or practices of any third-party services
            linked to or used by the Service.
          </p>
        </Section>

        <Section title="Disclaimer of Warranties">
          <p>
            The Service is provided "as is" and "as available" without any warranties of any
            kind, either express or implied. WorldTimeSuite does not warrant that the Service
            will be uninterrupted, error-free, or free of viruses or other harmful components.
          </p>
        </Section>

        <Section title="Limitation of Liability">
          <p>
            To the fullest extent permitted by law, WorldTimeSuite shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising from your
            use of or inability to use the Service, even if we have been advised of the possibility
            of such damages.
          </p>
        </Section>

        <Section title="Changes to These Terms">
          <p>
            We reserve the right to update these Terms and Conditions at any time. Changes will
            be posted on this page with an updated date. Your continued use of the Service after
            any changes constitutes your acceptance of the new terms.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            If you have any questions about these Terms and Conditions, please contact us at{' '}
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

export default Terms;