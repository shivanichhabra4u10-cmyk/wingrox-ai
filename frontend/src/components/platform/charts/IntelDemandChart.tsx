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

export function IntelDemandChart() {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: 'Germany',
            data: [58, 60, 61, 64, 66, 68, 70, 72, 74, 73, 75, 78],
            borderColor: '#c9973a',
            backgroundColor: 'rgba(201,151,58,0.15)',
            fill: true,
            tension: 0.35,
            pointRadius: 0,
          },
          {
            label: 'Netherlands',
            data: [54, 55, 56, 58, 60, 62, 63, 65, 66, 68, 69, 70],
            borderColor: '#2d6b6b',
            backgroundColor: 'rgba(45,107,107,0.08)',
            fill: true,
            tension: 0.35,
            pointRadius: 0,
          },
          {
            label: 'UK',
            data: [51, 52, 54, 55, 56, 57, 59, 61, 62, 63, 64, 65],
            borderColor: '#3a4f6b',
            backgroundColor: 'rgba(58,79,107,0.08)',
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
