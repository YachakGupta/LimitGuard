import React from 'react';
import { useDispatch } from 'react-redux';
import { retryRecent } from '../../features/dashboard/dashboardSlice';

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

export default function RecentActivityList({ items = [], loading = false, error = null }) {
  const dispatch = useDispatch();

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200">
        <div className="h-5 w-36 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-[#E7E7EF]/60 dark:border-[#26262E]/60 animate-pulse"
            >
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20" />
              </div>
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[300px]">
        <div>
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Recent Activity</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Real-time firewall enforcement log</p>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#14142B] dark:text-[#FFFFFF] mb-1">Failed to load recent activity</p>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] max-w-xs mb-4">{error}</p>
          <button
            type="button"
            onClick={() => dispatch(retryRecent())}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#6D5AE6] hover:bg-[#5B48D6] dark:bg-[#8B7CF6] dark:hover:bg-[#7A6AF0] text-white shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B7CF6]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[300px]">
        <div>
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Recent Activity</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Real-time firewall enforcement log</p>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#6D5AE6]/10 dark:bg-[#8B7CF6]/10 text-[#6D5AE6] dark:text-[#8B7CF6] flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#14142B] dark:text-[#FFFFFF]">No data yet</p>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-1">Activity events will stream in when requests are analyzed.</p>
        </div>
      </div>
    );
  }

  // Display items: max 8 items per view, scrolling inside card if more
  const displayItems = items.slice(0, 8);

  const getActionBadge = (action) => {
    switch (action) {
      case 'sanitized':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <svg className="w-3 h-3 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Sanitized
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 dark:bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/20 shrink-0">
            <svg className="w-3 h-3 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            Blocked
          </span>
        );
      case 'allowed':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
            </svg>
            Allowed
          </span>
        );
    }
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Recent Activity</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Real-time firewall enforcement log</p>
        </div>
        <span className="text-[11px] font-medium text-[#55557A] dark:text-[#9A9AB8] bg-[#F7F7FB] dark:bg-[#1A1A20] px-2.5 py-1 rounded-lg border border-[#E7E7EF] dark:border-[#26262E]">
          {displayItems.length} events
        </span>
      </div>

      {/* Activity List Container (Max 8 rows, scrolls inside card if more) */}
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F7F7FB]/70 dark:bg-[#0D0D10]/80 border border-[#E7E7EF] dark:border-[#26262E] hover:border-[#BDBDD3] dark:hover:border-[#3E3E4B] transition-all duration-150"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#14142B] dark:text-[#FFFFFF] truncate">
                {item.summary}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-mono text-[#55557A] dark:text-[#9A9AB8]">
                  {getRelativeTime(item.time)}
                </span>
              </div>
            </div>

            {getActionBadge(item.action)}
          </div>
        ))}
      </div>
    </div>
  );
}
