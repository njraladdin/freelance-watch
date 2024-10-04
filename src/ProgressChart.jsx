// src/ProgressChart.jsx
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
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size to toggle mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's sm breakpoint
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChartSelection = (selection) => {
    setSelectedCharts(selection);
  };

  // Map of datasets to include for each selection
  const selectionMap = {
    'Work': ['Earnings', 'Goal', 'Hours Worked'],
    'Work & Sleep': ['Earnings', 'Goal', 'Hours Worked', 'Sleep Hours'],
    'Work & Workout': ['Earnings', 'Goal', 'Hours Worked', 'Workout'],
    'Work & Walk': ['Earnings', 'Goal', 'Hours Worked', 'Walk'],
    'Work, Workout & Walk': ['Earnings', 'Goal', 'Hours Worked', 'Workout', 'Walk'],
    'All': ['Earnings', 'Goal', 'Hours Worked', 'Sleep Hours', 'Workout', 'Walk'],
  };

  const selectedDatasets = selectionMap[selectedCharts];

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
      pointRadius: isMobile ? 0 : 3, // Hide dots on mobile
      pointHoverRadius: isMobile ? 0 : 6, // Optionally hide hover dots
    },
    'Goal': {
      type: 'line',
      label: 'Goal',
      borderWidth: 2,
      borderDash: [5, 5],
      fill: false,
      pointRadius: isMobile ? 0 : 3, // Hide dots on mobile
      yAxisID: 'y1',
      z: 10,
      datalabels: { display: false },
      pointHoverRadius: isMobile ? 0 : 6,
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
      pointRadius: isMobile ? 0 : 3, // Hide dots on mobile
      pointHoverRadius: isMobile ? 0 : 6,
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
        formatter: (value) => (value !== 0 ? `${value}h` : ''),
        font: { weight: 'bold', size: isMobile ? 10 : 11 },
      },
      pointRadius: isMobile ? 0 : 3, // Hide dots on mobile
      pointHoverRadius: isMobile ? 0 : 6,
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
        font: { size: isMobile ? 10 : 11 },
      },
    },
    'Walk': {
      type: 'bar',
      label: 'Walk',
      borderWidth: 1,
      yAxisID: 'y5',
      z: 1,
      borderRadius: 5,
      barPercentage: 0.9,
      categoryPercentage: 0.9,
      datalabels: {
        display: true,
        align: 'top',
        formatter: (value) => (value === 1 ? 'Yes' : ''),
        color: '#666',
        font: { size: isMobile ? 10 : 11 },
      },
    },
  };

  // Colors mapping consistent with DayInput.jsx
  const colorMap = {
    'Earnings': {
      borderColor: '#10B981', // Green
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    'Goal': {
      borderColor: '#FF6384', // Pink
      backgroundColor: 'rgba(255, 99, 132, 0.1)',
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
    'Walk': {
      borderColor: '#6366F1', // Indigo
      backgroundColor: 'rgba(99, 102, 241, 0.6)',
    },
  };

  // Destructure the chartData prop
  const {
    earnings,
    hoursWorked,
    sleepHours,
    didWorkout,
    didWalk,
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
    'Walk': didWalk.map((walked) => (walked ? 1 : 0)),
  };

  // Build datasets based on selected charts
  const datasets = selectedDatasets.map((datasetName) => ({
    ...datasetConfigs[datasetName],
    data: dataMap[datasetName],
    ...colorMap[datasetName],
  }));

  // Define scales configurations
  const scalesConfig = {
    y1: {
      type: 'linear',
      display: true, // Only y1 is displayed
      position: 'left',
      beginAtZero: true,
      min: 0, // Ensure starts at 0
      ticks: {
        callback: (value) => `$${value}`,
        font: { size: isMobile ? 10 : 12 },
      },
      suggestedMin: 0,
      z: 10,
    },
    y2: {
      type: 'linear',
      display: false, // Hidden
      position: 'right',
      beginAtZero: true,
      min: 0, // Ensure starts at 0
      max: 24,
      ticks: { display: false },
      grid: { drawOnChartArea: false },
      z: 10,
    },
    y3: {
      type: 'linear',
      display: false, // Hidden
      position: 'left',
      beginAtZero: true,
      min: 0, // Ensure starts at 0
      max: 20,
      ticks: { display: false },
      grid: { drawOnChartArea: false },
      z: 1,
    },
    y4: {
      type: 'linear',
      display: false, // Hidden
      position: 'right',
      beginAtZero: true,
      min: 0, // Ensure starts at 0
      max: 10, // Set max to 10 to limit height
      ticks: { display: false },
      grid: { drawOnChartArea: false },
      z: 1,
    },
    y5: {
      type: 'linear',
      display: false, // Hidden
      position: 'right',
      beginAtZero: true,
      min: 0, // Ensure starts at 0
      max: 10, // Set max to 10 to limit height
      ticks: { display: false },
      grid: { drawOnChartArea: false },
      z: 10,
    },
  };

  // Include all y-axes in scales, but only y1 is displayed
  const scales = {
    x: {
      grid: { display: false },
      ticks: {
        display: true,
        autoSkip: true,
        maxTicksLimit: isMobile ? 5 : 10,
        font: { size: isMobile ? 10 : 12 },
      },
    },
    y1: scalesConfig.y1, // Always include y1
    y2: scalesConfig.y2, // Include y2 to y5 even if hidden
    y3: scalesConfig.y3,
    y4: scalesConfig.y4,
    y5: scalesConfig.y5,
  };

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    stacked: false,
    scales,
    plugins: {
      legend: {
        display: true,
        position: isMobile ? 'bottom' : 'top',
        labels: {
          font: {
            size: isMobile ? 10 : 12,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
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
              case 'Walk':
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
        titleFont: { size: isMobile ? 12 : 14 },
        bodyFont: { size: isMobile ? 10 : 12 },
      },
      datalabels: {
        display: true,
        color: 'rgba(102, 102, 102, 0.6)',
        anchor: 'end',
        align: 'top',
        font: { size: isMobile ? 10 : 11 },
      },
    },
  };

  return (
    <div className="mb-8 px-4">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 border-b pb-2 text-gray-600">
        Overview -{' '}
        {new Date().toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        })}
      </h2>
      <div className="flex items-center justify-between mb-4 flex-wrap">
        {/* Chart Selection Controls */}
        {isMobile ? (
          // Dropdown Select for Mobile
          <div className="w-full mb-2 sm:mb-0">
            <select
              value={selectedCharts}
              onChange={(e) => handleChartSelection(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Select Chart View"
            >
              <option value="Work">Work</option>
              <option value="Work & Sleep">Work & Sleep</option>
              <option value="Work & Workout">Work & Workout</option>
              <option value="Work & Walk">Work & Walk</option>
              <option value="Work, Workout & Walk">Work, Workout & Walk</option>
              <option value="All">All</option>
            </select>
          </div>
        ) : (
          // Button Group for Desktop
          <div className="flex items-center space-x-2 overflow-x-auto">
            {[
              'Work',
              'Work & Sleep',
              'Work & Workout',
              'Work & Walk',
              'Work, Workout & Walk',
              'All',
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => handleChartSelection(tab)}
                className={`px-3 py-1 text-xs sm:text-sm rounded transition-colors whitespace-nowrap ${
                  selectedCharts === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label={`Select ${tab} Chart View`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Toggle View Button */}
        <button
          onClick={toggleChartView}
          className="mt-2 sm:mt-0 px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded bg-white hover:bg-gray-100 transition-colors whitespace-nowrap"
          aria-label={`Switch to ${isAccumulatedView ? 'Daily' : 'Accumulated'} View`}
        >
          Switch to {isAccumulatedView ? 'Daily' : 'Accumulated'} View
        </button>
      </div>
      <div className="w-full overflow-x-auto">
        <div className={`min-w-[300px] max-w-full h-64 sm:h-80 lg:h-96`}>
          <Chart type="line" data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
