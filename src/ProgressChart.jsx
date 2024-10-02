// ProgressChart.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components and the datalabels plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

const ProgressChart = ({
  dailyData,
  accumulatedData,
  goalLineDaily,
  goalLineAccumulated,
  labels,
  hoursData,
  sleepData,
  workoutData,
  isAccumulatedView,
  toggleChartView,
  selectedTab,
}) => {
  const datasets = [];

  if (selectedTab === 'Work Activity' || selectedTab === 'All') {
    // Add earnings datasets
    datasets.push(
      // Earnings Line
      {
        type: 'line',
        label: 'Earnings (USD)',
        data: isAccumulatedView ? accumulatedData : dailyData,
        borderColor: '#58CC02',
        backgroundColor: 'rgba(88, 204, 2, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        yAxisID: 'y1',
        datalabels: {
          display: false,
        },
      },
      // Goal Line
      {
        type: 'line',
        label: 'Goal',
        data: isAccumulatedView ? goalLineAccumulated : goalLineDaily,
        borderColor: '#FF6384',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
        yAxisID: 'y1',
        datalabels: {
          display: false,
        },
      },
      // Hours Worked Line
      {
        type: 'line',
        label: 'Hours Worked',
        data: hoursData,
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        yAxisID: 'y2',
        datalabels: {
          display: false,
        },
      }
    );
  }

  if (selectedTab === 'Health Activity' || selectedTab === 'All') {
    // Adjusted 'Workout / Walk' data and Y-axis
    datasets.push(
      // Sleep Hours Line
      {
        type: 'line',
        label: 'Sleep Hours',
        data: sleepData,
        borderColor: '#FFA500',
        backgroundColor: 'rgba(255, 165, 0, 0.1)',
        borderWidth: 1,
        fill: false,
        tension: 0.1,
        yAxisID: 'y3',
        datalabels: {
          display: true,
          align: 'top',
          formatter: (value) => `${value}h`,
          color: '#FFA500',
          font: {
            weight: 'bold',
            size: 11,
          },
        },
      },
      // Workout/Walk Bar
      {
        type: 'bar',
        label: 'Workout / Walk',
        data: workoutData.map((workedOut) => (workedOut ? 1 : 0)),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: '#FF6384',
        borderWidth: 1,
        yAxisID: 'y4',
        borderRadius: 5,
        barPercentage: 0.9,
        categoryPercentage: 0.9,
        datalabels: {
          display: true,
          color: '#666',
          align: 'top',
          formatter: (value) => (value === 1 ? 'Yes' : ''),
        },
      }
    );
  }

  const scales = {
    x: {
      grid: { display: false },
      ticks: {
        display: false,
      },
    },
  };

  if (selectedTab === 'Work Activity' || selectedTab === 'All') {
    scales['y1'] = {
      type: 'linear',
      display: true,
      position: 'left',
      beginAtZero: true,
      ticks: {
        callback: (value) => `$${value}`,
      },
      title: {
        display: true,
        text: 'Earnings (USD)',
      },
    };

    scales['y2'] = {
      type: 'linear',
      display: true,
      position: 'right',
      beginAtZero: true,
      max: 24,
      ticks: {
        display: false,
      },
      grid: {
        drawOnChartArea: false,
      },
      title: {
        display: false,
      },
    };
  }

  if (selectedTab === 'Health Activity' || selectedTab === 'All') {
    scales['y3'] = {
      type: 'linear',
      display: true,
      position: 'left',
      beginAtZero: true,
      max: 12,
      ticks: {
        display: false,
      },
      grid: {
        drawOnChartArea: false,
      },
      title: {
        display: false,
      },
    };

    scales['y4'] = {
      type: 'linear',
      display: true,
      position: 'right',
      beginAtZero: true,
      max: 5, // Adjusted range from 0 to 5
      ticks: {
        display: false,
        stepSize: 1,
      },
      grid: {
        drawOnChartArea: false,
      },
      title: {
        display: false,
      },
    };
  }

  const chartData = {
    labels,
    datasets,
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    scales,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (context.dataset.label === 'Goal') {
              const roundedValue = Math.ceil(context.parsed.y);
              return `${context.dataset.label}: $${roundedValue}`;
            }
            if (context.dataset.label === 'Sleep Hours') {
              return `${context.dataset.label}: ${context.parsed.y}h`;
            }
            if (context.dataset.label === 'Workout / Walk') {
              return `${context.dataset.label}: ${context.parsed.y === 1 ? 'Yes' : 'No'}`;
            }
            return `${context.dataset.label}: $${context.parsed.y}`;
          },
          title: function (tooltipItems) {
            const day = tooltipItems[0].label;
            return `Day ${day}`;
          },
        },
      },
      datalabels: {
        display: true,
        color: 'rgba(102, 102, 102, 0.6)', // More transparent grey
        anchor: 'end',
        align: 'top',
        formatter: function (value, context) {
          if (context.dataset.label === 'Workout / Walk') {
            return value === 1 ? 'Yes' : '';
          }
          return null;
        },
      },
    },
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 id="earningsOverviewTitle" className="text-lg font-medium text-gray-500">
          {selectedTab === 'Work Activity'
            ? 'Earnings Overview - October 2024'
            : selectedTab === 'Health Activity'
            ? 'Health Overview - October 2024'
            : 'Overall Overview - October 2024'}
        </h2>
        {selectedTab === 'Work Activity' && (
          <button
            onClick={toggleChartView}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            Switch to {isAccumulatedView ? 'Daily' : 'Accumulated'} View
          </button>
        )}
      </div>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default ProgressChart;
