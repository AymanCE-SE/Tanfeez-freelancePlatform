import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import LoadingPreview from '../common/LoadingPreview';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const options = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { y: { display: false }, x: { display: false } },
};

export default function SmallLineChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch('/data/dashboardData.json')
      .then(res => res.json())
      .then(data => {
        const small = data.smallLineChart;

        setChartData({
          labels: small.labels,
          datasets: [{
            data: small.data,
            borderColor: '#f59e0b',
            tension: 0.4,
          }],
        });
      })
      .catch(err => console.error("Failed to load small line chart data:", err));
  }, []);

  if (!chartData) return <div style={{ height: '100px' }}><LoadingPreview variant="chart" label="Loading small chart" /></div>;

  return <div style={{ height: '100px' }}><Line data={chartData} options={options} /></div>;
}
