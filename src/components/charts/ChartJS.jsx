/** Registers Chart.js primitives and exposes reusable themed chart components. */
import { Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
 } from 'chart.js';
import { Bar, Doughnut, Line  } from 'react-chartjs-2';
import { useTheme  } from '../../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const palette = ['#2563eb', '#7c3aed', '#16a34a', '#ea580c', '#dc2626', '#0891b2', '#db2777', '#4f46e5'];

export function ChartJSLine({ labels, datasets, height = 280 }) {
  const { resolved } = useTheme();
  return (
    <div style={{ height }}>
      <Line
        data={{
          labels,
          datasets: datasets.map((d, i) => ({
            label: d.label,
            data: d.data,
            borderColor: palette[i % palette.length],
            backgroundColor: palette[i % palette.length] + '20',
            tension: 0.35,
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: resolved === 'dark' ? '#9ca3af' : '#6b7280', font: { size: 11 } } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: resolved === 'dark' ? '#9ca3af' : '#6b7280', font: { size: 11 } } },
            y: { grid: { color: resolved === 'dark' ? '#2a2e37' : '#e5e7eb' }, ticks: { color: resolved === 'dark' ? '#9ca3af' : '#6b7280', font: { size: 11 } } },
          },
        }}
      />
    </div>
  );
}

export function ChartJSBar({ labels, datasets, height = 280 }) {
  const { resolved } = useTheme();
  return (
    <div style={{ height }}>
      <Bar
        data={{
          labels,
          datasets: datasets.map((d, i) => ({
            label: d.label,
            data: d.data,
            backgroundColor: palette[i % palette.length],
            borderRadius: 6,
            barPercentage: 0.7,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: resolved === 'dark' ? '#9ca3af' : '#6b7280', font: { size: 11 } } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: resolved === 'dark' ? '#9ca3af' : '#6b7280', font: { size: 11 } } },
            y: { grid: { color: resolved === 'dark' ? '#2a2e37' : '#e5e7eb' }, ticks: { color: resolved === 'dark' ? '#9ca3af' : '#6b7280', font: { size: 11 } } },
          },
        }}
      />
    </div>
  );
}

export function ChartJSDoughnut({ labels, data, height = 280 }) {
  return (
    <div style={{ height }}>
      <Doughnut
        data={{
          labels,
          datasets: [{ data, backgroundColor: palette, borderWidth: 0, hoverOffset: 6 }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: '62%',
          plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } } },
        }}
      />
    </div>
  );
}
