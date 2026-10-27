import React, { useState, useRef, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { retryTokenSavings } from '../../features/dashboard/dashboardSlice';

/**
 * Generates round, readable integer ticks (e.g. 0, 5, 10, 15, 20 or 0, 25, 50, 75)
 */
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

export default function TokenSavingsChart({ data = [], loading = false, error = null }) {
  const dispatch = useDispatch();
  const [hoverIndex, setHoverIndex] = useState(null);
  const [rangeFilter, setRangeFilter] = useState('7D'); // '7D' | '30D' | 'All'
  const svgRef = useRef(null);

  // Client-side filtering of points based on range
  const filteredData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    if (rangeFilter === '7D') {
      return data.slice(-7);
    }
    if (rangeFilter === '30D') {
      return data.slice(-30);
    }
    return data;
  }, [data, rangeFilter]);

  // Total tokens in selected range
  const rangeTotal = useMemo(() => {
    return filteredData.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
  }, [filteredData]);

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1.5">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-3.5 w-44 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
        <div className="h-56 w-full flex items-center justify-center bg-gray-50/50 dark:bg-white/[0.02] rounded-xl overflow-hidden animate-pulse">
          <div className="w-full h-full flex flex-col justify-between p-4">
            <div className="w-full h-px bg-gray-200 dark:bg-gray-800" />
            <div className="w-full h-px bg-gray-200 dark:bg-gray-800" />
            <div className="w-full h-px bg-gray-200 dark:bg-gray-800" />
            <div className="w-full h-12 bg-purple-500/10 dark:bg-purple-500/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[340px]">
        <div>
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Token Savings</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Estimated tokens saved over time</p>
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
            onClick={() => dispatch(retryTokenSavings())}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#6D5AE6] hover:bg-[#5B48D6] dark:bg-[#8B7CF6] dark:hover:bg-[#7A6AF0] text-white shadow-xs transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // 0 Points: Friendly empty illustration
  if (filteredData.length === 0) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[340px]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Token Savings</h2>
            <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Estimated tokens saved over time</p>
          </div>
          <div className="flex items-center gap-1 bg-[#F7F7FB] dark:bg-[#0D0D10] p-1 rounded-xl border border-[#E7E7EF] dark:border-[#26262E]">
            {['7D', '30D', 'All'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setRangeFilter(tab)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  rangeFilter === tab
                    ? 'bg-white dark:bg-[#1E1E26] text-[#6D5AE6] dark:text-[#8B7CF6] shadow-xs'
                    : 'text-[#55557A] dark:text-[#9A9AB8]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#6D5AE6]/10 dark:bg-[#8B7CF6]/10 text-[#6D5AE6] dark:text-[#8B7CF6] flex items-center justify-center mb-3">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#14142B] dark:text-[#FFFFFF]">No savings recorded yet</p>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-1">Prompt analytics will chart savings as they are processed.</p>
        </div>
      </div>
    );
  }

  // Dimensions
  const width = 640;
  const height = 240;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 30;
  const padBottom = 35;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Single Point Case: Lollipop & Rounded Column
  if (filteredData.length === 1) {
    const single = filteredData[0];
    const val = Number(single.value) || 0;
    const centerX = padLeft + plotW / 2;
    const baselineY = padTop + plotH;
    const lollipopY = padTop + plotH * 0.35;

    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 flex flex-col justify-between">
        {/* Header with Range Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Token Savings</h2>
            <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Estimated tokens saved over time</p>
          </div>

          <div className="flex items-center gap-1 bg-[#F7F7FB] dark:bg-[#0D0D10] p-1 rounded-xl border border-[#E7E7EF] dark:border-[#26262E] self-start sm:self-auto">
            {['7D', '30D', 'All'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setRangeFilter(tab)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  rangeFilter === tab
                    ? 'bg-white dark:bg-[#1E1E26] text-[#6D5AE6] dark:text-[#8B7CF6] shadow-xs'
                    : 'text-[#55557A] dark:text-[#9A9AB8]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Headline Number */}
        <div className="mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-[#6D5AE6] dark:text-[#8B7CF6]">
            {rangeTotal.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-[#55557A] dark:text-[#9A9AB8] ml-2">tokens saved</span>
        </div>

        {/* Hand-Drawn Single-Point SVG (Lollipop + Faint Baseline) */}
        <div className="relative w-full overflow-hidden select-none">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible" role="img" aria-label="Single point token savings graphic">
            <title>Token Savings - Initial Point</title>
            <desc>Single day record of tokens saved.</desc>

            {/* Faint grid lines */}
            {[0.25, 0.5, 0.75].map((ratio, i) => (
              <line
                key={i}
                x1={padLeft}
                y1={padTop + plotH * ratio}
                x2={width - padRight}
                y2={padTop + plotH * ratio}
                stroke="currentColor"
                className="text-[#E7E7EF] dark:text-[#26262E]"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {/* Baseline */}
            <line
              x1={padLeft}
              y1={baselineY}
              x2={width - padRight}
              y2={baselineY}
              stroke="currentColor"
              className="text-[#E7E7EF] dark:text-[#26262E]"
              strokeWidth="1.5"
            />

            {/* Centered Lollipop Stem */}
            <line
              x1={centerX}
              y1={baselineY}
              x2={centerX}
              y2={lollipopY}
              stroke="#8B7CF6"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Centered Pillar Backdrop */}
            <rect
              x={centerX - 16}
              y={lollipopY}
              width="32"
              height={baselineY - lollipopY}
              rx="8"
              fill="currentColor"
              className="text-purple-500/10 dark:text-purple-500/15"
            />

            {/* Top Glowing Node */}
            <circle cx={centerX} cy={lollipopY} r="9" fill="#6D5AE6" className="dark:fill-[#8B7CF6]" />
            <circle cx={centerX} cy={lollipopY} r="16" fill="#8B7CF6" fillOpacity="0.2" className="animate-ping" />
            <circle cx={centerX} cy={lollipopY} r="4" fill="#FFFFFF" />

            {/* Value Label above node */}
            <g transform={`translate(${centerX}, ${lollipopY - 18})`}>
              <rect x="-42" y="-18" width="84" height="26" rx="7" className="fill-[#14142B] dark:fill-[#FFFFFF] shadow-md" />
              <text x="0" y="-1" textAnchor="middle" className="text-[12px] font-bold font-mono fill-white dark:fill-black">
                {val.toLocaleString()}
              </text>
            </g>

            {/* X-Axis Label */}
            <text x={centerX} y={height - 10} textAnchor="middle" className="text-xs font-semibold fill-[#55557A] dark:fill-[#9A9AB8]">
              {single.label}
            </text>
          </svg>
        </div>

        {/* Friendly helper text */}
        <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] text-center mt-2 font-medium">
          More points appear as you keep using LimitGuard.
        </p>
      </div>
    );
  }

  // 2+ Points: Area Chart with Nice Ticks
  const rawMax = Math.max(...filteredData.map((d) => Number(d.value) || 0), 0);
  const niceTicks = getNiceTicks(rawMax, 4);
  const maxVal = niceTicks[niceTicks.length - 1] || 10;

  const stepX = plotW / (filteredData.length - 1);

  const points = filteredData.map((d, i) => {
    const x = padLeft + i * stepX;
    const y = padTop + plotH - ((Number(d.value) || 0) / maxVal) * plotH;
    return { x, y, ...d };
  });

  // Smooth bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpX2 = curr.x - (curr.x - prev.x) / 2;
    pathD += ` C ${cpX1} ${prev.y}, ${cpX2} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padTop + plotH} L ${points[0].x} ${padTop + plotH} Z`;

  // Pointer tracking
  const handlePointerMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;

    let closestIdx = 0;
    let minDist = Infinity;
    points.forEach((pt, idx) => {
      const dist = Math.abs(pt.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
  };

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 relative flex flex-col justify-between">
      {/* Header with Title and Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Token Savings</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Estimated tokens saved over time</p>
        </div>

        <div className="flex items-center gap-1 bg-[#F7F7FB] dark:bg-[#0D0D10] p-1 rounded-xl border border-[#E7E7EF] dark:border-[#26262E] self-start sm:self-auto">
          {['7D', '30D', 'All'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setRangeFilter(tab);
                setHoverIndex(null);
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                rangeFilter === tab
                  ? 'bg-white dark:bg-[#1E1E26] text-[#6D5AE6] dark:text-[#8B7CF6] shadow-xs'
                  : 'text-[#55557A] dark:text-[#9A9AB8] hover:text-[#14142B] dark:hover:text-[#FFFFFF]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Headline Number on Top-Left */}
      <div className="mb-2">
        <span className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-[#6D5AE6] dark:text-[#8B7CF6]">
          {rangeTotal.toLocaleString()}
        </span>
        <span className="text-xs font-semibold text-[#55557A] dark:text-[#9A9AB8] ml-2">tokens saved in period</span>
      </div>

      {/* Inline Hand-Drawn SVG Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair touch-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
          role="img"
          aria-label="Area chart displaying token savings over time"
        >
          <title>Token Savings Over Time</title>
          <desc>Area chart showing tokens saved across selected reporting period.</desc>

          <defs>
            <linearGradient id="tokenSavingsGradientV2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6D5AE6" stopOpacity="0.35" />
              <stop offset="85%" stopColor="#8B7CF6" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#8B7CF6" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="tokenSavingsStrokeV2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6D5AE6" />
              <stop offset="100%" stopColor="#8B7CF6" />
            </linearGradient>
          </defs>

          {/* Nice integer grid lines */}
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

          {/* Area Fill */}
          <path d={areaD} fill="url(#tokenSavingsGradientV2)" />

          {/* Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#tokenSavingsStrokeV2)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots on points */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === i ? '6' : '3.5'}
              fill="#FFFFFF"
              className="dark:fill-[#111114] transition-all duration-150"
              stroke="#6D5AE6"
              strokeWidth="2"
            />
          ))}

          {/* X Axis Labels (skip labels when crowded) */}
          {points.map((pt, i) => {
            const shouldShow = points.length <= 8 || i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 6) === 0;
            if (!shouldShow) return null;
            return (
              <text
                key={i}
                x={pt.x}
                y={height - 10}
                textAnchor="middle"
                className="text-[11px] font-medium fill-[#55557A] dark:fill-[#9A9AB8]"
              >
                {pt.label}
              </text>
            );
          })}

          {/* Hover Crosshair & Smart Non-Covering Tooltip */}
          {hoveredPoint && (
            <g pointerEvents="none">
              {/* Vertical guideline */}
              <line
                x1={hoveredPoint.x}
                y1={padTop}
                x2={hoveredPoint.x}
                y2={padTop + plotH}
                stroke="#8B7CF6"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />

              {/* Pulsing ring */}
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="7"
                fill="#8B7CF6"
                fillOpacity="0.3"
                className="animate-ping"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="5"
                fill="#FFFFFF"
                className="dark:fill-[#111114]"
                stroke="#6D5AE6"
                strokeWidth="2.5"
              />

              {/* Smart Non-Covering Tooltip (flips left/right/above so it never covers point) */}
              {(() => {
                const ttWidth = 105;
                const ttHeight = 42;
                // Position above point if room, else to side
                let ttX = hoveredPoint.x - ttWidth / 2;
                let ttY = hoveredPoint.y - ttHeight - 12;

                if (ttY < padTop) {
                  ttY = hoveredPoint.y + 12; // Flip below if too high
                }

                if (hoveredPoint.x > width - 110) {
                  ttX = hoveredPoint.x - ttWidth - 10; // Flip left
                  ttY = hoveredPoint.y - ttHeight / 2;
                } else if (hoveredPoint.x < 110) {
                  ttX = hoveredPoint.x + 10; // Flip right
                  ttY = hoveredPoint.y - ttHeight / 2;
                }

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
                      y="16"
                      textAnchor="middle"
                      className="text-[10px] fill-white/70 dark:fill-black/70 font-semibold"
                    >
                      {hoveredPoint.label}
                    </text>
                    <text
                      x={ttWidth / 2}
                      y="32"
                      textAnchor="middle"
                      className="text-[12px] font-mono font-extrabold fill-white dark:fill-black"
                    >
                      {Number(hoveredPoint.value || 0).toLocaleString()} tokens
                    </text>
                  </g>
                );
              })()}
            </g>
          )}

          {/* Invisible overlay capturing pointer events */}
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
            <caption>Token Savings Summary</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Tokens Saved</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((d, i) => (
                <tr key={i}>
                  <td>{d.label}</td>
                  <td>{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
