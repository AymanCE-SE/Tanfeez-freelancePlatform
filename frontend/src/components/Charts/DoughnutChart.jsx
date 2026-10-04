import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import LoadingPreview from '../common/LoadingPreview';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  plugins: {
    legend: { position: 'right' },
    title: { display: true, text: 'Top Coupons' },
  },
};

export default function DoughnutChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch('/data/dashboardData.json')
      .then(res => res.json())
      .then(data => {
        const doughnut = data.doughnutChart;

        setChartData({
          labels: doughnut.labels,
          datasets: [
            {
              data: doughnut.values,
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
            },
          ],
        });
      })
      .catch(err => console.error("Failed to load doughnut chart data:", err));
  }, []);

  if (!chartData) return <div style={{ height: '250px' }}><LoadingPreview variant="chart" label="Loading doughnut chart" /></div>;

  return (
    <div style={{ height: '250px' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
