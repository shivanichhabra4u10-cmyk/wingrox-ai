'use client';

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type TrendPoint = {
  date: string;
  pipeline: number;
  matches: number;
  conversionRate: number;
};

export function ReportsTrendsChart({ trend }: { trend: TrendPoint[] }) {
  const data = {
    labels: trend.map((t) => t.date.slice(5)),
    datasets: [
      {
        label: 'Pipeline (EUR)',
        data: trend.map((t) => t.pipeline),
        borderColor: '#c9973a',
        backgroundColor: 'rgba(201,151,58,0.2)',
        yAxisID: 'y',
        tension: 0.35,
      },
      {
        label: 'Matches',
        data: trend.map((t) => t.matches),
        borderColor: '#2d6b6b',
        backgroundColor: 'rgba(45,107,107,0.2)',
        yAxisID: 'y1',
        tension: 0.35,
      },
      {
        label: 'Conversion %',
        data: trend.map((t) => t.conversionRate),
        borderColor: '#3d6b40',
        backgroundColor: 'rgba(61,107,64,0.2)',
        yAxisID: 'y2',
        tension: 0.35,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: {
        position: 'left' as const,
        grid: { color: 'rgba(26,24,20,0.08)' },
      },
      y1: {
        position: 'right' as const,
        grid: { display: false },
      },
      y2: {
        position: 'right' as const,
        grid: { display: false },
        min: 0,
        max: 20,
      },
    },
  };

  return (
    <div style={{ height: 320 }}>
      <Line data={data} options={options} />
    </div>
  );
}
