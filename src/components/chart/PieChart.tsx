import React from 'react';

// PieChartProps defines the data and options for the pie chart
export interface PieChartData {
  label: string;
  value: number;
  color?: string; // Optional color for each slice
}

export interface PieChartProps {
  data: PieChartData[];
  size?: number; // width/height in px
  innerRadius?: number; // for donut effect (0 = pie)
  legend?: boolean;
  className?: string;
}

// Helper to get total value
const getTotal = (data: PieChartData[]) => data.reduce((sum, d) => sum + d.value, 0);

const defaultColors = [
  '#60a5fa', '#f472b6', '#facc15', '#34d399', '#f87171', '#a78bfa', '#38bdf8', '#fbbf24', '#f472b6', '#818cf8', '#4ade80', '#f87171'
];

const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 140,
  innerRadius = 0,
  legend = true,
  className = '',
}) => {
  const total = getTotal(data);
  let cumulative = 0;

  // Calculate SVG paths for each slice
  const slices = data.map((slice, i) => {
    const value = slice.value;
    const angle = (value / total) * 360;
    const startAngle = cumulative;
    const endAngle = cumulative + angle;
    cumulative += angle;

    // Convert angles to radians
    const startRadians = (startAngle - 90) * (Math.PI / 180);
    const endRadians = (endAngle - 90) * (Math.PI / 180);
    const r = size / 2;
    const ir = innerRadius;

    // Calculate coordinates
    const x1 = r + r * Math.cos(startRadians);
    const y1 = r + r * Math.sin(startRadians);
    const x2 = r + r * Math.cos(endRadians);
    const y2 = r + r * Math.sin(endRadians);

    const largeArcFlag = angle > 180 ? 1 : 0;
    const color = slice.color || defaultColors[i % defaultColors.length];

    let path;
    if (innerRadius > 0) {
      // Donut chart
      const irX1 = r + ir * Math.cos(endRadians);
      const irY1 = r + ir * Math.sin(endRadians);
      const irX2 = r + ir * Math.cos(startRadians);
      const irY2 = r + ir * Math.sin(startRadians);
      path = [
        `M ${x1} ${y1}`,
        `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${irX1} ${irY1}`,
        `A ${ir} ${ir} 0 ${largeArcFlag} 0 ${irX2} ${irY2}`,
        'Z',
      ].join(' ');
    } else {
      // Pie chart
      path = [
        `M ${r} ${r}`,
        `L ${x1} ${y1}`,
        `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z',
      ].join(' ');
    }

    return (
      <path
        key={i}
        d={path}
        fill={color}
        stroke="#23232a"
        strokeWidth={1.5}
      >
        <title>{slice.label}: {slice.value} ({((slice.value / total) * 100).toFixed(1)}%)</title>
      </path>
    );
  });

  return (
    <div className={`flex flex-col items-center ${className}`} style={{ width: size, minWidth: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        {slices}
        {innerRadius > 0 && (
          <circle cx={size/2} cy={size/2} r={innerRadius-1} fill="#18181b" />
        )}
      </svg>
      {legend && (
        <div className="mt-4 flex flex-col gap-1 w-full">
          {data.map((slice, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: slice.color || defaultColors[i % defaultColors.length] }} />
              <span className="flex-1 truncate text-gray-300">{slice.label}</span>
              <span className="text-gray-400">{slice.value} ({((slice.value / total) * 100).toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PieChart;
