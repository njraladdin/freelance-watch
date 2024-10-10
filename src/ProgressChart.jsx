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
  LineController,
  BarController,
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
    'Work & Exercise': ['Earnings', 'Goal', 'Hours Worked', 'Exercise'],
    'Work & Motivation': ['Earnings', 'Goal', 'Hours Worked', 'Motivation Level'],
    'Work, Exercise & Anxiety': ['Earnings', 'Goal', 'Hours Worked', 'Exercise', 'Anxiety Level'],
    'All': [
      'Earnings',
      'Goal',
      'Hours Worked',
      'Sleep Hours',
      'Exercise',
      'Motivation Level',
      'Anxiety Level',
      'Projects Won',
    ],
  };

  const selectedDatasets = selectionMap[selectedCharts] || [];

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
      pointRadius: 0, // Hide dots
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
      datalabels: {
        display: true,
        align: 'top',
        formatter: (value) => (value !== 0 ? `${value}h` : ''),
        font: { weight: 'bold', size: isMobile ? 10 : 11 },
      },
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
    'Exercise': {
      type: 'bar',
      label: 'Exercise',
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
      backgroundColor: 'rgba(239, 68, 68, 0.6)', // Red
    },
    'Anxiety Level': {
      type: 'line',
      label: 'Anxiety Level',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      yAxisID: 'y5',
      z: 15,
      datalabels: {
        display: true,
        align: 'top',
        formatter: (value) => (value !== 0 ? `${value}` : ''),
        font: { weight: 'bold', size: isMobile ? 10 : 11 },
      },
      pointRadius: isMobile ? 0 : 3,
      pointHoverRadius: isMobile ? 0 : 6,
      borderColor: '#8B4513', // Brown
    },
    'Motivation Level': {
      type: 'line',
      label: 'Motivation Level',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      yAxisID: 'y6',
      z: 15,
      datalabels: {
        display: true,
        align: 'top',
        formatter: (value) => (value !== 0 ? `${value}` : ''),
        font: { weight: 'bold', size: isMobile ? 10 : 11 },
      },
      pointRadius: isMobile ? 0 : 3,
      pointHoverRadius: isMobile ? 0 : 6,
      borderColor: '#FBBF24', // Amber
    },
    'Projects Won': {
      type: 'line', // You can change this to 'bar' if preferred
      label: 'Projects Won',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      yAxisID: 'y7',
      z: 12,
      datalabels: {
        display: true,
        align: 'top',
        formatter: (value) => (value !== 0 ? `${value}` : ''),
        font: { weight: 'bold', size: isMobile ? 10 : 11 },
      },
      pointRadius: isMobile ? 0 : 3,
      pointHoverRadius: isMobile ? 0 : 6,
      borderColor: '#A855F7', // Purple
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
    'Exercise': {
      borderColor: '#EF4444', // Red
      backgroundColor: 'rgba(239, 68, 68, 0.6)',
    },
    'Anxiety Level': {
      borderColor: '#8B4513', // Brown
      backgroundColor: 'rgba(139, 69, 19, 0.1)',
    },
    'Motivation Level': {
      borderColor: '#FBBF24', // Amber
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
    },
    'Projects Won': {
      borderColor: '#A855F7', // Purple
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
    },
  };

  // Destructure the chartData prop
  const {
    earnings,
    hoursWorked,
    sleepHours,
    didExercise,
    motivationLevel,
    anxietyLevel,
    projectsCount,
    labels,
  } = chartData;

  // Function to get today's day of the month
  const getTodayDay = () => {
    const today = new Date();
    return today.getDate();
  };

  // Function to filter data based on isMobile
  const getFilteredData = () => {
    if (!isMobile) {
      // If not mobile, return all data
      return {
        labels,
        earnings,
        hoursWorked,
        sleepHours,
        didExercise,
        motivationLevel,
        anxietyLevel,
        projectsCount,
        goalLineDaily,
        goalLineAccumulated,
      };
    }

    const todayDay = getTodayDay();

    // Find the index of today's day in labels
    // Assuming labels are numbers representing days
    let todayIndex = labels.findIndex(
      (label) => Number(label) === todayDay
    );

    // If today's day is not found, assume the last label is today
    if (todayIndex === -1) {
      todayIndex = labels.length - 1;
    }

    // Calculate the start index for the last 7 days
    const startIndex = Math.max(todayIndex - 7, 0);

    // Slice all data arrays accordingly
    const slicedLabels = labels.slice(startIndex, todayIndex + 2);
    const slicedEarnings = earnings.slice(startIndex, todayIndex + 2);
    const slicedHoursWorked = hoursWorked.slice(startIndex, todayIndex + 2);
    const slicedSleepHours = sleepHours.slice(startIndex, todayIndex + 2);
    const slicedDidExercise = didExercise.slice(startIndex, todayIndex + 2);
    const slicedMotivationLevel = motivationLevel.slice(startIndex, todayIndex + 2);
    const slicedAnxietyLevel = anxietyLevel.slice(startIndex, todayIndex + 2);
    const slicedProjectsCount = projectsCount.slice(startIndex, todayIndex + 2);
    const slicedGoalLineDaily = goalLineDaily.slice(startIndex, todayIndex + 2);
    const slicedGoalLineAccumulated = goalLineAccumulated.slice(startIndex, todayIndex + 2);

    return {
      labels: slicedLabels,
      earnings: slicedEarnings,
      hoursWorked: slicedHoursWorked,
      sleepHours: slicedSleepHours,
      didExercise: slicedDidExercise,
      motivationLevel: slicedMotivationLevel,
      anxietyLevel: slicedAnxietyLevel,
      projectsCount: slicedProjectsCount,
      goalLineDaily: slicedGoalLineDaily,
      goalLineAccumulated: slicedGoalLineAccumulated,
    };
  };

  // Get filtered data
  const {
    labels: filteredLabels,
    earnings: filteredEarnings,
    hoursWorked: filteredHoursWorked,
    sleepHours: filteredSleepHours,
    didExercise: filteredDidExercise,
    motivationLevel: filteredMotivationLevel,
    anxietyLevel: filteredAnxietyLevel,
    projectsCount: filteredProjectsCount,
    goalLineDaily: filteredGoalLineDaily,
    goalLineAccumulated: filteredGoalLineAccumulated,
  } = getFilteredData();

  // Data mapping
  const dataMap = {
    'Earnings': filteredEarnings,
    'Goal': isAccumulatedView ? filteredGoalLineAccumulated : filteredGoalLineDaily,
    'Hours Worked': filteredHoursWorked,
    'Sleep Hours': filteredSleepHours,
    'Exercise': filteredDidExercise.map((exercised) => (exercised ? 1 : 0)),
    'Anxiety Level': filteredAnxietyLevel,
    'Motivation Level': filteredMotivationLevel,
    'Projects Won': filteredProjectsCount,
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
      min: 0,
      max: 10,
      ticks: {
        callback: (value) => `${value}`,
        font: { size: isMobile ? 10 : 12 },
      },
      grid: { drawOnChartArea: false },
      z: 15,
    },
    y6: {
      type: 'linear',
      display: false, // Hidden
      position: 'right',
      beginAtZero: true,
      min: 0,
      max: 10,
      ticks: {
        callback: (value) => `${value}`,
        font: { size: isMobile ? 10 : 12 },
      },
      grid: { drawOnChartArea: false },
      z: 15,
    },
    y7: {
      type: 'linear',
      display: false, // Hidden
      position: 'right',
      beginAtZero: true,
      min: 0,
      max: Math.max(...filteredProjectsCount, 10),
      ticks: {
        callback: (value) => `${value}`,
        font: { size: isMobile ? 10 : 12 },
      },
      grid: { drawOnChartArea: false },
      z: 12,
    },
  };

  // Include all y-axes in scales
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
    y1: scalesConfig.y1,
    y2: scalesConfig.y2,
    y3: scalesConfig.y3,
    y4: scalesConfig.y4,
    y5: scalesConfig.y5,
    y6: scalesConfig.y6,
    y7: scalesConfig.y7,
  };

  const data = {
    labels: filteredLabels,
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
              case 'Exercise':
                return `${label}: ${value === 1 ? 'Yes' : 'No'}`;
              case 'Anxiety Level':
                return `${label}: ${value}`;
              case 'Hours Worked':
                return `${label}: ${value}h`;
              case 'Motivation Level':
                return `${label}: ${value}`;
              case 'Earnings (USD)':
                return `${label}: $${value}`;
              case 'Projects Won':
                return `${label}: ${value}`;
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
      <h2 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-600">
        Metrics -{' '}
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
              <option value="Work & Exercise">Work & Exercise</option>
              <option value="Work & Motivation">Work & Motivation</option>
              <option value="Work, Exercise & Anxiety">Work, Exercise & Anxiety</option>
              <option value="All">All</option>
            </select>
          </div>
        ) : (
          // Button Group for Desktop
          <div className="flex items-center space-x-2 overflow-x-auto">
            {[
              'Work',
              'Work & Sleep',
              'Work & Exercise',
              'Work & Motivation',
              'Work, Exercise & Anxiety',
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
