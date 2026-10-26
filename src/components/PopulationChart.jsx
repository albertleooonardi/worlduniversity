import React, { useState } from "react";
import { formatCompact, formatNumber } from "../utils/countries";

const WIDTH = 600;
const HEIGHT = 200;
const PAD_Y = 12;

const PopulationChart = ({ history }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (history.length < 2) {
    return (
      <p className="font-inter text-sm text-gray-500">
        No population history available.
      </p>
    );
  }

  const values = history.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const x = (i) => (i / (history.length - 1)) * WIDTH;
  const y = (v) => PAD_Y + (1 - (v - min) / range) * (HEIGHT - PAD_Y * 2);

  const line = history
    .map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

  const first = history[0];
  const last = history[history.length - 1];
  const change = ((last.value - first.value) / first.value) * 100;
  const active = hoverIndex != null ? history[hoverIndex] : last;

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setHoverIndex(
      Math.max(0, Math.min(history.length - 1, Math.round(ratio * (history.length - 1))))
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-poppins text-2xl font-medium text-[#1A202C]">
            {formatNumber(active.value)}
          </p>
          <p className="font-inter text-sm text-gray-500">in {active.year}</p>
        </div>
        <p
          className={`rounded-full px-2.5 py-0.5 font-inter text-xs font-medium ${
            change >= 0
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {change >= 0 ? "+" : ""}
          {change.toFixed(0)}% since {first.year}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-40 w-full cursor-crosshair overflow-visible"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
        role="img"
        aria-label={`Population grew from ${formatCompact(first.value)} in ${
          first.year
        } to ${formatCompact(last.value)} in ${last.year}`}
      >
        <defs>
          <linearGradient id="population-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A202C" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1A202C" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#population-fill)" />
        <path
          d={line}
          fill="none"
          stroke="#1A202C"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {hoverIndex != null && (
          <line
            x1={x(hoverIndex)}
            x2={x(hoverIndex)}
            y1="0"
            y2={HEIGHT}
            stroke="#9CA3AF"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      <div className="mt-2 flex justify-between font-inter text-xs text-gray-400">
        <span>{first.year}</span>
        <span>{last.year}</span>
      </div>
    </div>
  );
};

export default PopulationChart;
