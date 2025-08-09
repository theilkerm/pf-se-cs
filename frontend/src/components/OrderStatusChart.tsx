'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function OrderStatusChart({ statusData }: { statusData: any[] }) {
    const data = {
        labels: statusData.map(d => d._id),
        datasets: [
            {
                label: '# of Orders',
                data: statusData.map(d => d.count),
                backgroundColor: [
                    'rgba(255, 159, 64, 0.7)', // Pending
                    'rgba(54, 162, 235, 0.7)', // Processing
                    'rgba(75, 192, 192, 0.7)', // Shipped
                    'rgba(153, 102, 255, 0.7)', // Delivered
                    'rgba(255, 99, 132, 0.7)',  // Cancelled
                ],
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 1,
            }
        ]
    };
    
    const options = {
        responsive: true,
        plugins: {
          legend: { position: 'top' as const },
          title: { display: true, text: 'Order Status Distribution' },
        },
    };

    return <Doughnut data={data} options={options} />;
}