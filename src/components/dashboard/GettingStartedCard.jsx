import React from 'react';
import { Link } from 'react-router-dom';

function getRelativeTime(timeStr) {
  if (!timeStr) return 'Just now';
  try {
    const date = new Date(timeStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (isNaN(diffSec) || diffSec < 0) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export default function GettingStartedCard({ tokenValue, totalPrompts = 0, recent = [] }) {
  const item1Done = true; // "Account created" always checked
  const item2Done = Boolean(tokenValue); // "API token generated"
  const item3Done = Number(totalPrompts) > 0; // "First prompt analyzed"

  const allCompleted = item1Done && item2Done && item3Done;
  const completedCount = [item1Done, item2Done, item3Done].filter(Boolean).length;

  const latestTime = recent?.[0]?.time ? getRelativeTime(recent[0].time) : 'Active now';

  return (
    <div className="rounded-2xl border border-[#E7E7EF] dark:border-[#26262E] bg-[#FFFFFF] dark:bg-[#111114] p-6 sm:p-7 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6D5AE6] dark:text-[#8B7CF6]">
            Setup & Health
          </span>
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-[#55557A] dark:text-[#9A9AB8]">
            {completedCount}/3 Ready
          </span>
        </div>

        <h3 className="text-lg font-bold text-[#14142B] dark:text-[#FFFFFF]">
          {allCompleted ? 'Protection Active' : 'Getting Started'}
        </h3>
        <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-1">
          {allCompleted
            ? 'Your firewall integration is fully operational.'
            : 'Complete these quick steps to fully secure your LLM context.'}
        </p>
      </div>

      {/* Content: All Done State OR Checklist */}
      <div className="my-auto py-4">
        {allCompleted ? (
          <div className="p-4 rounded-xl bg-[#6D5AE6]/5 dark:bg-[#8B7CF6]/10 border border-[#6D5AE6]/20 dark:border-[#8B7CF6]/25 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#14142B] dark:text-[#FFFFFF]">
                You're all set
              </p>
              <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-1 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Last activity: {latestTime}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Checklist Item 1 */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-[#14142B] dark:text-[#FFFFFF] line-through opacity-70">
                Account created
              </span>
            </div>

            {/* Checklist Item 2 */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                {item2Done ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-[#DCDCE6] dark:border-[#3E3E4B] shrink-0" />
                )}
                <span
                  className={`text-xs font-medium ${
                    item2Done ? 'line-through text-[#55557A] dark:text-[#9A9AB8]' : 'text-[#14142B] dark:text-[#FFFFFF]'
                  }`}
                >
                  API token generated
                </span>
              </div>

              {!item2Done && (
                <Link
                  to="/settings"
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#6D5AE6] hover:bg-[#5B48D6] dark:bg-[#8B7CF6] dark:hover:bg-[#7A6AF0] text-white shadow-xs transition-colors shrink-0"
                >
                  Generate token
                </Link>
              )}
            </div>

            {/* Checklist Item 3 */}
            <div className="flex items-center gap-3">
              {item3Done ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-[#DCDCE6] dark:border-[#3E3E4B] shrink-0" />
              )}
              <span
                className={`text-xs font-medium ${
                  item3Done ? 'line-through text-[#55557A] dark:text-[#9A9AB8]' : 'text-[#14142B] dark:text-[#FFFFFF]'
                }`}
              >
                First prompt analyzed
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Progress Bar */}
      <div>
        <div className="w-full bg-[#E7E7EF] dark:bg-[#26262E] h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#6D5AE6] to-[#8B7CF6] transition-all duration-500 rounded-full"
            style={{ width: `${(completedCount / 3) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
