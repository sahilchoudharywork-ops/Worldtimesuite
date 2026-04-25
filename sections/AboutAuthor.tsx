import React from 'react';

interface AboutAuthorProps {
  isDark: boolean;
}

const AboutAuthor: React.FC<AboutAuthorProps> = ({ isDark }) => {
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-zinc-900';
  const mutedText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const bodyText = isDark ? 'text-zinc-100' : 'text-zinc-700';
  const panelBorder = isDark ? 'border-zinc-800' : 'border-zinc-200';
  const panelBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';

  return (
    <div className={`${bgColor} ${textColor} font-['Helvetica'] p-4 sm:p-8 max-w-4xl mx-auto`}>

      <header className="mb-12">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
          From the Author
        </h1>
      </header>

      <div className="max-w-[740px] space-y-5">

        <p className={`text-base sm:text-[17px] leading-[1.75] ${bodyText}`}>
          Hi, my name is Sahil Choudhary and I am the creator of WorldTimeSuite.
        </p>
        <p className={`text-base sm:text-[17px] leading-[1.75] ${bodyText}`}>
          I am an engineer and I have a knack for building things. This project has been nothing more than a side project — built to learn how to build, to leverage AI to think beyond my own capabilities, and to provide some genuine value to the actual human beings behind the screen.
        </p>
        <p className={`text-base sm:text-[17px] leading-[1.75] ${bodyText}`}>
          I want to confess that I am not a developer by profession or by formal skill. This entire project has been built by me leveraging AI — in order to learn the real-life implementation of AI, and to actually build something tangible.
        </p>
        <p className={`text-base sm:text-[17px] leading-[1.75] ${bodyText}`}>
          This website has also turned into a hobby. I experiment here to pass time, but productively. I have no intention to scale this to a million or a billion viewers — but if that happens, it will be a consequence of some good work and something I'll be proud of.
        </p>
        <p className={`text-base sm:text-[17px] leading-[1.75] ${bodyText}`}>
          I hope you use it and enjoy it. Personally, I like the Globe section the most — it took me the most amount of time and effort to build.
        </p>

        <section className={`border ${panelBorder} rounded-[1.5rem] sm:rounded-[2rem] ${panelBg} p-6 sm:p-8`}>
          <h2 className={`text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-4`}>Get in Touch</h2>
          <p className={`text-base sm:text-[17px] leading-[1.75] ${bodyText}`}>
            If you want to leave me a message or share feedback, please feel free to reach out. I'll be happy to respond and work on your feedback.
          </p>
          <a
            href="mailto:sahil.choudhary@worldtimesuite.com"
            className="inline-block mt-4 text-blue-500 font-bold hover:opacity-70 transition-opacity"
          >
            sahil.choudhary@worldtimesuite.com
          </a>
        </section>

        <div className={`text-base sm:text-[17px] leading-[1.75] ${bodyText} pt-4`}>
          <p>Sincerely,</p>
          <p className={`mt-2 text-xl font-bold ${textColor}`}>Sahil</p>
        </div>

      </div>

      <div className={`mt-16 text-center text-[10px] font-black uppercase tracking-[0.3em] ${mutedText}`}>
        WorldTimeSuite — Global Time, Simplified
      </div>

    </div>
  );
};

export default AboutAuthor;
