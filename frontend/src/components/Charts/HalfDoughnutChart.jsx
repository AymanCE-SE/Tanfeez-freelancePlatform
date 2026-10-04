import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import LoadingPreview from '../common/LoadingPreview';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  circumference: 180,
  rotation: -90,
  plugins: {
    legend: { position: 'bottom' },
    title: { display: true, text: 'Customer Payment Status' },
  },
};

export default function HalfDoughnutChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch('/data/dashboardData.json')
      .then(res => res.json())
      .then(data => {
        const halfDoughnut = data.halfDoughnutChart;

        setChartData({
          labels: halfDoughnut.labels,
          datasets: [{
            data: halfDoughnut.values,
            backgroundColor: ['#10b981', '#f43f5e'],
            borderWidth: 1,
          }]
        });
      })
      .catch(err => console.error("Failed to load half doughnut chart data:", err));
  }, []);

  if (!chartData) return <div style={{ height: '200px' }}><LoadingPreview variant="chart" label="Loading payment chart" /></div>;

  return (
    <div style={{ height: '200px' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
