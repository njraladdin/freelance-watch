// ProgressChart.jsx
import React, { useState } from 'react';
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
  chartData,
  goalLineDaily,
  goalLineAccumulated,
  isAccumulatedView,
  toggleChartView,
}) => {
  const [selectedCharts, setSelectedCharts] = useState('Work');

  const handleChartSelection = (selection) => {
    setSelectedCharts(selection);
  };

  // Map of datasets to include for each selection
  const selectionMap = {
    'Work': ['Earnings', 'Goal', 'Hours Worked'],
    'Work & Sleep': ['Earnings', 'Goal', 'Hours Worked', 'Sleep Hours'],
    'Work & Workout': ['Earnings', 'Goal', 'Hours Worked', 'Workout'],
    'Work & Won Projects': ['Earnings', 'Goal', 'Hours Worked', 'Won Projects'],
    'All': ['Earnings', 'Goal', 'Hours Worked', 'Sleep Hours', 'Workout', 'Won Projects'],
  };

  // Colors mapping
  const colorMap = {
    'Earnings': {
      borderColor: '#10B981', // Green
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    'Hours Worked': {
      borderColor: '#2563EB', // Blue
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
    },
    'Sleep Hours': {
      borderColor: '#F97316', // Orange
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
    },
    'Workout': {
      borderColor: '#EF4444', // Red
      backgroundColor: 'rgba(239, 68, 68, 0.6)',
    },
    'Won Projects': {
      borderColor: '#8B5CF6', // Purple
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
    },
    'Goal': {
      borderColor: '#FF6384', // Pink
    },
  };

  // Destructure the chartData prop
  const {
    earnings,
    hoursWorked,
    sleepHours,
    didWorkout,
    projectsCount,
    labels,
  } = chartData;

  // Build datasets based on selected charts
  const datasets = [];

  const selectedDatasets = selectionMap[selectedCharts];

  selectedDatasets.forEach((datasetName) => {
    switch (datasetName) {
      case 'Earnings':
        datasets.push({
          type: 'line',
          label: 'Earnings (USD)',
          data: earnings,
          borderColor: colorMap['Earnings'].borderColor,
          backgroundColor: colorMap['Earnings'].backgroundColor,
          borderWidth: 4,
          fill: true,
          tension: 0.1,
          yAxisID: 'y1',
          z: 10,
          datalabels: {
            display: false,
          },
        });
        break;
      case 'Goal':
        datasets.push({
          type: 'line',
          label: 'Goal',
          data: isAccumulatedView ? goalLineAccumulated : goalLineDaily,
          borderColor: colorMap['Goal'].borderColor,
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          yAxisID: 'y1',
          z: 10,
          datalabels: {
            display: false,
          },
        });
        break;
      case 'Hours Worked':
        datasets.push({
          type: 'line',
          label: 'Hours Worked',
          data: hoursWorked,
          borderColor: colorMap['Hours Worked'].borderColor,
          backgroundColor: colorMap['Hours Worked'].backgroundColor,
          borderWidth: 2,
          fill: true,
          tension: 0.1,
          yAxisID: 'y2',
          z: 10,
          datalabels: {
            display: false,
          },
        });
        break;
      case 'Sleep Hours':
        datasets.push({
          type: 'line',
          label: 'Sleep Hours',
          data: sleepHours,
          borderColor: colorMap['Sleep Hours'].borderColor,
          backgroundColor: colorMap['Sleep Hours'].backgroundColor,
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          yAxisID: 'y3',
          z: 1,
          datalabels: {
            display: true,
            align: 'top',
            formatter: (value) => `${value}h`,
            color: colorMap['Sleep Hours'].borderColor,
            font: {
              weight: 'bold',
              size: 11,
            },
          },
        });
        break;
      case 'Workout':
        datasets.push({
          type: 'bar',
          label: 'Workout',
          data: didWorkout.map((workedOut) => (workedOut ? 1 : 0)),
          backgroundColor: colorMap['Workout'].backgroundColor,
          borderColor: colorMap['Workout'].borderColor,
          borderWidth: 1,
          yAxisID: 'y4',
          z: 1,
          borderRadius: 5,
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          datalabels: {
            display: true,
            color: '#666',
            align: 'top',
            formatter: (value) => (value === 1 ? 'Yes' : ''),
          },
        });
        break;
      case 'Won Projects':
        datasets.push({
          type: 'line',
          label: 'Won Projects',
          data: projectsCount,
          borderColor: colorMap['Won Projects'].borderColor,
          backgroundColor: colorMap['Won Projects'].backgroundColor,
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          yAxisID: 'y5',
          z: 10,
          datalabels: {
            display: true,
            align: 'top',
            formatter: (value) => `${value}`,
            color: colorMap['Won Projects'].borderColor,
            font: {
              weight: 'bold',
              size: 11,
            },
          },
        });
        break;
      default:
        break;
    }
  });

  // Define scales based on selected datasets
  const scales = {
    x: {
      grid: { display: false },
      ticks: {
        display: true,
        autoSkip: true,
        maxTicksLimit: 10,
      },
    },
  };

  // Always include y1 for Earnings and Goal
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
    suggestedMin: 0,
    z: 10,
  };

  // Include other scales based on selected datasets
  if (selectedDatasets.includes('Hours Worked')) {
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
      z: 10,
    };
  }

  if (selectedDatasets.includes('Sleep Hours')) {
    scales['y3'] = {
      type: 'linear',
      display: true,
      position: 'left',
      beginAtZero: true,
      max: 20,
      ticks: {
        display: false,
      },
      grid: {
        drawOnChartArea: false,
      },
      title: {
        display: false,
      },
      z: 1,
    };
  }

  if (selectedDatasets.includes('Workout')) {
    scales['y4'] = {
      type: 'linear',
      display: true,
      position: 'right',
      beginAtZero: true,
      max: 5,
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
      z: 1,
    };
  }

  if (selectedDatasets.includes('Won Projects')) {
    scales['y5'] = {
      type: 'linear',
      display: true,
      position: 'right',
      offset: true,
      beginAtZero: true,
      min: 1,
      max: 20,
      ticks: {
        stepSize: 1,
        callback: (value) => value,
      },
      grid: {
        drawOnChartArea: false,
      },
      title: {
        display: true,
        text: 'Won Projects',
      },
      z: 10,
    };
  }

  const data = {
    labels,
    datasets,
  };

  const options = {
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
            const label = context.dataset.label;
            const value = context.parsed.y;
            switch (label) {
              case 'Goal':
                return `${label}: $${Math.ceil(value)}`;
              case 'Sleep Hours':
                return `${label}: ${value}h`;
              case 'Workout':
                return `${label}: ${value === 1 ? 'Yes' : 'No'}`;
              case 'Hours Worked':
                return `${label}: ${value}h`;
              case 'Won Projects':
                return `${label}: ${value}`;
              case 'Earnings (USD)':
                return `${label}: $${value}`;
              default:
                return `${label}: ${value}`;
            }
          },
          title: function (tooltipItems) {
            const day = tooltipItems[0].label;
            return `Day ${day}`;
          },
        },
      },
      datalabels: {
        display: true,
        color: 'rgba(102, 102, 102, 0.6)',
        anchor: 'end',
        align: 'top',
      },
    },
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4 flex-wrap">
        <div className="flex items-center space-x-4">
          <h2
            id="earningsOverviewTitle"
            className="text-lg font-medium text-gray-500"
          >
            Overview -{' '}
            {new Date().toLocaleString('default', {
              month: 'short',
              year: 'numeric',
            })}
          </h2>
          <div className="flex items-center space-x-2 flex-wrap">
            {[
              'Work',
              'Work & Sleep',
              'Work & Workout',
              'Work & Won Projects',
              'All',
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => handleChartSelection(tab)}
                className={`px-2 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                  selectedCharts === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={toggleChartView}
          className="ml-4 mt-2 px-3 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 transition-colors whitespace-nowrap"
        >
          Switch to {isAccumulatedView ? 'Daily' : 'Accumulated'} View
        </button>
      </div>
      <Line data={data} options={options} />
    </div>
  );
};

export default ProgressChart;
