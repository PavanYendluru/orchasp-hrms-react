/** Supplies composable Recharts cards with shared visual styling. */
import { Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
 } from 'recharts';
import { useTheme  } from '../../context/ThemeContext';

const axisStyle = { fontSize: 12, fill: 'hsl(var(--muted-foreground))' };
const gridColor = 'hsl(var(--border))';

function useChartColors() {
  const { resolved } = useTheme();
  return {
    primary: '#2563eb',
    secondary: '#7c3aed',
    success: '#16a34a',
    warning: '#ea580c',
    danger: '#dc2626',
    cyan: '#0891b2',
    pink: '#db2777',
    tooltipBg: resolved === 'dark' ? '#1a1d24' : '#ffffff',
    tooltipBorder: resolved === 'dark' ? '#2a2e37' : '#e5e7eb',
    tooltipText: resolved === 'dark' ? '#f3f4f6' : '#1f2937',
  };
}

const palette = ['#2563eb', '#7c3aed', '#16a34a', '#ea580c', '#dc2626', '#0891b2', '#db2777', '#4f46e5'];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-soft">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-muted-foreground">
          <span className="font-medium" style={{ color: p.color || p.fill }}>
            {p.name}:
          </span>{' '}
          {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

export function AreaChartCard({ data, xKey, series, height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color || palette[i % palette.length]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={s.color || palette[i % palette.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || palette[i % palette.length]} fill={`url(#grad-${s.key})`} strokeWidth={2} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarChartCard({ data, xKey, series, height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color || palette[i % palette.length]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineChartCard({ data, xKey, series, height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || palette[i % palette.length]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PieChartCard({ data, height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RadarChartCard({ data, height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis dataKey="subject" tick={axisStyle} />
        <Radar dataKey="value" stroke={palette[0]} fill={palette[0]} fillOpacity={0.3} />
        <Tooltip content={<ChartTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
