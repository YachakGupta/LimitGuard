import React, { useState } from 'react';

export default function HeroCard({ user, overview }) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.trim().split(' ')[0] : 'there';

  const totalPrompts = Number(overview?.totalPrompts) || 0;
  const promptsSanitized = Number(overview?.promptsSanitized) || 0;
  const promptsBlocked = Number(overview?.promptsBlocked) || 0;
  const sensitiveDetections = Number(overview?.sensitiveDetections) || 0;
  const tokensSaved = Number(overview?.tokensSaved) || 0;
  const costSaved = Number(overview?.costSaved) || 0;

  // Protection score calculation
  const hasData = totalPrompts > 0;
  const protectedCount = promptsSanitized + promptsBlocked;
  const protectionScore = hasData ? Math.min(100, Math.round((protectedCount / totalPrompts) * 100)) : null;

  // Ring geometry
  const ringSize = 96;
  const strokeWidth = 8;
  const radius = (ringSize - strokeWidth) / 2; // 44
  const circumference = 2 * Math.PI * radius; // ~276.46
  const dashOffset = hasData && protectionScore !== null
    ? circumference - (protectionScore / 100) * circumference
    : circumference;

  // Mini-stats
  const avgTokensPerPrompt = hasData ? (tokensSaved / totalPrompts).toFixed(1) : '--';
  const detectionRate = hasData ? `${((sensitiveDetections / totalPrompts) * 100).toFixed(1)}%` : '--';

  const formatCurrency = (val) => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 3,
      }).format(val);
    } catch {
      return `₹${val.toFixed(2)}`;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E7E7EF] dark:border-[#26262E] p-6 sm:p-7 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] bg-gradient-to-br from-[#F1EEFF] to-[#FFFFFF] dark:from-[#1A1636] dark:to-[#111114] transition-all duration-200 flex flex-col justify-between">
      {/* Subtle dotted-grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20 bg-[radial-gradient(#6D5AE6_1px,transparent_1px)] dark:bg-[radial-gradient(#8B7CF6_1px,transparent_1px)] [background-size:20px_20px]"
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Top Header: Greeting, Status Chip & Ring */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-green shrink-0" />
                Firewall active
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14142B] dark:text-[#FFFFFF]">
                {getGreeting()}, {firstName}
              </h2>
              <p className="text-sm font-medium text-[#55557A] dark:text-[#9A9AB8] mt-1">
                Your AI firewall is protecting every prompt.
              </p>
            </div>
          </div>

          {/* Protection Score Ring */}
          <div className="flex items-center gap-4 bg-white/70 dark:bg-[#151329]/80 backdrop-blur-xs p-3 rounded-2xl border border-white/60 dark:border-white/5 shadow-xs shrink-0 self-stretch sm:self-auto justify-center sm:justify-start">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${ringSize} ${ringSize}`}>
                <title>Protection Score Ring</title>
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-purple-500/15 dark:text-purple-400/15"
                  fill="transparent"
                />
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  stroke="url(#heroRingGrad)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="heroRingGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6D5AE6" />
                    <stop offset="100%" stopColor="#8B7CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg sm:text-xl font-extrabold tabular-nums text-[#14142B] dark:text-[#FFFFFF]">
                  {protectionScore !== null ? `${protectionScore}%` : '--'}
                </span>
              </div>
            </div>

            <div className="pr-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6D5AE6] dark:text-[#8B7CF6]">
                Protection Score
              </p>
              <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">
                Prompts protected
              </p>
              {hasData && (
                <p className="text-[11px] font-mono font-semibold text-[#14142B] dark:text-[#FFFFFF] mt-1">
                  {protectedCount} of {totalPrompts} intercepted
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Divider & Mini-Stats */}
        <div className="mt-6 pt-5 border-t border-purple-500/15 dark:border-purple-400/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="grid grid-cols-3 gap-3 sm:gap-6 flex-1">
              {/* Stat 1 */}
              <div>
                <p className="text-[11px] uppercase font-semibold tracking-wider text-[#55557A] dark:text-[#9A9AB8]">
                  Avg tokens / prompt
                </p>
                <p className="text-lg sm:text-xl font-bold tabular-nums text-[#14142B] dark:text-[#FFFFFF] mt-0.5">
                  {avgTokensPerPrompt}
                </p>
              </div>

              {/* Stat 2 */}
              <div className="border-l border-purple-500/15 dark:border-purple-400/10 pl-3 sm:pl-6">
                <p className="text-[11px] uppercase font-semibold tracking-wider text-[#55557A] dark:text-[#9A9AB8]">
                  Detection rate
                </p>
                <p className="text-lg sm:text-xl font-bold tabular-nums text-[#14142B] dark:text-[#FFFFFF] mt-0.5">
                  {detectionRate}
                </p>
              </div>

              {/* Stat 3 */}
              <div className="border-l border-purple-500/15 dark:border-purple-400/10 pl-3 sm:pl-6">
                <p className="text-[11px] uppercase font-semibold tracking-wider text-[#55557A] dark:text-[#9A9AB8]">
                  Cost saved
                </p>
                <p className="text-lg sm:text-xl font-bold tabular-nums text-[#1F9D8A] dark:text-[#4FD1BB] mt-0.5">
                  {formatCurrency(costSaved)}
                </p>
              </div>
            </div>

            {/* Info tooltip note */}
            <div className="relative flex items-center gap-1.5 text-xs text-[#55557A] dark:text-[#9A9AB8] shrink-0">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
                className="inline-flex items-center gap-1 cursor-help hover:text-[#14142B] dark:hover:text-[#FFFFFF] focus:outline-none"
                aria-label="Information about mini-stats"
              >
                <svg className="w-3.5 h-3.5 text-[#6D5AE6] dark:text-[#8B7CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
                </svg>
                <span className="text-[11px]">calculated from your data</span>
              </button>

              {showTooltip && (
                <div
                  role="tooltip"
                  className="absolute right-0 bottom-full mb-2 w-56 p-2.5 rounded-xl bg-[#14142B] dark:bg-[#FFFFFF] text-white dark:text-[#14142B] text-[11px] leading-tight shadow-xl z-20 pointer-events-none"
                >
                  Metrics are calculated continuously from prompts and detections processed by your LimitGuard firewall.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
