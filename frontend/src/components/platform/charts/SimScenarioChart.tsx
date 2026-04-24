'use client';

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

type SimScenarioChartProps = {
  labels: string[];
  best: number[];
  base: number[];
  worst: number[];
};

export function SimScenarioChart({ labels, best, base, worst }: SimScenarioChartProps) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: 'Best Case',
            data: best,
            borderColor: '#3d6b40',
            backgroundColor: 'rgba(61,107,64,0.10)',
            fill: true,
            tension: 0.35,
            pointRadius: 0,
          },
          {
            label: 'Base Case',
            data: base,
            borderColor: '#c9973a',
            backgroundColor: 'rgba(201,151,58,0.10)',
            fill: true,
            tension: 0.35,
            pointRadius: 0,
          },
          {
            label: 'Worst Case',
            data: worst,
            borderColor: '#8b3a4a',
            backgroundColor: 'rgba(139,58,74,0.08)',
            fill: true,
            tension: 0.35,
            pointRadius: 0,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(26,24,20,0.08)' } },
        },
      }}
    />
  );
}
