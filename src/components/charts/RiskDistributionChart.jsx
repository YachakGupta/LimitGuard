import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { retryRiskDistribution } from '../../features/dashboard/dashboardSlice';

const RISK_PALETTE = {
  low: { light: '#1F9D8A', dark: '#4FD1BB' },
  medium: { light: '#D98E04', dark: '#F5B942' },
  high: { light: '#D64545', dark: '#FF7A7A' },
  other: { light: '#6D5AE6', dark: '#A99BFF' },
};

function getCategoryColor(name, isDark = false) {
  const key = String(name || '').toLowerCase();
  let palette = RISK_PALETTE.other;
  if (key.includes('low')) palette = RISK_PALETTE.low;
  else if (key.includes('med')) palette = RISK_PALETTE.medium;
  else if (key.includes('high') || key.includes('crit')) palette = RISK_PALETTE.high;
  return isDark ? palette.dark : palette.light;
}

function getDisplayName(name) {
  const str = String(name || '').trim();
  if (!str || str.toLowerCase() === 'unknown') {
    return 'Unclassified';
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default function RiskDistributionChart({ data = [], loading = false, error = null }) {
  const dispatch = useDispatch();
  const [hoverIndex, setHoverIndex] = useState(null);

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200">
        <div className="h-5 w-44 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
          <div className="w-36 h-36 rounded-full border-8 border-gray-200 dark:border-gray-800 animate-pulse" />
          <div className="space-y-3 w-40">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[340px]">
        <div>
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Privacy Risk Distribution</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Threat classifications recorded by firewall</p>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#14142B] dark:text-[#FFFFFF] mb-1">Failed to load risk distribution</p>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] max-w-xs mb-4">{error}</p>
          <button
            type="button"
            onClick={() => dispatch(retryRiskDistribution())}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#6D5AE6] hover:bg-[#5B48D6] dark:bg-[#8B7CF6] dark:hover:bg-[#7A6AF0] text-white shadow-xs transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const validItems = data.filter((d) => (Number(d.value) || 0) > 0);
  const total = validItems.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  if (validItems.length === 0 || total === 0) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[340px]">
        <div>
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Privacy Risk Distribution</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Threat classifications recorded by firewall</p>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#D98E04]/10 dark:bg-[#F5B942]/10 text-[#D98E04] dark:text-[#F5B942] flex items-center justify-center mb-3">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#14142B] dark:text-[#FFFFFF]">No risk data yet</p>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-1">Privacy classifications will appear as requests are analyzed.</p>
        </div>
      </div>
    );
  }

  // Geometry: Donut is 160px
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 70;
  const rInner = 46;
  const isSingle = validItems.length === 1;

  // Compute slices
  let currentAngle = -Math.PI / 2;
  const slices = validItems.map((item, idx) => {
    const val = Number(item.value) || 0;
    const fraction = total > 0 ? val / total : 0;
    const angle = fraction * 2 * Math.PI;

    const pad = validItems.length > 1 ? 0.04 : 0;
    const startAngle = currentAngle + pad / 2;
    const endAngle = currentAngle + angle - pad / 2;
    currentAngle += angle;

    const percent = total > 0 ? ((val / total) * 100).toFixed(1) : '0';

    const x0 = cx + rInner * Math.cos(startAngle);
    const y0 = cy + rInner * Math.sin(startAngle);
    const x1 = cx + rOuter * Math.cos(startAngle);
    const y1 = cy + rOuter * Math.sin(startAngle);
    const x2 = cx + rOuter * Math.cos(endAngle);
    const y2 = cy + rOuter * Math.sin(endAngle);
    const x3 = cx + rInner * Math.cos(endAngle);
    const y3 = cy + rInner * Math.sin(endAngle);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const pathData = `M ${x0} ${y0} L ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x0} ${y0} Z`;

    return {
      rawName: item.name,
      displayName: getDisplayName(item.name),
      val,
      percent,
      pathData,
      idx,
    };
  });

  const activeSlice = hoverIndex !== null ? slices[hoverIndex] : null;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 flex flex-col justify-between">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Privacy Risk Distribution</h2>
        <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Threat classifications recorded by firewall</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto">
        {/* Donut graphic (160px) on the left */}
        <div className="relative shrink-0 select-none">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-40 h-40 transform -rotate-90 origin-center overflow-visible"
            role="img"
            aria-label="Donut chart of privacy risk distribution"
          >
            <title>Privacy Risk Distribution</title>
            <desc>Donut chart visualizing distribution of threat levels detected.</desc>

            {isSingle ? (
              // Full continuous ring for single category
              <circle
                cx={cx}
                cy={cy}
                r={(rOuter + rInner) / 2}
                strokeWidth={rOuter - rInner}
                stroke={getCategoryColor(slices[0].rawName, false)}
                fill="none"
                className="transition-all duration-300"
              />
            ) : (
              slices.map((slice) => {
                const isHovered = hoverIndex === slice.idx;
                const color = getCategoryColor(slice.rawName, false);
                return (
                  <path
                    key={slice.idx}
                    d={slice.pathData}
                    fill={color}
                    className="transition-all duration-200 cursor-pointer hover:opacity-90"
                    style={{
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: `${cx}px ${cy}px`,
                    }}
                    onMouseEnter={() => setHoverIndex(slice.idx)}
                    onMouseLeave={() => setHoverIndex(null)}
                  />
                );
              })
            )}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
            {isSingle ? (
              <>
                <span className="text-2xl font-extrabold tabular-nums text-[#14142B] dark:text-[#FFFFFF]">
                  100%
                </span>
                <span className="text-[11px] font-semibold text-[#55557A] dark:text-[#9A9AB8] truncate max-w-[90px] mt-0.5">
                  {slices[0].displayName}
                </span>
              </>
            ) : activeSlice ? (
              <>
                <span className="text-xs font-semibold text-[#6D5AE6] dark:text-[#8B7CF6] uppercase tracking-wider truncate max-w-[90px]">
                  {activeSlice.displayName}
                </span>
                <span className="text-xl font-bold tabular-nums text-[#14142B] dark:text-[#FFFFFF]">
                  {activeSlice.percent}%
                </span>
                <span className="text-[10px] font-mono text-[#55557A] dark:text-[#9A9AB8]">
                  {activeSlice.val.toLocaleString()}
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-semibold text-[#55557A] dark:text-[#9A9AB8] uppercase tracking-wider">
                  Total Risks
                </span>
                <span className="text-2xl font-extrabold tabular-nums text-[#14142B] dark:text-[#FFFFFF] mt-0.5">
                  {total.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend on the right as rows (colored dot + name + count + percent, tabular-nums) */}
        <div className="flex-1 w-full space-y-2 sm:max-w-xs">
          {slices.map((slice) => {
            const isHovered = hoverIndex === slice.idx;
            const color = getCategoryColor(slice.rawName, false);

            return (
              <div
                key={slice.idx}
                onMouseEnter={() => setHoverIndex(slice.idx)}
                onMouseLeave={() => setHoverIndex(null)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                  isHovered || (isSingle && true)
                    ? 'bg-black/5 dark:bg-white/5 font-semibold'
                    : 'text-[#14142B] dark:text-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium truncate text-[#14142B] dark:text-[#FFFFFF]">
                    {slice.displayName}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 tabular-nums font-mono text-xs">
                  <span className="text-[#14142B] dark:text-[#FFFFFF] font-bold">
                    {slice.val.toLocaleString()}
                  </span>
                  <span className="text-[#55557A] dark:text-[#9A9AB8] w-12 text-right font-medium">
                    {slice.percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screen-reader summary */}
      <div className="sr-only">
        <table>
          <caption>Privacy Risk Breakdown</caption>
          <thead>
            <tr>
              <th scope="col">Risk Level</th>
              <th scope="col">Count</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {slices.map((s, i) => (
              <tr key={i}>
                <td>{s.displayName}</td>
                <td>{s.val}</td>
                <td>{s.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
