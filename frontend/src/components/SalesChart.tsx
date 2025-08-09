'use client';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function SalesChart({ salesData }: { salesData: any[] }) {
  const data = {
    labels: salesData.map(d => d._id),
    datasets: [
      {
        label: 'Daily Sales',
        data: salesData.map(d => d.dailySales),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Sales Trends (Last 30 Days)' },
    },
  };

  return <Line options={options} data={data} />;
}