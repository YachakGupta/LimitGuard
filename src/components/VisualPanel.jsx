import React from 'react';
import { Link } from 'react-router-dom';

export default function VisualPanel({
  actionLabel = 'Join Now',
  actionTo = '/register',
}) {
  return (
    <div className="relative hidden md:flex flex-col justify-between w-full h-full p-10 lg:p-16 overflow-hidden bg-gradient-to-br from-[#F1EEFF] to-[#E4DEFF] dark:from-[#05050A] dark:to-[#14112B] border-l border-[#E7E7EF] dark:border-[#26262E] transition-colors duration-200">
      {/* Background Decorative Circles & Dotted Grid */}
      {/* Light circles */}
      <div className="absolute -top-12 -left-12 w-96 h-96 rounded-full bg-[#C7BBFF] opacity-40 dark:hidden blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-96 h-96 rounded-full bg-[#FFD6F3] opacity-30 dark:hidden blur-3xl pointer-events-none" />
      
      {/* Dark circles */}
      <div className="absolute -top-12 -left-12 w-96 h-96 rounded-full bg-[#5B48D6] opacity-0 dark:opacity-25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-96 h-96 rounded-full bg-[#2B6CB0] opacity-0 dark:opacity-15 blur-3xl pointer-events-none" />

      {/* Dotted grid pattern */}
      <div className="absolute inset-0 dotted-grid-light opacity-25 dark:hidden pointer-events-none" />
      <div className="absolute inset-0 dotted-grid-dark opacity-0 dark:opacity-6 pointer-events-none" />

      {/* 1. Top-Right: Pill button */}
      <div className="flex justify-end z-10">
        <Link
          to={actionTo}
          className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold tracking-wide rounded-full bg-[#FFFFFF] dark:bg-[rgba(139,124,246,0.12)] border border-[#D9D4FF] dark:border-[rgba(139,124,246,0.4)] text-[#5B48D6] dark:text-[#B9AEFF] shadow-xs hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6D5AE6]/30 dark:focus:ring-[#8B7CF6]/40"
        >
          {actionLabel}
        </Link>
      </div>

      {/* Center Content: Left-aligned, max-w-xl */}
      <div className="my-auto z-10 max-w-xl text-left space-y-6">
        {/* 2. Eyebrow chip */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#6D5AE6]/10 dark:bg-[rgba(139,124,246,0.12)] border border-[#6D5AE6]/20 dark:border-[rgba(139,124,246,0.25)] text-[#5B48D6] dark:text-[#B9AEFF] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block shrink-0" />
            <span>AI Context Firewall</span>
          </div>
        </div>

        {/* 3. Headline & Subline */}
        <div className="space-y-2">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-[#14142B] dark:text-[#FFFFFF]">
            <span>Send AI only </span>
            <br />
            <span className="bg-gradient-to-r from-[#6D5AE6] to-[#A855F7] dark:from-[#A99BFF] dark:to-[#7C6CF2] bg-clip-text text-transparent">
              what it needs.
            </span>
          </h2>
          <p className="text-base lg:text-lg text-[#55557A] dark:text-[#9A9AB8] font-normal leading-relaxed">
            Less data. Less cost. Better context.
          </p>
        </div>

        {/* 4. THE HERO ELEMENT: Prompt Firewall Glass Card */}
        <div className="rounded-2xl border p-5 backdrop-blur-md bg-white/70 dark:bg-white/5 border-[#E3DEFF] dark:border-white/10 shadow-[0_12px_40px_-12px_rgba(109,90,230,0.18)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] transition-all duration-200">
          <div className="font-mono text-[13px] leading-relaxed space-y-3">
            {/* Block BEFORE */}
            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-black/30 border border-slate-200/70 dark:border-white/5 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  BEFORE
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Unfiltered Prompt</span>
              </div>
              <div className="text-slate-700 dark:text-slate-300">
                Summarize Section 3 of my report.{' '}
                <span className="relative inline-flex items-center px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[12px] font-medium animate-redact-token">
                  PAN: ABCDE1234F
                  <span className="absolute left-0 right-0 top-1/2 h-[2px] bg-rose-600 dark:bg-rose-400 -translate-y-1/2 animate-redact-strike" />
                </span>{' '}
                <span className="relative inline-flex items-center px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[12px] font-medium animate-redact-token">
                  Bank: 0012345678
                  <span className="absolute left-0 right-0 top-1/2 h-[2px] bg-rose-600 dark:bg-rose-400 -translate-y-1/2 animate-redact-strike" />
                </span>
              </div>
            </div>

            {/* Animated Connector */}
            <div className="flex items-center justify-center my-1.5">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6D5AE6]/10 dark:bg-white/10 border border-[#6D5AE6]/20 dark:border-white/10 text-xs font-semibold text-[#5B48D6] dark:text-[#B9AEFF] animate-pulse-connector shadow-2xs">
                <svg
                  className="w-3.5 h-3.5 text-[#6D5AE6] dark:text-[#B9AEFF]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>LimitGuard</span>
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v10.586l3.293-3.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Block AFTER */}
            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-black/30 border border-slate-200/70 dark:border-white/5 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  AFTER
                </span>
                <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">Protected & Optimized</span>
              </div>
              <div className="animate-fade-in-after text-slate-800 dark:text-slate-200">
                Summarize Section 3 from previously uploaded file{' '}
                <span className="font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  R01
                </span>
                .
              </div>
            </div>

            {/* 3 Status Chips below the blocks */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E3DEFF]/80 dark:border-white/10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 animate-pop-chip-1 shadow-2xs">
                <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                PAN removed
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 animate-pop-chip-2 shadow-2xs">
                <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Bank no. removed
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 animate-pop-chip-3 shadow-2xs">
                <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                R01 reused, file not re-sent
              </span>
            </div>
          </div>
        </div>

        {/* 5. 3 compact pills with check icons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/75 dark:bg-white/5 border border-[#D9D4FF] dark:border-white/10 text-[#3B3B55] dark:text-[#C5C5D8] shadow-2xs">
            <svg className="w-3.5 h-3.5 text-[#6D5AE6] dark:text-[#A99BFF] shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Does AI need this?</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/75 dark:bg-white/5 border border-[#D9D4FF] dark:border-white/10 text-[#3B3B55] dark:text-[#C5C5D8] shadow-2xs">
            <svg className="w-3.5 h-3.5 text-[#6D5AE6] dark:text-[#A99BFF] shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Does AI already have this?</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/75 dark:bg-white/5 border border-[#D9D4FF] dark:border-white/10 text-[#3B3B55] dark:text-[#C5C5D8] shadow-2xs">
            <svg className="w-3.5 h-3.5 text-[#6D5AE6] dark:text-[#A99BFF] shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Is this still valid?</span>
          </div>
        </div>
      </div>

      {/* Subtle bottom footer tag */}
      <div className="text-xs text-[#55557A] dark:text-[#9A9AB8] z-10">
        Autonomous context minimization engine
      </div>
    </div>
  );
}
