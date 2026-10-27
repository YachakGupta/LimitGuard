import React, { useState, useMemo } from 'react';
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

function getExactTime(timeStr) {
  if (!timeStr) return '';
  try {
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return timeStr;
    return d.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
  } catch {
    return timeStr;
  }
}

// Helper to extract tokens saved if present in summary text
function extractTokensSaved(summary) {
  if (!summary || typeof summary !== 'string') return null;
  const match = summary.match(/(\d[\d,]*)\s*tokens?\s*saved/i);
  return match ? match[1] : null;
}

export default function RecentActivityList({ items = [], loading = false, error = null }) {
  const dispatch = useDispatch();
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Sanitized' | 'Blocked' | 'Allowed'

  // Client-side filtering
  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    if (activeFilter === 'All') return items;
    const target = activeFilter.toLowerCase();
    return items.filter((item) => String(item.action || '').toLowerCase() === target);
  }, [items, activeFilter]);

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 w-36 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-7 w-44 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-start animate-pulse">
              <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0 mt-1" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/5" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[340px]">
        <div>
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Recent Activity</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Real-time firewall enforcement timeline</p>
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
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#6D5AE6] hover:bg-[#5B48D6] dark:bg-[#8B7CF6] dark:hover:bg-[#7A6AF0] text-white shadow-xs transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getActionDetails = (action) => {
    switch (String(action).toLowerCase()) {
      case 'sanitized':
        return {
          nodeColor: 'bg-amber-500 ring-4 ring-amber-500/15',
          badge: (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
              <svg className="w-3 h-3 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Sanitized
            </span>
          ),
        };
      case 'blocked':
        return {
          nodeColor: 'bg-red-500 ring-4 ring-red-500/15',
          badge: (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 dark:bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/20 shrink-0">
              <svg className="w-3 h-3 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
              Blocked
            </span>
          ),
        };
      case 'allowed':
      default:
        return {
          nodeColor: 'bg-emerald-500 ring-4 ring-emerald-500/15',
          badge: (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
              </svg>
              Allowed
            </span>
          ),
        };
    }
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 flex flex-col justify-between">
      {/* Sticky Header with Title, Filter Tabs, and Event Count Chip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E7E7EF]/80 dark:border-[#26262E]/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Recent Activity</h2>
            <span className="text-[11px] font-mono font-bold text-[#6D5AE6] dark:text-[#8B7CF6] bg-[#6D5AE6]/10 dark:bg-[#8B7CF6]/15 px-2 py-0.5 rounded-full">
              {filteredItems.length} events
            </span>
          </div>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Real-time firewall enforcement timeline</p>
        </div>

        {/* Filter Tabs: All | Sanitized | Blocked | Allowed */}
        <div className="flex items-center gap-1 bg-[#F7F7FB] dark:bg-[#0D0D10] p-1 rounded-xl border border-[#E7E7EF] dark:border-[#26262E] self-start sm:self-auto overflow-x-auto max-w-full">
          {['All', 'Sanitized', 'Blocked', 'Allowed'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilter(tab)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === tab
                  ? 'bg-white dark:bg-[#1E1E26] text-[#6D5AE6] dark:text-[#8B7CF6] shadow-xs'
                  : 'text-[#55557A] dark:text-[#9A9AB8] hover:text-[#14142B] dark:hover:text-[#FFFFFF]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Body: Timeline View (Max-height ~420px with inner scroll) */}
      <div className="relative max-h-[380px] overflow-y-auto pr-2 space-y-4">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-[#14142B] dark:text-[#FFFFFF]">No events found</p>
            <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-1">
              No recent records matching the "{activeFilter}" filter.
            </p>
          </div>
        ) : (
          <div className="relative pl-6">
            {/* Continuous Vertical Timeline Line */}
            <div className="absolute left-[7px] top-2 bottom-3 w-0.5 bg-[#E7E7EF] dark:bg-[#26262E]" />

            <div className="space-y-4">
              {filteredItems.map((item, idx) => {
                const { nodeColor, badge } = getActionDetails(item.action);
                const tokensSaved = extractTokensSaved(item.summary);
                const exactTime = getExactTime(item.time);

                return (
                  <div key={item.id || idx} className="relative group">
                    {/* Timeline Node */}
                    <div
                      className={`absolute -left-[23px] top-1.5 w-3 h-3 rounded-full ${nodeColor} transition-transform group-hover:scale-125`}
                    />

                    {/* Timeline Item Content Card */}
                    <div className="p-3 rounded-xl bg-[#F7F7FB]/70 dark:bg-[#0D0D10]/80 border border-[#E7E7EF] dark:border-[#26262E] hover:border-[#BDBDD3] dark:hover:border-[#3E3E4B] transition-all duration-150">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#14142B] dark:text-[#FFFFFF] leading-snug">
                            {item.summary}
                          </p>

                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#55557A] dark:text-[#9A9AB8]">
                            {/* Relative time with tooltip */}
                            <span
                              title={exactTime}
                              className="font-mono cursor-help hover:text-[#14142B] dark:hover:text-[#FFFFFF] underline decoration-dotted underline-offset-2"
                            >
                              {getRelativeTime(item.time)}
                            </span>

                            {/* Tokens saved badge if present */}
                            {tokensSaved && (
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-[#6D5AE6] dark:text-[#8B7CF6]">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                {tokensSaved} tokens saved
                              </span>
                            )}
                          </div>
                        </div>

                        {badge}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
