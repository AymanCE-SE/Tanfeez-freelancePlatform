import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import LoadingPreview from '../common/LoadingPreview';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Weekly Summary' },
  },
};

export default function BarChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch('/data/dashboardData.json')
      .then(res => res.json())
      .then(data => {
        const bar = data.barChart;
        setChartData({
          labels: bar.labels,
          datasets: [
            {
              label: 'This Week',
              data: bar.values,
              backgroundColor: ['#3b82f6', '#10b981', '#ef4444'],
            },
          ],
        });
      })
      .catch(err => console.error("Failed to load bar chart data:", err));
  }, []);

  if (!chartData) return <div style={{ height: '200px' }}><LoadingPreview variant="chart" label="Loading bar chart" /></div>;

  return <div style={{ height: '200px' }}><Bar data={chartData} options={options} /></div>;
}
