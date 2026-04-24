'use client';

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type ReadinessPoint = {
  name: string;
  score: number;
};

export function DashboardReadinessChart({ readiness }: { readiness: ReadinessPoint[] }) {
  const data = {
    labels: readiness.map((r) => r.name),
    datasets: [
      {
        label: 'Score',
        data: readiness.map((r) => r.score),
        backgroundColor: 'rgba(201,151,58,0.65)',
        borderColor: 'rgba(154,112,40,1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) => `Score: ${ctx.parsed.y ?? 0}/100`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: 'rgba(26,24,20,0.6)',
          font: { size: 11 },
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: 'rgba(26,24,20,0.5)',
          font: { size: 11 },
        },
        grid: { color: 'rgba(26,24,20,0.08)' },
      },
    },
  };

  return (
    <div style={{ height: 220 }}>
      <Bar data={data} options={options} />
    </div>
  );
}
