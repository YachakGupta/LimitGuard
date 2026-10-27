import React, { useEffect } from 'react';
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
import AppLayout from '../components/AppLayout';
import TokenSavingsChart from '../components/charts/TokenSavingsChart';
import ProtectionActivityChart from '../components/charts/ProtectionActivityChart';
import RiskDistributionChart from '../components/charts/RiskDistributionChart';
import RecentActivityList from '../components/charts/RecentActivityList';

export default function Dashboard() {
  const dispatch = useDispatch();

  const overview = useSelector(selectOverview);
  const tokenSavings = useSelector(selectTokenSavings);
  const activity = useSelector(selectActivity);
  const riskDistribution = useSelector(selectRiskDistribution);
  const recent = useSelector(selectRecentActivity);
  const status = useSelector(selectDashboardStatus);
  const errors = useSelector(selectDashboardErrors);

  const isLoading = status === 'loading' && !overview;

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  // Currency formatter for estimated cost saved
  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 3,
      }).format(num);
    } catch {
      return `₹${num.toFixed(2)}`;
    }
  };

  // 6 KPI cards definition in exact order
  const kpiCards = [
    {
      id: 'total-prompts',
      label: 'Total prompts analyzed',
      value: overview ? (Number(overview.totalPrompts) || 0).toLocaleString() : '0',
      icon: (
        <svg className="w-5 h-5 text-[#6D5AE6] dark:text-[#8B7CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      tintBg: 'bg-[#6D5AE6]/10 dark:bg-[#8B7CF6]/15',
    },
    {
      id: 'sensitive-detections',
      label: 'Sensitive data detections',
      value: overview ? (Number(overview.sensitiveDetections) || 0).toLocaleString() : '0',
      icon: (
        <svg className="w-5 h-5 text-[#D98E04] dark:text-[#F5B942]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      tintBg: 'bg-[#D98E04]/10 dark:bg-[#F5B942]/15',
    },
    {
      id: 'prompts-sanitized',
      label: 'Prompts sanitized',
      value: overview ? (Number(overview.promptsSanitized) || 0).toLocaleString() : '0',
      icon: (
        <svg className="w-5 h-5 text-[#1F9D8A] dark:text-[#4FD1BB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      tintBg: 'bg-[#1F9D8A]/10 dark:bg-[#4FD1BB]/15',
    },
    {
      id: 'prompts-blocked',
      label: 'Prompts blocked',
      value: overview ? (Number(overview.promptsBlocked) || 0).toLocaleString() : '0',
      icon: (
        <svg className="w-5 h-5 text-[#D64545] dark:text-[#FF7A7A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      ),
      tintBg: 'bg-[#D64545]/10 dark:bg-[#FF7A7A]/15',
    },
    {
      id: 'tokens-saved',
      label: 'Total tokens saved',
      value: overview ? (Number(overview.tokensSaved) || 0).toLocaleString() : '0',
      icon: (
        <svg className="w-5 h-5 text-[#6D5AE6] dark:text-[#8B7CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      tintBg: 'bg-[#6D5AE6]/10 dark:bg-[#8B7CF6]/15',
    },
    {
      id: 'cost-saved',
      label: 'Estimated API cost saved',
      value: overview ? formatCurrency(overview.costSaved) : '₹0.00',
      icon: (
        <svg className="w-5 h-5 text-[#1F9D8A] dark:text-[#4FD1BB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      tintBg: 'bg-[#1F9D8A]/10 dark:bg-[#4FD1BB]/15',
    },
  ];

  return (
    <AppLayout title="Security Overview">
      <div className="space-y-6 sm:space-y-8">
        {/* A) KPI GRID (6 cards, responsive: 1 col mobile, 2 col sm, 3 col xl) */}
        <section aria-label="Key Performance Indicators">
          {errors.overview && !overview ? (
            <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#111114] border border-[#FECACA] dark:border-[#991B1B]/40 flex items-center justify-between">
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
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#6D5AE6] hover:bg-[#5B48D6] dark:bg-[#8B7CF6] dark:hover:bg-[#7A6AF0] text-white shadow-sm transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {kpiCards.map((card) => {
                if (isLoading) {
                  return (
                    <div
                      key={card.id}
                      className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-5 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 animate-pulse flex items-center justify-between"
                    >
                      <div className="space-y-2">
                        <div className="h-3.5 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="h-7 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                      </div>
                      <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-800" />
                    </div>
                  );
                }

                return (
                  <div
                    key={card.id}
                    className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] hover:border-[#BDBDD3] dark:hover:border-[#3E3E4B] rounded-2xl p-5 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-medium text-[#55557A] dark:text-[#9A9AB8] truncate">
                        {card.label}
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold tabular-nums text-[#14142B] dark:text-[#FFFFFF] mt-1 tracking-tight">
                        {card.value}
                      </p>
                    </div>

                    <div
                      className={`w-11 h-11 rounded-xl ${card.tintBg} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
                      aria-hidden="true"
                    >
                      {card.icon}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* B) ROW WITH TWO CHARTS (2 columns on lg, stacked on mobile) */}
        <section aria-label="Security Analytics Charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TokenSavingsChart
            data={tokenSavings}
            loading={isLoading}
            error={errors.tokenSavings}
          />
          <ProtectionActivityChart
            data={activity}
            loading={isLoading}
            error={errors.activity}
          />
        </section>

        {/* C) ROW WITH TWO BLOCKS: Privacy Risk Distribution & Recent Activity */}
        <section aria-label="Risk Distribution and Recent Activity" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskDistributionChart
            data={riskDistribution}
            loading={isLoading}
            error={errors.riskDistribution}
          />
          <RecentActivityList
            items={recent}
            loading={isLoading}
            error={errors.recent}
          />
        </section>
      </div>
    </AppLayout>
  );
}
