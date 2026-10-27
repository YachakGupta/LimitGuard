import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDashboard,
  retryOverview,
  selectOverview,
  selectTokenSavings,
  selectActivity,
  selectRiskDistribution,
  selectRecentActivity,
  selectDashboardStatus,
  selectDashboardErrors,
} from '../features/dashboard/dashboardSlice';
import { selectCurrentUser } from '../features/auth/authSlice';
import { selectToken } from '../features/token/tokenSlice';
import AppLayout from '../components/AppLayout';
import HeroCard from '../components/dashboard/HeroCard';
import GettingStartedCard from '../components/dashboard/GettingStartedCard';
import TokenSavingsChart from '../components/charts/TokenSavingsChart';
import ProtectionActivityChart from '../components/charts/ProtectionActivityChart';
import RiskDistributionChart from '../components/charts/RiskDistributionChart';
import RecentActivityList from '../components/charts/RecentActivityList';

function getRelativeTime(timeStr) {
  if (!timeStr) return 'just now';
  try {
    const date = new Date(timeStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (isNaN(diffSec) || diffSec < 0) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'recently';
  }
}

export default function Dashboard() {
  const dispatch = useDispatch();

  const user = useSelector(selectCurrentUser);
  const tokenValue = useSelector(selectToken);
  const overview = useSelector(selectOverview);
  const tokenSavings = useSelector(selectTokenSavings);
  const activity = useSelector(selectActivity);
  const riskDistribution = useSelector(selectRiskDistribution);
  const recent = useSelector(selectRecentActivity);
  const status = useSelector(selectDashboardStatus);
  const errors = useSelector(selectDashboardErrors);

  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [, setTick] = useState(0);

  // Keep relative time live-updating automatically every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const isLoading = status === 'loading' && !overview;
  const isRefreshing = status === 'loading';

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const handleRefresh = async () => {
    await dispatch(fetchDashboard());
    setLastUpdated(new Date().toISOString());
  };

  const totalPrompts = Number(overview?.totalPrompts) || 0;
  const sensitiveDetections = Number(overview?.sensitiveDetections) || 0;
  const promptsSanitized = Number(overview?.promptsSanitized) || 0;
  const promptsBlocked = Number(overview?.promptsBlocked) || 0;
  const tokensSaved = Number(overview?.tokensSaved) || 0;
  const costSaved = Number(overview?.costSaved) || 0;

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

  // 6 KPI Cards definition with proportion bars and captions
  const kpiCards = [
    {
      id: 'kpi-total-prompts',
      label: 'Total prompts analyzed',
      value: totalPrompts.toLocaleString(),
      barWidth: '100%',
      barColor: 'bg-[#6D5AE6] dark:bg-[#8B7CF6]',
      caption: 'All time',
      icon: (
        <svg className="w-5 h-5 text-[#6D5AE6] dark:text-[#8B7CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      tintBg: 'bg-[#6D5AE6]/10 dark:bg-[#8B7CF6]/15',
    },
    {
      id: 'kpi-sensitive-detections',
      label: 'Sensitive data detections',
      value: sensitiveDetections.toLocaleString(),
      barWidth: totalPrompts > 0 ? `${Math.min(100, (sensitiveDetections / totalPrompts) * 100)}%` : '0%',
      barColor: 'bg-[#D98E04] dark:bg-[#F5B942]',
      caption: totalPrompts > 0 ? `${Math.round((sensitiveDetections / totalPrompts) * 100)}% of prompts` : '--',
      icon: (
        <svg className="w-5 h-5 text-[#D98E04] dark:text-[#F5B942]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      tintBg: 'bg-[#D98E04]/10 dark:bg-[#F5B942]/15',
    },
    {
      id: 'kpi-prompts-sanitized',
      label: 'Prompts sanitized',
      value: promptsSanitized.toLocaleString(),
      barWidth: totalPrompts > 0 ? `${Math.min(100, (promptsSanitized / totalPrompts) * 100)}%` : '0%',
      barColor: 'bg-[#1F9D8A] dark:bg-[#4FD1BB]',
      caption: totalPrompts > 0 ? `${Math.round((promptsSanitized / totalPrompts) * 100)}% of prompts` : '--',
      icon: (
        <svg className="w-5 h-5 text-[#1F9D8A] dark:text-[#4FD1BB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      tintBg: 'bg-[#1F9D8A]/10 dark:bg-[#4FD1BB]/15',
    },
    {
      id: 'kpi-prompts-blocked',
      label: 'Prompts blocked',
      value: promptsBlocked.toLocaleString(),
      barWidth: totalPrompts > 0 ? `${Math.min(100, (promptsBlocked / totalPrompts) * 100)}%` : '0%',
      barColor: 'bg-[#D64545] dark:bg-[#FF7A7A]',
      caption: totalPrompts > 0 ? `${Math.round((promptsBlocked / totalPrompts) * 100)}% of prompts` : '--',
      icon: (
        <svg className="w-5 h-5 text-[#D64545] dark:text-[#FF7A7A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      ),
      tintBg: 'bg-[#D64545]/10 dark:bg-[#FF7A7A]/15',
    },
    {
      id: 'kpi-tokens-saved',
      label: 'Total tokens saved',
      value: tokensSaved.toLocaleString(),
      barWidth: totalPrompts > 0 ? '100%' : '0%',
      barColor: 'bg-[#6D5AE6] dark:bg-[#8B7CF6]',
      caption: totalPrompts > 0 ? `${(tokensSaved / totalPrompts).toFixed(1)} per prompt` : '--',
      icon: (
        <svg className="w-5 h-5 text-[#6D5AE6] dark:text-[#8B7CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      tintBg: 'bg-[#6D5AE6]/10 dark:bg-[#8B7CF6]/15',
    },
    {
      id: 'kpi-cost-saved',
      label: 'Estimated API cost saved',
      value: formatCurrency(costSaved),
      barWidth: costSaved > 0 ? '100%' : '0%',
      barColor: 'bg-[#1F9D8A] dark:bg-[#4FD1BB]',
      caption: 'Estimated',
      icon: (
        <svg className="w-5 h-5 text-[#1F9D8A] dark:text-[#4FD1BB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      tintBg: 'bg-[#1F9D8A]/10 dark:bg-[#4FD1BB]/15',
    },
  ];

  return (
    <AppLayout
      title="Security Overview"
      onRefresh={handleRefresh}
      contentClassName="p-4 sm:p-6 xl:p-8 max-w-[1600px] w-full mx-auto"
    >
      <div className="space-y-5">
        {/* PAGE SUBTITLE LINE ONLY */}
        <div className="pt-0 pb-1">
          <p className="text-base lg:text-lg text-[#55557A] dark:text-[#9A9AB8] font-normal leading-relaxed break-words">
            Live telemetry and contextual protection statistics • Last updated {getRelativeTime(lastUpdated)}
          </p>
        </div>

        {/* ROW 1: HERO & GETTING STARTED (12-column grid, gap-5) */}
        <div className="grid grid-cols-12 gap-5 animate-fade-up" style={{ animationDelay: '0ms' }}>
          {isLoading ? (
            <>
              <div className="col-span-12 lg:col-span-8 h-64 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
              <div className="col-span-12 lg:col-span-4 h-64 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </>
          ) : (
            <>
              <div className="col-span-12 lg:col-span-8">
                <HeroCard user={user} overview={overview} />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <GettingStartedCard
                  tokenValue={tokenValue}
                  totalPrompts={totalPrompts}
                  recent={recent}
                />
              </div>
            </>
          )}
        </div>

        {/* ROW 2: KPI GRID (6 cards: col-span-12 sm:6 xl:2 each, gap-5) */}
        <section
          aria-label="Key Performance Indicators"
          className="grid grid-cols-12 gap-5 animate-fade-up"
          style={{ animationDelay: '60ms' }}
        >
          {errors.overview && !overview ? (
            <div className="col-span-12 p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111114] border border-[#FECACA] dark:border-[#991B1B]/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#14142B] dark:text-[#FFFFFF]">Failed to load summary metrics</p>
                  <p className="text-xs text-[#55557A] dark:text-[#9A9AB8]">{errors.overview}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => dispatch(retryOverview())}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#6D5AE6] hover:bg-[#5B48D6] dark:bg-[#8B7CF6] dark:hover:bg-[#7A6AF0] text-white shadow-xs transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            kpiCards.map((card, idx) => {
              if (isLoading) {
                return (
                  <div
                    key={card.id}
                    className="col-span-12 sm:col-span-6 xl:col-span-2 bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-5 shadow-xs animate-pulse space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                      <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800" />
                    </div>
                    <div className="h-7 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                );
              }

              return (
                <div
                  key={card.id}
                  className="col-span-12 sm:col-span-6 xl:col-span-2 bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] hover:border-[#BDBDD3] dark:hover:border-[#3E3E4B] rounded-2xl p-5 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex flex-col justify-between group"
                  style={{ animationDelay: `${60 + idx * 25}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-[#55557A] dark:text-[#9A9AB8] leading-tight">
                      {card.label}
                    </p>
                    <div
                      className={`w-9 h-9 rounded-xl ${card.tintBg} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110`}
                      aria-hidden="true"
                    >
                      {card.icon}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-2xl sm:text-[26px] font-extrabold tabular-nums text-[#14142B] dark:text-[#FFFFFF] tracking-tight">
                      {card.value}
                    </p>

                    {/* Thin Proportion Bar */}
                    <div className="mt-2.5 w-full bg-[#E7E7EF] dark:bg-[#26262E] h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${card.barColor} rounded-full transition-all duration-500`}
                        style={{ width: card.barWidth }}
                      />
                    </div>

                    {/* One-Line Caption Below Bar */}
                    <p className="text-[11px] font-medium text-[#55557A] dark:text-[#9A9AB8] mt-1.5 truncate">
                      {card.caption}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* ROW 3: CHARTS (Token Savings col-12 lg:7, Protection Activity col-12 lg:5) */}
        <section
          aria-label="Security Analytics Charts"
          className="grid grid-cols-12 gap-5 animate-fade-up"
          style={{ animationDelay: '120ms' }}
        >
          <div className="col-span-12 lg:col-span-7">
            <TokenSavingsChart
              data={tokenSavings}
              loading={isLoading}
              error={errors.tokenSavings}
            />
          </div>
          <div className="col-span-12 lg:col-span-5">
            <ProtectionActivityChart
              data={activity}
              loading={isLoading}
              error={errors.activity}
            />
          </div>
        </section>

        {/* ROW 4: INSIGHT + LOG (Privacy Risk col-12 lg:5, Recent Activity Timeline col-12 lg:7) */}
        <section
          aria-label="Risk Distribution and Recent Activity"
          className="grid grid-cols-12 gap-5 animate-fade-up"
          style={{ animationDelay: '180ms' }}
        >
          <div className="col-span-12 lg:col-span-5">
            <RiskDistributionChart
              data={riskDistribution}
              loading={isLoading}
              error={errors.riskDistribution}
            />
          </div>
          <div className="col-span-12 lg:col-span-7">
            <RecentActivityList
              items={recent}
              loading={isLoading}
              error={errors.recent}
            />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
