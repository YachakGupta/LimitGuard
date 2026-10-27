import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { retryTokenSavings } from '../../features/dashboard/dashboardSlice';

export default function TokenSavingsChart({ data = [], loading = false, error = null }) {
  const dispatch = useDispatch();
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="h-56 w-full flex items-center justify-center bg-gray-50/50 dark:bg-white/[0.02] rounded-xl overflow-hidden">
          <div className="w-full h-full flex flex-col justify-between p-4 animate-pulse">
            <div className="w-full h-px bg-gray-200 dark:bg-gray-800" />
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
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[300px]">
        <div>
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Token Savings</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Tokens saved over time</p>
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
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#6D5AE6] hover:bg-[#5B48D6] dark:bg-[#8B7CF6] dark:hover:bg-[#7A6AF0] text-white shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B7CF6]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[300px]">
        <div>
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Token Savings</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Tokens saved over time</p>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#6D5AE6]/10 dark:bg-[#8B7CF6]/10 text-[#6D5AE6] dark:text-[#8B7CF6] flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#14142B] dark:text-[#FFFFFF]">No data yet</p>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-1">Analytics will appear as requests are processed.</p>
        </div>
      </div>
    );
  }

  // Dimensions
  const width = 560;
  const height = 230;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const rawMax = Math.max(...data.map((d) => d.value || 0), 0);
  const maxVal = rawMax === 0 ? 100 : Math.ceil(rawMax * 1.15);

  const numGridLines = 4;
  const gridTicks = Array.from({ length: numGridLines + 1 }, (_, i) => {
    const val = Math.round((maxVal / numGridLines) * i);
    const y = padTop + plotH - (val / maxVal) * plotH;
    return { val, y };
  });

  const stepX = data.length > 1 ? plotW / (data.length - 1) : plotW;

  const points = data.map((d, i) => {
    const x = padLeft + (data.length === 1 ? plotW / 2 : i * stepX);
    const y = padTop + plotH - ((d.value || 0) / maxVal) * plotH;
    return { x, y, ...d };
  });

  // Build SVG path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    // Smooth bezier curve control points
    const prev = points[i - 1];
    const curr = points[i];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpX2 = curr.x - (curr.x - prev.x) / 2;
    pathD += ` C ${cpX1} ${prev.y}, ${cpX2} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padTop + plotH} L ${points[0].x} ${padTop + plotH} Z`;

  // Pointer event tracking for hover tooltip
  const handlePointerMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;

    // Find nearest point
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

  function formatK(val) {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${Math.round(val / 1000)}k`;
    return String(val);
  }

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#111114] border border-[#E7E7EF] dark:border-[#26262E] rounded-2xl p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,16,40,0.04),0_12px_32px_-12px_rgba(80,60,200,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-semibold text-[#14142B] dark:text-[#FFFFFF]">Token Savings</h2>
          <p className="text-xs text-[#55557A] dark:text-[#9A9AB8] mt-0.5">Tokens saved per timeframe</p>
        </div>
        {hoveredPoint && (
          <div className="text-right">
            <span className="text-xs font-medium text-[#55557A] dark:text-[#9A9AB8] mr-1.5">{hoveredPoint.label}:</span>
            <span className="text-sm font-bold tabular-nums text-[#6D5AE6] dark:text-[#8B7CF6]">
              {Number(hoveredPoint.value || 0).toLocaleString()}
            </span>
          </div>
        )}
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
          <desc>Area chart showing token count saved across recent reporting dates.</desc>

          <defs>
            <linearGradient id="tokenSavingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6D5AE6" stopOpacity="0.32" />
              <stop offset="85%" stopColor="#8B7CF6" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#8B7CF6" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="tokenSavingsLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6D5AE6" />
              <stop offset="100%" stopColor="#8B7CF6" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridTicks.map(({ val, y }, i) => (
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
                {formatK(val)}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          <path d={areaD} fill="url(#tokenSavingsGradient)" />

          {/* Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#tokenSavingsLineGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X Axis Labels */}
          {points.map((pt, i) => (
            <text
              key={i}
              x={pt.x}
              y={height - 10}
              textAnchor="middle"
              className="text-[11px] font-medium fill-[#55557A] dark:fill-[#9A9AB8]"
            >
              {pt.label}
            </text>
          ))}

          {/* Hover effects */}
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

              {/* Point outer halo & inner circle */}
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="6"
                fill="#8B7CF6"
                fillOpacity="0.25"
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

              {/* Tooltip Card */}
              <g
                transform={`translate(${
                  hoveredPoint.x > width - 110
                    ? hoveredPoint.x - 100
                    : hoveredPoint.x < 110
                    ? hoveredPoint.x + 10
                    : hoveredPoint.x - 45
                }, ${Math.max(10, hoveredPoint.y - 48)})`}
              >
                <rect
                  width="90"
                  height="36"
                  rx="8"
                  className="fill-[#14142B] dark:fill-[#FFFFFF] shadow-lg"
                />
                <text
                  x="45"
                  y="15"
                  textAnchor="middle"
                  className="text-[10px] fill-white/70 dark:fill-black/70 font-medium"
                >
                  {hoveredPoint.label}
                </text>
                <text
                  x="45"
                  y="29"
                  textAnchor="middle"
                  className="text-[11px] font-mono font-bold fill-white dark:fill-black"
                >
                  {formatK(hoveredPoint.value)} tokens
                </text>
              </g>
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

        {/* Screen-reader accessible table fallback */}
        <div className="sr-only">
          <table>
            <caption>Token Savings Table Summary</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Tokens Saved</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
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
