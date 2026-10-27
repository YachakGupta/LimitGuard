import React, { useState, useRef, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { retryActivity } from '../../features/dashboard/dashboardSlice';

function getNiceTicks(maxVal, count = 4) {
  if (maxVal <= 0) return [0, 2, 4];
  if (maxVal <= 4) {
    const ticks = [];
    for (let i = 0; i <= Math.max(maxVal, 3); i++) {
      ticks.push(i);
    }
    return ticks;
  }
  const roughStep = maxVal / count;
  const power = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / power;
  let niceStep;
  if (normalized < 1.5) niceStep = 1;
  else if (normalized < 3) niceStep = 2;
  else if (normalized < 7) niceStep = 5;
  else niceStep = 10;

  const step = Math.max(1, Math.round(niceStep * power));
  const maxTick = Math.ceil(maxVal / step) * step;
  const ticks = [];
  for (let i = 0; i <= maxTick; i += step) {
    ticks.push(Math.round(i));
  }
  return ticks;
}

export default function ProtectionActivityChart({ data = [], loading = false, error = null }) {
  const dispatch = useDispatch();
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  // Totals for legend counts
  const totals = useMemo(() => {
    return data.reduce(
      (acc, d) => ({
        analyzed: acc.analyzed + (Number(d.analyzed) || 0),
        sanitized: acc.sanitized + (Number(d.sanitized) || 0),
        blocked: acc.blocked + (Number(d.blocked) || 0),
      }),
      { analyzed: 0, sanitized: 0, blocked: 0 }
    );
  }, [data]);

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-36 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="h-56 w-full flex items-end justify-between gap-3 p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-xl overflow-hidden animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 flex items-end justify-center gap-1.5 h-full">
              <div className="w-1/3 bg-purple-500/10 rounded-t h-3/4" />
              <div className="w-1/3 bg-amber-500/10 rounded-t h-1/3" />
              <div className="w-1/3 bg-red-500/10 rounded-t h-1/6" />
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
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Protection Activity</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Analyzed, sanitized, and blocked events</p>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#14142B] dark:text-[#FFFFFF] mb-1">Failed to load chart</p>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] max-w-xs mb-4">{error}</p>
          <button
            type="button"
            onClick={() => dispatch(retryActivity())}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#6D5AE6] hover:bg-[#5B48D6] dark:bg-[#8B7CF6] dark:hover:bg-[#7A6AF0] text-white shadow-xs transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[340px]">
        <div>
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Protection Activity</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Analyzed, sanitized, and blocked events</p>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1F9D8A]/10 dark:bg-[#4FD1BB]/10 text-[#1F9D8A] dark:text-[#4FD1BB] flex items-center justify-center mb-3">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#14142B] dark:text-[#FFFFFF]">No activity data yet</p>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-1">Protection events will be logged here.</p>
        </div>
      </div>
    );
  }

  // Dimensions
  const width = 540;
  const height = 240;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 35;
  const padBottom = 35;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const rawMax = Math.max(
    ...data.flatMap((d) => [Number(d.analyzed) || 0, Number(d.sanitized) || 0, Number(d.blocked) || 0]),
    0
  );
  const niceTicks = getNiceTicks(rawMax, 4);
  const maxVal = niceTicks[niceTicks.length - 1] || 10;

  // Clamped bar width: max 28px, min 10px
  const slotWidth = plotW / data.length;
  const barGap = 3;
  const barWidth = Math.max(10, Math.min(28, (slotWidth - 24) / 3));

  const handlePointerMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    const relativeX = mouseX - padLeft;

    if (relativeX < 0 || relativeX > plotW) {
      setHoverIndex(null);
      return;
    }

    const idx = Math.min(data.length - 1, Math.max(0, Math.floor(relativeX / slotWidth)));
    setHoverIndex(idx);
  };

  const hoveredItem = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 relative flex flex-col justify-between">
      {/* Header with Title and Legend with Totals */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Protection Activity</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Prompt outcomes per timeframe</p>
        </div>

        {/* Legend with Counts */}
        <div className="flex items-center gap-3 text-xs select-none flex-wrap">
          <div className="flex items-center gap-1.5 text-[#55557A] dark:text-[#9A9AB8]">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#6D5AE6] dark:bg-[#A99BFF] inline-block shrink-0" />
            <span className="font-medium">Analyzed</span>
            <span className="font-mono font-bold text-[#14142B] dark:text-[#FFFFFF]">{totals.analyzed}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#55557A] dark:text-[#9A9AB8]">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#D98E04] dark:bg-[#F5B942] inline-block shrink-0" />
            <span className="font-medium">Sanitized</span>
            <span className="font-mono font-bold text-[#14142B] dark:text-[#FFFFFF]">{totals.sanitized}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#55557A] dark:text-[#9A9AB8]">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#D64545] dark:bg-[#FF7A7A] inline-block shrink-0" />
            <span className="font-medium">Blocked</span>
            <span className="font-mono font-bold text-[#14142B] dark:text-[#FFFFFF]">{totals.blocked}</span>
          </div>
        </div>
      </div>

      {/* Inline Hand-Drawn SVG Grouped Bar Chart */}
      <div className="relative w-full overflow-hidden select-none mt-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair touch-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
          role="img"
          aria-label="Grouped bar chart displaying protection activity"
        >
          <title>Protection Activity Comparison</title>
          <desc>Bar chart comparing analyzed, sanitized, and blocked events per date.</desc>

          {/* Nice Integer Grid lines */}
          {niceTicks.map((val, i) => {
            const y = padTop + plotH - (val / maxVal) * plotH;
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-[#E7E7EF] dark:text-[#26262E]"
                  strokeDasharray={i === 0 ? undefined : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-[#8B8BA3] dark:fill-[#686882]"
                >
                  {val >= 1000 ? `${Math.round(val / 1000)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Bar Groups (Centered in each slot even if only 1 label) */}
          {data.map((item, i) => {
            const groupCenterX = padLeft + i * slotWidth + slotWidth / 2;
            const totalBarsWidth = 3 * barWidth + 2 * barGap;
            const startX = groupCenterX - totalBarsWidth / 2;

            const isHovered = hoverIndex === i;

            const analyzedVal = Number(item.analyzed) || 0;
            const sanitizedVal = Number(item.sanitized) || 0;
            const blockedVal = Number(item.blocked) || 0;

            const hAnalyzed = Math.max(0, (analyzedVal / maxVal) * plotH);
            const hSanitized = Math.max(0, (sanitizedVal / maxVal) * plotH);
            const hBlocked = Math.max(0, (blockedVal / maxVal) * plotH);

            const yAnalyzed = padTop + plotH - hAnalyzed;
            const ySanitized = padTop + plotH - hSanitized;
            const yBlocked = padTop + plotH - hBlocked;

            return (
              <g key={i} className="transition-opacity duration-150" opacity={hoverIndex === null || isHovered ? 1 : 0.45}>
                {/* Column hover background highlight */}
                {isHovered && (
                  <rect
                    x={groupCenterX - totalBarsWidth / 2 - 8}
                    y={padTop}
                    width={totalBarsWidth + 16}
                    height={plotH}
                    fill="currentColor"
                    className="text-[#6D5AE6]/5 dark:text-[#8B7CF6]/10"
                    rx="8"
                  />
                )}

                {/* Bar 1: Analyzed (Purple) */}
                <rect
                  x={startX}
                  y={yAnalyzed}
                  width={barWidth}
                  height={Math.max(2, hAnalyzed)}
                  rx="3.5"
                  className="fill-[#6D5AE6] dark:fill-[#A99BFF]"
                />

                {/* Bar 2: Sanitized (Amber) */}
                <rect
                  x={startX + barWidth + barGap}
                  y={ySanitized}
                  width={barWidth}
                  height={Math.max(2, hSanitized)}
                  rx="3.5"
                  className="fill-[#D98E04] dark:fill-[#F5B942]"
                />

                {/* Bar 3: Blocked (Red) - With "Blocked 0" Zero-State Marker */}
                {blockedVal > 0 ? (
                  <rect
                    x={startX + (barWidth + barGap) * 2}
                    y={yBlocked}
                    width={barWidth}
                    height={Math.max(2, hBlocked)}
                    rx="3.5"
                    className="fill-[#D64545] dark:fill-[#FF7A7A]"
                  />
                ) : (
                  // Small intentional flat tick for Blocked = 0
                  <g>
                    <rect
                      x={startX + (barWidth + barGap) * 2}
                      y={padTop + plotH - 3}
                      width={barWidth}
                      height="3"
                      rx="1"
                      className="fill-red-400/50 dark:fill-red-400/40"
                    />
                  </g>
                )}

                {/* X Axis Label */}
                <text
                  x={groupCenterX}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors ${
                    isHovered
                      ? 'fill-[#6D5AE6] dark:fill-[#8B7CF6] font-bold'
                      : 'fill-[#55557A] dark:fill-[#9A9AB8]'
                  }`}
                >
                  {item.label}
                </text>
              </g>
            );
          })}

          {/* Tooltip Placed ABOVE the Group & Offset so bars stay fully visible */}
          {hoveredItem && hoverIndex !== null && (
            <g pointerEvents="none">
              {(() => {
                const groupCenterX = padLeft + hoverIndex * slotWidth + slotWidth / 2;
                const ttWidth = 140;
                const ttHeight = 64;
                let ttX = groupCenterX - ttWidth / 2;
                if (ttX < padLeft) ttX = padLeft;
                if (ttX + ttWidth > width - padRight) ttX = width - padRight - ttWidth;

                // Position above group at padTop - 5
                const ttY = Math.max(4, padTop - 25);

                return (
                  <g transform={`translate(${ttX}, ${ttY})`}>
                    <rect
                      width={ttWidth}
                      height={ttHeight}
                      rx="8"
                      className="fill-[#14142B] dark:fill-[#FFFFFF] shadow-xl"
                    />
                    <text
                      x={ttWidth / 2}
                      y="15"
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-white dark:fill-black uppercase tracking-wider"
                    >
                      {hoveredItem.label}
                    </text>
                    <g transform="translate(10, 24)">
                      {/* Analyzed */}
                      <circle cx="4" cy="4" r="3" fill="#A99BFF" />
                      <text x="12" y="7" className="text-[9.5px] fill-white/80 dark:fill-black/80 font-medium">Analyzed:</text>
                      <text x={ttWidth - 20} y="7" textAnchor="end" className="text-[10px] font-mono font-bold fill-white dark:fill-black">
                        {hoveredItem.analyzed}
                      </text>

                      {/* Sanitized */}
                      <circle cx="4" cy="18" r="3" fill="#F5B942" />
                      <text x="12" y="21" className="text-[9.5px] fill-white/80 dark:fill-black/80 font-medium">Sanitized:</text>
                      <text x={ttWidth - 20} y="21" textAnchor="end" className="text-[10px] font-mono font-bold fill-white dark:fill-black">
                        {hoveredItem.sanitized}
                      </text>

                      {/* Blocked */}
                      <circle cx="4" cy="31" r="3" fill="#FF7A7A" />
                      <text x="12" y="34" className="text-[9.5px] fill-white/80 dark:fill-black/80 font-medium">Blocked:</text>
                      <text x={ttWidth - 20} y="34" textAnchor="end" className="text-[10px] font-mono font-bold fill-white dark:fill-black">
                        {hoveredItem.blocked}
                      </text>
                    </g>
                  </g>
                );
              })()}
            </g>
          )}

          {/* Invisible overlay */}
          <rect
            x={padLeft}
            y={padTop}
            width={plotW}
            height={plotH}
            fill="transparent"
            className="cursor-crosshair"
          />
        </svg>

        <div className="sr-only">
          <table>
            <caption>Protection Activity Summary</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Analyzed</th>
                <th scope="col">Sanitized</th>
                <th scope="col">Blocked</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i}>
                  <td>{d.label}</td>
                  <td>{d.analyzed}</td>
                  <td>{d.sanitized}</td>
                  <td>{d.blocked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
