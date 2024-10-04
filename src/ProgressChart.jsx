// ProgressChart.jsx
import React, { useState, useEffect } from 'react';
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
import { Chart } from 'react-chartjs-2';
import { LineController, BarController } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components and the datalabels plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
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
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    if (chartInstance) {
      chartInstance.update();
    }
  }, [selectedCharts, isAccumulatedView, chartInstance]);

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

  // Dataset configurations
  const datasetConfigs = {
    'Earnings': {
      type: 'line',
      label: 'Earnings (USD)',
      borderWidth: 4,
      fill: true,
      tension: 0.1,
      yAxisID: 'y1',
      z: 10,
      datalabels: { display: false },
    },
    'Goal': {
      type: 'line',
      label: 'Goal',
      borderWidth: 2,
      borderDash: [5, 5],
      fill: false,
      pointRadius: 0,
      yAxisID: 'y1',
      z: 10,
      datalabels: { display: false },
    },
    'Hours Worked': {
      type: 'line',
      label: 'Hours Worked',
      borderWidth: 2,
      fill: true,
      tension: 0.1,
      yAxisID: 'y2',
      z: 10,
      datalabels: { display: false },
    },
    'Sleep Hours': {
      type: 'line',
      label: 'Sleep Hours',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      yAxisID: 'y3',
      z: 1,
      datalabels: {
        display: true,
        align: 'top',
        formatter: (value) => value !== 0 ? `${value}h` : '',
        font: { weight: 'bold', size: 11 },
      },
    },
    'Workout': {
      type: 'bar',
      label: 'Workout',
      borderWidth: 1,
      yAxisID: 'y4',
      z: 1,
      borderRadius: 5,
      barPercentage: 0.9,
      categoryPercentage: 0.9,
      datalabels: {
        display: true,
        align: 'top',
        formatter: (value) => (value === 1 ? 'Yes' : ''),
        color: '#666',
      },
    },
    'Won Projects': {
      type: 'line',
      label: 'Won Projects',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      yAxisID: 'y5',
      z: 10,
      datalabels: {
        display: true,
        align: 'top',
        formatter: (value) => value !== 0 ? `${value}` : '',
        font: { weight: 'bold', size: 11 },
      },
    },
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

  // Data mapping
  const dataMap = {
    'Earnings': earnings,
    'Goal': isAccumulatedView ? goalLineAccumulated : goalLineDaily,
    'Hours Worked': hoursWorked,
    'Sleep Hours': sleepHours,
    'Workout': didWorkout.map((workedOut) => (workedOut ? 1 : 0)),
    'Won Projects': projectsCount,
  };

  // Build datasets based on selected charts
  const selectedDatasets = selectionMap[selectedCharts];

  const datasets = selectedDatasets.map((datasetName) => ({
    ...datasetConfigs[datasetName],
    data: dataMap[datasetName],
    ...colorMap[datasetName],
  }));

  // Define scales configurations
  const scalesConfig = {
    y1: {
      type: 'linear',
      display: true,
      position: 'left',
      beginAtZero: true,
      ticks: { callback: (value) => `$${value}` },
      title: { display: true, text: 'Earnings (USD)' },
      suggestedMin: 0,
      z: 10,
    },
    y2: {
      type: 'linear',
      display: true,
      position: 'right',
      beginAtZero: true,
      max: 24,
      ticks: { display: false },
      grid: { drawOnChartArea: false },
      z: 10,
    },
    y3: {
      type: 'linear',
      display: true,
      position: 'left',
      beginAtZero: true,
      max: 20,
      ticks: { display: false },
      grid: { drawOnChartArea: false },
      z: 1,
    },
    y4: {
      type: 'linear',
      display: true,
      position: 'right',
      beginAtZero: true,
      max: 5,
      ticks: { display: false, stepSize: 1 },
      grid: { drawOnChartArea: false },
      z: 1,
    },
    y5: {
      type: 'linear',
      display: true,
      position: 'right',
      offset: true,
      beginAtZero: true,
      min: 1,
      max: 20,
      ticks: { stepSize: 1 },
      grid: { drawOnChartArea: false },
      title: { display: true, text: 'Won Projects' },
      z: 10,
    },
  };

  // Include scales based on selected datasets
  const scales = {
    x: {
      grid: { display: false },
      ticks: { display: true, autoSkip: true, maxTicksLimit: 10 },
    },
    y1: scalesConfig.y1, // Always include y1 for 'Earnings' and 'Goal'
    ...(selectedDatasets.includes('Hours Worked') && { y2: scalesConfig.y2 }),
    ...(selectedDatasets.includes('Sleep Hours') && { y3: scalesConfig.y3 }),
    ...(selectedDatasets.includes('Workout') && { y4: scalesConfig.y4 }),
    ...(selectedDatasets.includes('Won Projects') && { y5: scalesConfig.y5 }),
  };

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
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
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-gray-600">
        Overview -{' '}
        {new Date().toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        })}
      </h2>
      <div className="flex items-center justify-between mb-4 flex-wrap">
        <div className="flex items-center space-x-4">
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
                className={`px-3 py-1 text-sm rounded transition-colors whitespace-nowrap ${
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
          className="mt-2 px-4 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-100 transition-colors whitespace-nowrap"
        >
          Switch to {isAccumulatedView ? 'Daily' : 'Accumulated'} View
        </button>
      </div>
      <Chart type="line" data={data} options={options} />
    </div>
  );
};
export default ProgressChart;
