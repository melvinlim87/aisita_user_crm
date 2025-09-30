import React from 'react';

export interface RadarChartAxis {
  label: string;
  max?: number; // Optional, default 100
}

export interface RadarChartSeries {
  label: string;
  values: number[]; // Must match axes length
  color?: string; // Optional stroke/fill color
}

export interface RadarChartProps {
  axes: RadarChartAxis[];
  series: RadarChartSeries[];
  size?: number; // px
  maxValue?: number; // fallback max for all axes
  levels?: number; // grid levels
  showLegend?: boolean;
  className?: string;
}

const defaultColors = [
  '#60a5fa', '#f472b6', '#34d399', '#f87171', '#a78bfa', '#facc15', '#38bdf8', '#818cf8', '#4ade80', '#fbbf24'
];

const RadarChart: React.FC<RadarChartProps> = ({
  axes,
  series,
  size = 360,
  maxValue = 100,
  levels = 5,
  showLegend = true,
  className = '',
}) => {
  const numAxes = axes.length;
  const r = size / 2.5 - 48; // padding for legend/labels
  const cx = size / 2.5;
  const cy = size / 2.5;

  // Find max for each axis
  const axisMax = axes.map((a) => a.max ?? maxValue);

  // Draw grid levels
  const gridLevels = Array.from({ length: levels }, (_, i) => (i + 1) / levels);

  // Calculate points for a given series
  const getPoints = (values: number[], axisMax: number[]) =>
    values.map((v, i) => {
      const angle = (2 * Math.PI * i) / numAxes - Math.PI / 2;
      const radius = (v / axisMax[i]) * r;
      return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
    });

  // Axis label positions
  const getLabelPos = (i: number) => {
    const angle = (2 * Math.PI * i) / numAxes - Math.PI / 2;
    const dist = r + 18;
    return [cx + dist * Math.cos(angle), cy + dist * Math.sin(angle)];
  };

  return (
    <div className={`flex flex-col items-center justify-center align-center mx-auto ${className}`} style={{ width: size, minWidth: size }}>
      <svg width={size} height={260} className="block">
        {/* Grid polygons */}
        {gridLevels.map((level, idx) => {
          const points = axisMax.map((max, i) => {
            const angle = (2 * Math.PI * i) / numAxes - Math.PI / 2;
            const radius = level * r;
            return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
          });
          return (
            <polygon
              key={idx}
              points={points.map((p) => p.join(",")).join(" ")}
              fill="none"
              stroke="#444"
              strokeWidth={0.7}
              opacity={0.6}
            />
          );
        })}
        {/* Axis lines */}
        {axes.map((axis, i) => {
          const angle = (2 * Math.PI * i) / numAxes - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          return (
            <line
              key={axis.label}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="#666"
              strokeWidth={1}
              opacity={0.7}
            />
          );
        })}
        {/* Axis labels */}
        {axes.map((axis, i) => {
          const [x, y] = getLabelPos(i);
          const lines = axis.label.split(' ');

          return (
            <text
              key={axis.label}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize={12}
              fill="#e5e7eb"
              style={{ pointerEvents: 'none', fontWeight: 500 }}
            >
              {lines.map((line, idx) => (
                <tspan x={x} dy={idx === 0 ? 0 : 14} key={idx}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
        {/* Data polygons */}
        {series.map((s, idx) => {
          const points = getPoints(s.values, axisMax);
          const color = s.color || defaultColors[idx % defaultColors.length];
          return (
            <polygon
              key={s.label}
              points={points.map((p) => p.join(",")).join(" ")}
              fill={color}
              fillOpacity={0.18}
              stroke={color}
              strokeWidth={2}
            >
              <title>{s.label + ': ' + s.values.join(', ')}</title>
            </polygon>
          );
        })}
        {/* Data points */}
        {series.map((s, idx) => {
          const points = getPoints(s.values, axisMax);
          const color = s.color || defaultColors[idx % defaultColors.length];
          return points.map(([x, y], j) => (
            <circle
              key={s.label + '-pt-' + j}
              cx={x}
              cy={y}
              r={3.5}
              fill={color}
              stroke="#23232a"
              strokeWidth={1}
            />
          ));
        })}
      </svg>
      {showLegend && (
        <div className="mt-4 flex flex-col gap-1 w-full">
          {series.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2 text-xs">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: s.color || defaultColors[i % defaultColors.length] }} />
              <span className="flex-1 truncate text-gray-300">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RadarChart;
