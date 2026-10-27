import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { retryRiskDistribution } from '../../features/dashboard/dashboardSlice';

const RISK_COLORS = {
  low: { light: '#1F9D8A', dark: '#4FD1BB' },
  medium: { light: '#D98E04', dark: '#F5B942' },
  high: { light: '#D64545', dark: '#FF7A7A' },
  critical: { light: '#9333EA', dark: '#C084FC' },
  unknown: { light: '#6D5AE6', dark: '#A99BFF' },
};

function getSliceColor(name, isDark = false) {
  const key = String(name || '').toLowerCase();
  const palette = RISK_COLORS[key] || RISK_COLORS.unknown;
  return isDark ? palette.dark : palette.light;
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
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[300px]">
        <div>
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Privacy Risk Distribution</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Categorized threat levels</p>
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
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#6D5AE6] hover:bg-[#5B48D6] dark:bg-[#8B7CF6] dark:hover:bg-[#7A6AF0] text-white shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B7CF6]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[300px]">
        <div>
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Privacy Risk Distribution</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Categorized threat levels</p>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#D98E04]/10 dark:bg-[#F5B942]/10 text-[#D98E04] dark:text-[#F5B942] flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#14142B] dark:text-[#FFFFFF]">No data yet</p>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-1">Privacy risk levels will populate after context analysis.</p>
        </div>
      </div>
    );
  }

  // Geometry
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 82;
  const rInner = 54;
  const padAngle = data.length > 1 ? 0.03 : 0;

  // Compute slice angles
  let currentAngle = -Math.PI / 2;
  const slices = data.map((item, idx) => {
    const val = Number(item.value) || 0;
    const fraction = total > 0 ? val / total : 0;
    const angle = fraction * 2 * Math.PI;

    const startAngle = currentAngle + (padAngle / 2);
    const endAngle = currentAngle + angle - (padAngle / 2);
    currentAngle += angle;

    const percent = total > 0 ? ((val / total) * 100).toFixed(1) : '0';

    // SVG arc coordinates
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
      ...item,
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
        {/* Donut Graphic */}
        <div className="relative shrink-0 select-none">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-48 h-48 sm:w-52 sm:h-52 transform -rotate-90 origin-center overflow-visible"
            role="img"
            aria-label="Donut chart of privacy risk distribution"
          >
            <title>Privacy Risk Distribution</title>
            <desc>Donut chart visualizing distribution of threat levels detected.</desc>

            {slices.map((slice) => {
              const isHovered = hoverIndex === slice.idx;
              const colorLight = getSliceColor(slice.name, false);
              const colorDark = getSliceColor(slice.name, true);

              return (
                <path
                  key={slice.idx}
                  d={slice.pathData}
                  fill={colorLight}
                  className="transition-all duration-200 cursor-pointer hover:opacity-90"
                  style={{
                    fill: `var(--slice-color-${slice.idx}, ${colorLight})`,
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: `${cx}px ${cy}px`,
                  }}
                  onMouseEnter={() => setHoverIndex(slice.idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              );
            })}
          </svg>

          {/* Center Text (Total or Hovered Value) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xs font-semibold text-[#55557A] dark:text-[#9A9AB8] uppercase tracking-wider">
              {activeSlice ? activeSlice.name : 'Total Risks'}
            </span>
            <span className="text-2xl font-bold tabular-nums text-[#14142B] dark:text-[#FFFFFF] mt-0.5">
              {activeSlice ? Number(activeSlice.val).toLocaleString() : Number(total).toLocaleString()}
            </span>
            {activeSlice && (
              <span className="text-[11px] font-semibold text-[#6D5AE6] dark:text-[#8B7CF6]">
                {activeSlice.percent}%
              </span>
            )}
          </div>
        </div>

        {/* Legend with Name, Value, and Percent */}
        <div className="flex-1 w-full space-y-2 sm:max-w-xs">
          {slices.map((slice) => {
            const isHovered = hoverIndex === slice.idx;
            const colorLight = getSliceColor(slice.name, false);

            return (
              <div
                key={slice.idx}
                onMouseEnter={() => setHoverIndex(slice.idx)}
                onMouseLeave={() => setHoverIndex(null)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                  isHovered
                    ? 'bg-black/5 dark:bg-white/5 font-semibold'
                    : 'text-[#14142B] dark:text-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: colorLight }}
                  />
                  <span className="font-medium truncate text-[#14142B] dark:text-[#FFFFFF]">
                    {slice.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 tabular-nums font-mono text-[11px]">
                  <span className="text-[#14142B] dark:text-[#FFFFFF] font-bold">
                    {Number(slice.val).toLocaleString()}
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
                <td>{s.name}</td>
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
