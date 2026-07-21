/** Provides theme-aware ApexCharts wrappers used by dashboard visualizations. */
import Chart from 'react-apexcharts';
import { useTheme  } from '../../context/ThemeContext';

export function ApexAreaChart({ data, categories, height = 280 }) {
  const { resolved } = useTheme();
  const options = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent', foreColor: resolved === 'dark' ? '#9ca3af' : '#6b7280' },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: resolved === 'dark' ? '#9ca3af' : '#6b7280' } } },
    grid: { borderColor: resolved === 'dark' ? '#2a2e37' : '#e5e7eb', strokeDashArray: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90] } },
    colors: ['#2563eb', '#7c3aed', '#16a34a'],
    tooltip: { theme: resolved === 'dark' ? 'dark' : 'light' },
  };
  return <Chart options={options} series={data} type="area" height={height} />;
}

export function ApexBarChart({ data, categories, height = 280, horizontal = false }) {
  const { resolved } = useTheme();
  const options = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', foreColor: resolved === 'dark' ? '#9ca3af' : '#6b7280' },
    plotOptions: { bar: { borderRadius: 4, horizontal } },
    dataLabels: { enabled: false },
    xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false } },
    grid: { borderColor: resolved === 'dark' ? '#2a2e37' : '#e5e7eb', strokeDashArray: 3 },
    colors: ['#2563eb', '#7c3aed'],
    tooltip: { theme: resolved === 'dark' ? 'dark' : 'light' },
  };
  return <Chart options={options} series={data} type="bar" height={height} />;
}

export function ApexRadialChart({ labels, series, height = 280 }) {
  const { resolved } = useTheme();
  const options = {
    chart: { type: 'radialBar', background: 'transparent', foreColor: resolved === 'dark' ? '#9ca3af' : '#6b7280' },
    plotOptions: { radialBar: { hollow: { size: '40%' }, dataLabels: { name: { fontSize: '12px' }, value: { fontSize: '18px', fontWeight: 700 } } } },
    labels,
    colors: ['#2563eb', '#7c3aed', '#16a34a', '#ea580c'],
    tooltip: { theme: resolved === 'dark' ? 'dark' : 'light' },
  };
  return <Chart options={options} series={series} type="radialBar" height={height} />;
}

export function ApexHeatmapChart({ data, height = 280 }) {
  const { resolved } = useTheme();
  const options = {
    chart: { type: 'heatmap', toolbar: { show: false }, background: 'transparent', foreColor: resolved === 'dark' ? '#9ca3af' : '#6b7280' },
    dataLabels: { enabled: false },
    plotOptions: { heatmap: { radius: 4, colorScale: { ranges: [{ from: 0, to: 20, name: 'Low', color: '#dbeafe' }, { from: 21, to: 50, name: 'Med', color: '#93c5fd' }, { from: 51, to: 80, name: 'High', color: '#3b82f6' }, { from: 81, to: 100, name: 'Peak', color: '#1d4ed8' }] } } },
    tooltip: { theme: resolved === 'dark' ? 'dark' : 'light' },
  };
  return <Chart options={options} series={data} type="heatmap" height={height} />;
}
