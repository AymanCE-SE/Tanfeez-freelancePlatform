import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import LoadingPreview from '../common/LoadingPreview';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, annotationPlugin, zoomPlugin);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      onClick: (e, legendItem, legend) => {
        const index = legendItem.datasetIndex;
        const chart = legend.chart;
        const meta = chart.getDatasetMeta(index);

        meta.hidden = !meta.hidden;
        chart.update();
      },
      labels: {
        generateLabels: (chart) => {
          const datasets = chart.data.datasets;
          return datasets.map((dataset, i) => ({
            text: dataset.label,
            fillStyle: dataset.borderColor,
            hidden: !chart.getDatasetMeta(i).visible,
            lineWidth: 2,
            strokeStyle: dataset.borderColor,
          }));
        },
      },
    },
    title: {
      display: true,
      text: 'Sales Report',
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || '';
          const value = context.raw || 0;
          return `${label}: $${value}`;
        },
      },
    },
    annotation: {
      annotations: {
        line1: {
          type: 'line',
          yMin: 60,
          yMax: 60,
          borderColor: 'red',
          borderWidth: 2,
          label: {
            content: 'Target',
            enabled: true,
            position: 'end',
          },
        },
      },
    },
    zoom: {
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: 'xy',
      },
      pan: {
        enabled: true,
        mode: 'xy',
      },
    },
  },
};

function Charts() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch('/data/dashboardData.json')
      .then((res) => res.json())
      .then((data) => {
        const line = data.lineChart;

        setChartData({
          labels: line.labels,
          datasets: [
            {
              label: 'Sales',
              data: line.sales,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
            {
              label: 'Expenses',
              data: line.expenses,
              fill: false,
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1,
            },
          ],
        });
      })
      .catch((err) => console.error("Failed to load line chart data:", err));
  }, []);

  if (!chartData) return <div className="chart-container" style={{ width: '100%', height: '400px', margin: '20px auto' }}><LoadingPreview variant="chart" label="Loading chart" /></div>;

  return (
    <div className="chart-container" style={{ width: '100%', height: '400px', margin: '20px auto' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default Charts;
