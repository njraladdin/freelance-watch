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

  const handleChartSelection = (selection) => setSelectedCharts(selection);

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

  // Function to filter data based on isMobile
  const getFilteredData = () => {
    if (!isMobile) {
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
    const today = new Date().getDate();
    let todayIndex = labels.findIndex((label) => Number(label) === today);
    if (todayIndex === -1) todayIndex = labels.length - 1;
    const startIndex = Math.max(todayIndex - 7, 0);
    const endIndex = todayIndex + 2;
    const sliceData = (data) => data.slice(startIndex, endIndex);
    return {
      labels: sliceData(labels),
      earnings: sliceData(earnings),
      hoursWorked: sliceData(hoursWorked),
      sleepHours: sliceData(sleepHours),
      didExercise: sliceData(didExercise),
      motivationLevel: sliceData(motivationLevel),
      anxietyLevel: sliceData(anxietyLevel),
      projectsCount: sliceData(projectsCount),
      goalLineDaily: sliceData(goalLineDaily),
      goalLineAccumulated: sliceData(goalLineAccumulated),
    };
  };

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

  const dataMap = {
    earnings: filteredEarnings,
    goalLine: isAccumulatedView ? filteredGoalLineAccumulated : filteredGoalLineDaily,
    hoursWorked: filteredHoursWorked,
    sleepHours: filteredSleepHours,
    exercise: filteredDidExercise.map((exercised) => (exercised ? 1 : 0)),
    motivationLevel: filteredMotivationLevel,
    anxietyLevel: filteredAnxietyLevel,
    projectsWon: filteredProjectsCount,
  };

  const datasetsInfo = {
    'Earnings': {
      dataKey: 'earnings',
      type: 'line',
      label: 'Earnings (USD)',
      yAxisID: 'y1',
      borderWidth: 4,
      fill: true,
      tension: 0.1,
      datalabels: { display: false },
      pointRadius: isMobile ? 0 : 3,
      pointHoverRadius: isMobile ? 0 : 6,
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    'Goal': {
      dataKey: 'goalLine',
      type: 'line',
      label: 'Goal',
      yAxisID: 'y1',
      borderWidth: 2,
      borderDash: [5, 5],
      fill: false,
      pointRadius: 0,
      datalabels: { display: false },
      pointHoverRadius: isMobile ? 0 : 6,
      borderColor: '#FF6384',
    },
    'Hours Worked': {
      dataKey: 'hoursWorked',
      type: 'line',
      label: 'Hours Worked',
      yAxisID: 'y2',
      borderWidth: 2,
      fill: true,
      tension: 0.1,
      datalabels: {
        display: true,
        align: 'top',
        formatter: (value) => (value ? `${value}h` : ''),
        font: { weight: 'bold', size: isMobile ? 10 : 11 },
      },
      pointRadius: isMobile ? 0 : 3,
      pointHoverRadius: isMobile ? 0 : 6,
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
    },
    'Sleep Hours': {
      dataKey: 'sleepHours',
      type: 'line',
      label: 'Sleep Hours',
      yAxisID: 'y3',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      datalabels: {
        display: true,
        align: 'top',
        formatter: (value) => (value ? `${value}h` : ''),
        font: { weight: 'bold', size: isMobile ? 10 : 11 },
      },
      pointRadius: isMobile ? 0 : 3,
      pointHoverRadius: isMobile ? 0 : 6,
      borderColor: '#F97316',
    },
    'Exercise': {
      dataKey: 'exercise',
      type: 'bar',
      label: 'Exercise',
      yAxisID: 'y4',
      borderWidth: 1,
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
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.6)',
    },
    'Anxiety Level': {
      dataKey: 'anxietyLevel',
      type: 'line',
      label: 'Anxiety Level',
      yAxisID: 'y5',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      datalabels: {
        display: true,
        align: 'top',
        formatter: (value) => (value ? `${value}` : ''),
        font: { weight: 'bold', size: isMobile ? 10 : 11 },
      },
      pointRadius: isMobile ? 0 : 3,
      pointHoverRadius: isMobile ? 0 : 6,
      borderColor: '#8B4513',
    },
    'Motivation Level': {
      dataKey: 'motivationLevel',
      type: 'line',
      label: 'Motivation Level',
      yAxisID: 'y6',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      datalabels: {
        display: true,
        align: 'top',
        formatter: (value) => (value ? `${value}` : ''),
        font: { weight: 'bold', size: isMobile ? 10 : 11 },
      },
      pointRadius: isMobile ? 0 : 3,
      pointHoverRadius: isMobile ? 0 : 6,
      borderColor: '#FBBF24',
    },
    'Projects Won': {
      dataKey: 'projectsWon',
      type: 'line',
      label: 'Projects Won',
      yAxisID: 'y7',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      datalabels: {
        display: true,
        align: 'top',
        formatter: (value) => (value ? `${value}` : ''),
        font: { weight: 'bold', size: isMobile ? 10 : 11 },
      },
      pointRadius: isMobile ? 0 : 3,
      pointHoverRadius: isMobile ? 0 : 6,
      borderColor: '#A855F7',
    },
  };

  const datasets = selectedDatasets.map((name) => ({
    ...datasetsInfo[name],
    data: dataMap[datasetsInfo[name].dataKey],
  }));

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
    y1: {
      type: 'linear',
      display: true,
      position: 'left',
      beginAtZero: true,
      ticks: {
        callback: (value) => `$${value}`,
        font: { size: isMobile ? 10 : 12 },
      },
    },
    y2: {
      type: 'linear',
      display: false,
      position: 'right',
      beginAtZero: true,
      max: 24,
      grid: { drawOnChartArea: false },
    },
    y3: {
      type: 'linear',
      display: false,
      position: 'left',
      beginAtZero: true,
      max: 20,
      grid: { drawOnChartArea: false },
    },
    y4: {
      type: 'linear',
      display: false,
      position: 'right',
      beginAtZero: true,
      max: 10,
      grid: { drawOnChartArea: false },
    },
    y5: {
      type: 'linear',
      display: false,
      position: 'right',
      beginAtZero: true,
      max: 10,
      grid: { drawOnChartArea: false },
    },
    y6: {
      type: 'linear',
      display: false,
      position: 'right',
      beginAtZero: true,
      max: 10,
      grid: { drawOnChartArea: false },
    },
    y7: {
      type: 'linear',
      display: false,
      position: 'right',
      beginAtZero: true,
      max: Math.max(...filteredProjectsCount, 10),
      grid: { drawOnChartArea: false },
    },
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
          font: { size: isMobile ? 10 : 12 },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: ({ dataset, parsed }) => {
            const { label } = dataset;
            const value = parsed.y;
            const suffix = label.includes('Hours') ? 'h' : '';
            const prefix = label === 'Earnings (USD)' || label === 'Goal' ? '$' : '';
            const displayValue =
              label === 'Exercise' ? (value === 1 ? 'Yes' : 'No') : `${prefix}${value}${suffix}`;
            return `${label}: ${displayValue}`;
          },
          title: (tooltipItems) => `Day ${tooltipItems[0].label}`,
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
              {Object.keys(selectionMap).map((tab) => (
                <option key={tab} value={tab}>
                  {tab}
                </option>
              ))}
            </select>
          </div>
        ) : (
          // Button Group for Desktop
          <div className="flex items-center space-x-2 overflow-x-auto">
            {Object.keys(selectionMap).map((tab) => (
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
        <div className="min-w-[300px] max-w-full h-64 sm:h-80 lg:h-96">
          <Chart type="line" data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
