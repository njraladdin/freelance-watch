import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Chart } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, LineController, BarController } from 'chart.js';
import { FiBriefcase, FiDollarSign, FiMinus, FiPlus, FiChevronLeft, FiChevronRight, FiClock, FiCreditCard, FiTarget, FiUser, FiLogIn, FiLogOut } from 'react-icons/fi';
import { db } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, query, where, addDoc, writeBatch } from 'firebase/firestore';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Primary button with solid background
 const PrimaryButton = ({ children, onClick, disabled, className = '', ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Secondary button with outline
 const SecondaryButton = ({ children, onClick, disabled, className = '', ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Icon button (circular)
 const IconButton = ({ icon: Icon, onClick, disabled, className = '', ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-3 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    {...props}
  >
    <Icon className="w-5 h-5 text-gray-600" />
  </button>
);

// Tab button
 const TabButton = ({ children, isActive, onClick, className = '', ...props }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl transition-all ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Control button (for increment/decrement)
 const ControlButton = ({ icon: Icon, onClick, className = '', ...props }) => (
  <button
    onClick={onClick}
    className={`bg-gray-50 rounded-lg flex items-center justify-center 
              hover:bg-gray-100 transition-colors shrink-0 ${className}`}
    {...props}
  >
    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
  </button>
);
// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, LineController, BarController, ChartDataLabels);

// Add this helper function near the top of the file, before any components
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Then define components
const DateSelector = React.memo(({ date, onDateChange }) => {
  const handleDateChange = (newDate) => {
    onDateChange(newDate);
  };

  const handleDayChange = (days) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    onDateChange(newDate);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow =
    date.toDateString() === new Date(today.getTime() + 86400000).toDateString();

  const minDate = today;
  const maxDate = new Date(today.getTime() + 86400000);

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between sm:justify-center sm:space-x-4">
          <IconButton
            icon={FiChevronLeft}
            onClick={() => handleDayChange(-1)}
            aria-label="Previous Day"
            className="shrink-0"
          />
          
          <div className="flex flex-col items-center mx-2 sm:mx-0">
            <DatePicker
              selected={date}
              onChange={handleDateChange}
              dateFormat="dd/MMM/yyyy"
              minDate={minDate}
              maxDate={maxDate}
              className="w-36 sm:w-48 px-2 sm:px-4 py-2 text-center bg-white border 
                       border-gray-200 rounded-lg focus:outline-none focus:ring-2 
                       focus:ring-blue-400 text-sm sm:text-base text-gray-700 font-medium"
              aria-label="Select Date"
            />
            {(isToday || isTomorrow) && (
              <span className={`mt-1 text-sm font-medium ${isToday ? 'text-green-500' : 'text-blue-500'}`}>
                {isToday ? 'Today' : 'Tomorrow'}
              </span>
            )}
          </div>

          <IconButton
            icon={FiChevronRight}
            onClick={() => handleDayChange(1)}
            disabled={date >= maxDate}
            aria-label="Next Day"
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  );
});

const DayInput = React.memo(({ onDataChange, record, date }) => {
  const handleAmountChange = (value) => {
    onDataChange(date, { earnings: Math.max(value, 0) });
  };

  const handleProjectVisualClick = (value) => {
    const newValue = record.projectsCount === value ? 0 : value;
    onDataChange(date, { projectsCount: newValue });
  };

  return (
    <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
      {/* Income Input */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-3 bg-green-50 rounded-lg shrink-0">
              <FiDollarSign className="text-green-500 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700">Today's Income</h3>
              <p className="text-xs sm:text-sm text-gray-500">Track your daily earnings</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between sm:justify-center sm:space-x-6">
          <ControlButton
            icon={FiMinus}
            onClick={() => handleAmountChange((record.earnings || 0) - 50)}
            className="w-12 h-12 sm:w-14 sm:h-14"
          />
          
          <input
            type="number"
            value={record.earnings || 0}
            onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
            className="w-32 sm:w-48 text-center text-2xl sm:text-4xl font-bold 
                     text-gray-700 bg-transparent border-b-2 border-green-400 
                     focus:outline-none focus:border-green-500"
          />
          
          <ControlButton
            icon={FiPlus}
            onClick={() => handleAmountChange((record.earnings || 0) + 50)}
            className="w-12 h-12 sm:w-14 sm:h-14"
          />
        </div>
      </div>

      {/* Projects Input */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-50 rounded-lg">
            <FiBriefcase className="text-purple-500 w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Projects Won</h3>
        </div>
        <div className="flex justify-center space-x-3">
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              onClick={() => handleProjectVisualClick(i + 1)}
              className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all transform hover:scale-105 ${
                (record.projectsCount || 0) >= i + 1
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-purple-50'
              }`}
              aria-label={`Set projects count to ${i + 1}`}
            >
              {(record.projectsCount || 0) >= i + 1 ? (
                <FiBriefcase className="w-6 h-6" />
              ) : (
                <span className="text-base font-semibold">{i + 1}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

const ProgressChart = ({
  chartData,
  goalLineDaily,
  goalLineAccumulated,
  isAccumulatedView,
  toggleChartView,
}) => {
  const [selectedCharts, setSelectedCharts] = useState('Work');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define base dataset configurations
  const datasetConfigs = {
    earnings: {
      type: 'line',
      label: 'Earnings (USD)',
      yAxisID: 'y1',
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      data: chartData.earnings,
      // Common properties
      borderWidth: 4,
      fill: true,
      tension: 0.1,
      datalabels: { display: false },
      pointRadius: isMobile ? 0 : 3,
      pointHoverRadius: isMobile ? 0 : 6,
    },
    goal: {
      type: 'line',
      label: 'Goal',
      yAxisID: 'y1',
      borderColor: '#FF6384',
      data: isAccumulatedView ? goalLineAccumulated : goalLineDaily,
      // Specific properties
      borderWidth: 2,
      borderDash: [5, 5],
      fill: false,
      pointRadius: 0,
      datalabels: { display: false },
    },
    projects: {
      type: 'line',
      label: 'Projects Won',
      yAxisID: 'y3',
      borderColor: '#A855F7',
      data: chartData.projectsCount,
      // Specific properties
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      datalabels: {
        display: true,
        align: 'top',
        formatter: (value) => value || '',
        font: { weight: 'bold', size: isMobile ? 10 : 11 },
      },
    },
  };

  // Map chart selections to datasets
  const chartSelections = {
    'Work': ['earnings', 'goal'],
    'Work & Projects': ['earnings', 'goal', 'projects'],
    'All': ['earnings', 'goal', 'projects'],
  };

  const datasets = chartSelections[selectedCharts].map(key => datasetConfigs[key]);

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          display: true,
          autoSkip: true,
          maxTicksLimit: isMobile ? 5 : 10,
          font: { size: isMobile ? 10 : 12 },
        },
      },
    },
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
    },
  };

  const options = {
    ...baseChartOptions,
    scales: {
      ...baseChartOptions.scales,
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
      y3: {
        type: 'linear',
        display: selectedCharts !== 'Work',
        position: 'right',
        beginAtZero: true,
        max: Math.max(...chartData.projectsCount, 10),
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div className="mb-8 px-4">
      <div className="flex items-center justify-between mb-4 flex-wrap">
        {isMobile ? (
          <div className="w-full mb-2">
            <select
              value={selectedCharts}
              onChange={(e) => setSelectedCharts(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {Object.keys(chartSelections).map((tab) => (
                <option key={tab} value={tab}>{tab}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {Object.keys(chartSelections).map((tab) => (
              <TabButton
                key={tab}
                isActive={selectedCharts === tab}
                onClick={() => setSelectedCharts(tab)}
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                {tab}
              </TabButton>
            ))}
          </div>
        )}

        <SecondaryButton
          onClick={toggleChartView}
          className="mt-2 sm:mt-0 text-xs sm:text-sm whitespace-nowrap"
        >
          Switch to {isAccumulatedView ? 'Daily' : 'Accumulated'} View
        </SecondaryButton>
      </div>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[300px] max-w-full h-64 sm:h-80 lg:h-96">
          <Chart type="line" data={{ labels: chartData.labels, datasets }} options={options} />
        </div>
      </div>
    </div>
  );
};

const ActivityTracker = ({ activityData, today }) => {
  const getColorLevel = (percentage) => {
    if (percentage >= 100) return 'bg-yellow-400';
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 60) return 'bg-green-500';
    if (percentage >= 40) return 'bg-green-400';
    if (percentage >= 20) return 'bg-green-300';
    if (percentage > 0) return 'bg-green-200';
    return 'bg-gray-100';
  };

  const getTooltipContent = (date, earnings, dailyGoal) => {
    return (
      <div>
        <strong>Date:</strong> {date.toLocaleDateString()}<br />
        <strong>Earnings:</strong> ${earnings} / ${dailyGoal.toFixed(2)}
      </div>
    );
  };

  // Generate array of all dates for the past 6 months
  const generatePastSixMonths = () => {
    const dates = [];
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 6);
    
    // Convert activityData to a map for easier lookup
    const activityMap = new Map(
      activityData.map(data => [data.date.toISOString().split('T')[0], data])
    );

    // Generate all dates
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = new Date(d).toISOString().split('T')[0];
      const existingData = activityMap.get(dateKey);
      
      dates.push({
        date: new Date(d),
        earnings: existingData?.earnings || 0,
        dailyGoal: existingData?.dailyGoal || 0,
        percentage: existingData?.percentage || 0
      });
    }

    return dates;
  };

  const allDates = generatePastSixMonths();
  const firstDayOfWeek = allDates[0].date.getDay();

  return (
    <div className="px-4">
      <div className="flex justify-end">
        <div className="flex flex-wrap gap-1 max-w-[728px]">
          {/* Fill the empty squares for the first week */}
          {[...Array(firstDayOfWeek)].map((_, index) => (
            <div key={`empty-${index}`} className="w-4 h-4"></div>
          ))}
          
          {/* Render all squares */}
          {allDates.map((data) => (
            <Tippy
              key={data.date.toISOString()}
              content={getTooltipContent(data.date, data.earnings, data.dailyGoal)}
              allowHTML={true}
            >
              <div
                className={`w-4 h-4 rounded ${getColorLevel(data.percentage)}`}
              ></div>
            </Tippy>
          ))}
        </div>
      </div>
    </div>
  );
};


const MetricsDashboard = ({ selectedGoal, currentMonthRecords, selectedDate, activityData }) => {
  const {
    totalEarnings,
    averageEarningsPerDay,
    remainingDays,
    dailyPace,
  } = useMemo(() => {
    const today = new Date();
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const daysPassed = today.getDate();

    const records = Object.values(currentMonthRecords);
    const totalEarnings = records.reduce((sum, rec) => sum + (rec.earnings || 0), 0);

    const averageEarningsPerDay = daysPassed ? totalEarnings / daysPassed : 0;

    const remainingDays = daysInMonth - daysPassed;
    const remainingGoal = selectedGoal - totalEarnings;
    const dailyPace = remainingDays > 0 ? remainingGoal / remainingDays : 0;

    return {
      totalEarnings,
      averageEarningsPerDay,
      remainingDays,
      dailyPace,
    };
  }, [selectedGoal, currentMonthRecords, selectedDate]);

  return (
    <div className="space-y-8">
      {/* Simplified Monthly Progress */}
      <div className="bg-white p-6 rounded-lg">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-lg text-gray-600 mb-2">Monthly Progress</h3>
            <p className="text-4xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
            <p className="text-sm text-gray-500">of {formatCurrency(selectedGoal)} goal</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(Math.max(selectedGoal - totalEarnings, 0))}
            </p>
            <p className="text-sm text-gray-500">remaining</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((totalEarnings / selectedGoal) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Daily Target Card */}
      <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
        <div className="flex items-center space-x-4">
          <FiTarget className="text-orange-500 w-8 h-8" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Daily Target</h3>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(dailyPace)}</p>
            <p className="text-sm text-gray-600">
              needed daily for the next {remainingDays} days
            </p>
          </div>
        </div>
      </div>

      {/* Activity Tracker with updated styling */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Activity History (last 6 months)</h3>
        <ActivityTracker activityData={activityData} today={new Date()} />
      </div>
    </div>
  );
};



// 1. Primary Sections - More subtle headers
const MainDashboard = ({ selectedGoal, onGoalChange, loading }) => (
  <div className="bg-white rounded-3xl p-8 mb-12 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-medium text-gray-600">Monthly Goal</h2>
      </div>
      {loading.goal ? (
        <div className="w-48 h-12 bg-gray-100 animate-pulse rounded-2xl"></div>
      ) : (
        <select
          className="bg-white text-xl font-medium text-gray-900 rounded-2xl 
                   px-6 py-3 border border-gray-200 focus:outline-none focus:ring-2 
                   focus:ring-blue-500 shadow-sm transition-all appearance-none 
                   cursor-pointer hover:border-gray-300"
          value={selectedGoal}
          onChange={onGoalChange}
        >
          {[3000, 5000, 10000, 20000, 30000].map(value => (
            <option key={value} value={value}>{formatCurrency(value)}</option>
          ))}
        </select>
      )}
    </div>
  </div>
);

// 2. Secondary Sections - Simplified headers
const DailySection = ({ loading, selectedDate, onDateChange, onDataChange, record }) => (
  <section className="bg-white rounded-3xl p-8 shadow-sm">
    <h2 className="text-lg font-medium text-gray-600 mb-8">Today's Progress</h2>
    {loading.records ? (
      <LoadingPlaceholder />
    ) : (
      <>
        <DateSelector date={selectedDate} onDateChange={onDateChange} />
        <DayInput
          onDataChange={onDataChange}
          record={record}
          date={selectedDate}
        />
      </>
    )}
  </section>
);

const MetricsSection = ({ loading, metrics, activityData }) => (
  <section className="bg-white rounded-3xl p-8 shadow-sm">
    <h2 className="text-lg font-medium text-gray-600 mb-8">Monthly Overview</h2>
    {loading.records || loading.pastYear ? (
      <MetricsLoadingPlaceholder />
    ) : (
      <MetricsDashboard {...metrics} activityData={activityData} />
    )}
  </section>
);

const ProgressSection = ({ loading, chartData, goalLines, isAccumulatedView, onToggleView }) => (
  <section className="col-span-1 lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm">
    <h2 className="text-lg font-medium text-gray-600 mb-8">Earnings Progress</h2>
    {loading.records || loading.pastYear ? (
      <ChartLoadingPlaceholder />
    ) : (
      <ProgressChart
        chartData={chartData}
        goalLineDaily={goalLines.daily}
        goalLineAccumulated={goalLines.accumulated}
        isAccumulatedView={isAccumulatedView}
        toggleChartView={onToggleView}
      />
    )}
  </section>
);

// Loading Placeholder Components
const LoadingPlaceholder = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 bg-gray-100 rounded-lg w-1/3"></div>
    <div className="h-32 bg-gray-100 rounded-xl"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-100 rounded w-5/6"></div>
      <div className="h-4 bg-gray-100 rounded w-4/6"></div>
    </div>
  </div>
);

const ChartLoadingPlaceholder = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-64 bg-gray-100 rounded-xl"></div>
    <div className="flex justify-center space-x-2">
      <div className="h-4 w-20 bg-gray-100 rounded"></div>
      <div className="h-4 w-20 bg-gray-100 rounded"></div>
      <div className="h-4 w-20 bg-gray-100 rounded"></div>
    </div>
  </div>
);

const MetricsLoadingPlaceholder = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex justify-between">
      <div className="h-16 w-32 bg-gray-100 rounded-lg"></div>
      <div className="h-16 w-32 bg-gray-100 rounded-lg"></div>
    </div>
    <div className="h-4 bg-gray-100 rounded-full"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
    </div>
  </div>
);

// Add this helper function to aggregate weekly data
const aggregateWeeklyData = (records) => {
  const weeks = {};
  
  Object.entries(records || {}).forEach(([dateStr, data]) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();
    
    // Only process current year's data
    if (year === currentYear) {
      // Get week number (1-52)
      const weekNum = Math.ceil((date - new Date(year, 0, 1)) / (7 * 24 * 60 * 60 * 1000));
      weeks[weekNum] = (weeks[weekNum] || 0) + (data.earnings || 0);
    }
  });

  // Convert to array of 52 weeks, filling missing weeks with 0
  return Array.from({ length: 52 }, (_, i) => weeks[i + 1] || 0);
};

// Modify ProfileCard to use aggregated data
const ProfileCard = ({ profile, isOwnProfile }) => {
  const navigate = useNavigate();
  
  // Generate last 7 months of labels
  const getLastSevenMonths = () => {
    const months = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(date.toLocaleString('default', { month: 'short' }));
    }
    return months;
  };

  // Prepare chart data for the last 7 months
  const monthlyData = useMemo(() => {
    const aggregates = profile.aggregates?.monthly || {};
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const monthIndex = (today.getMonth() - i + 12) % 12;
      // Convert to thousands
      data.push((aggregates[monthIndex] || 0) / 1000);
    }
    
    return data;
  }, [profile.aggregates]);

  const chartData = {
    labels: getLastSevenMonths(),
    datasets: [{
      data: monthlyData,
      borderColor: '#FF9F1C',
      borderWidth: 2,
      backgroundColor: 'rgba(255, 159, 28, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: { 
        enabled: true,
        callbacks: {
          label: (context) => `$${context.raw}k`
        }
      },
      datalabels: {
        display: false
      }
    },
    scales: {
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          color: '#999',
          padding: 8
        }
      },
      y: {
        border: { display: false },
        position: 'left',
        grid: { display: false },
        beginAtZero: true,
        ticks: {
          font: { size: 11 },
          color: '#999',
          padding: 8,
          callback: value => `$${value}k`
        }
      }
    }
  };

  // Format the monthly average to handle no data
  const formatMonthlyAverage = (average) => {
    if (!average || isNaN(average)) return '$0';
    return `$${(average / 1000).toFixed(1)}k`;
  };

  return (
    <div 
      onClick={() => navigate(`/${encodeURIComponent(profile.name)}`)}
      className="bg-white rounded-3xl p-6 hover:shadow-md transition-all 
                 duration-300 cursor-pointer border border-gray-100"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-50 rounded-xl">
            <FiUser className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {profile.name}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {profile.tagline || "Track your income progress"}
            </p>
          </div>
        </div>
        <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
          <FiCreditCard className="w-4 h-4 text-blue-500 mr-1.5" />
          <span className="text-sm font-medium text-blue-600">
            {formatMonthlyAverage(profile.monthlyAverage)}
          </span>
          <span className="text-sm text-blue-400 ml-0.5">/mo</span>
        </div>
      </div>

      <div className="h-36">
        <Chart type="line" data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

// Modify ProfileSelection to only fetch necessary data
const ProfileSelection = () => {
  const [profiles, setProfiles] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const profilesCollection = collection(db, 'profiles');
        const snapshot = await getDocs(profilesCollection);
        
        const profilesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setProfiles(profilesData);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl font-semibold text-gray-900 tracking-tight mb-6">
            Track Together
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Monitor your freelance income alongside a community of independent professionals. 
            Share progress, stay motivated, and grow together.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Profiles Grid */}
        {profiles.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Community</h2>
              <span className="text-sm text-gray-500">{profiles.length} active members</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles
                .sort((a, b) => {
                  // Sort user's profile first if logged in
                  if (currentUser) {
                    if (a.userId === currentUser.uid) return -1;
                    if (b.userId === currentUser.uid) return 1;
                  }
                  return 0;
                })
                .map(profile => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    isOwnProfile={currentUser && profile.userId === currentUser.uid}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {profiles.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 
                          bg-blue-50 rounded-full mb-6">
              <FiUser className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Be the first to join
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Sign in to start tracking your freelance journey
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

// Modify the Dashboard component to use URL params
const Dashboard = () => {
  const { profileName } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [userId, setUserId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(10000);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonthRecords, setCurrentMonthRecords] = useState({});
  const [isAccumulatedView, setIsAccumulatedView] = useState(false);
  const [loading, setLoading] = useState({
    goal: true,
    records: true,
    pastYear: true
  });
  const [activityData, setActivityData] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    earnings: [],
    projectsCount: []
  });
  const [goalLineDaily, setGoalLineDaily] = useState([]);
  const [goalLineAccumulated, setGoalLineAccumulated] = useState([]);

  // Effect to fetch profile and check ownership
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profilesCollection = collection(db, 'profiles');
        const q = query(profilesCollection, where('name', '==', profileName));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          navigate('/');
          return;
        }

        const profileData = snapshot.docs[0].data();
        setUserId(snapshot.docs[0].id);
        
        // Check if current user owns this profile
        setIsOwner(currentUser && profileData.userId === currentUser.uid);
        
        // Continue with your existing data fetching...
        setLoading({
          goal: false,
          records: false,
          pastYear: false
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        navigate('/');
      }
    };

    fetchProfile();
  }, [profileName, currentUser, navigate]);

  // Effect to fetch user data and past year records
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', userId), {
            monthlyGoal: 10000,
            records: {},
            createdAt: new Date().toISOString()
          });
          setSelectedGoal(10000);
        } else {
          setSelectedGoal(userDoc.data().monthlyGoal || 10000);
          setCurrentMonthRecords(userDoc.data().records || {});
        }

        // Calculate past year data
        const today = new Date();
        const pastYear = new Date(today);
        pastYear.setFullYear(today.getFullYear() - 1);

        const records = userDoc.data().records || {};
        const sortedDates = Object.keys(records).sort();
        
        // Prepare chart data
        const chartLabels = [];
        const chartEarnings = [];
        const chartProjects = [];
        
        sortedDates.forEach(date => {
          chartLabels.push(new Date(date).toLocaleDateString());
          chartEarnings.push(records[date]?.earnings || 0);
          chartProjects.push(records[date]?.projectsCount || 0);
        });

        setChartData({
          labels: chartLabels,
          earnings: chartEarnings,
          projectsCount: chartProjects
        });

        // Calculate goal lines
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const dailyGoal = selectedGoal / daysInMonth;
        
        setGoalLineDaily(chartLabels.map(() => dailyGoal));
        
        let accumulated = 0;
        setGoalLineAccumulated(chartLabels.map((_, index) => {
          accumulated += dailyGoal;
          return accumulated;
        }));

        // Prepare activity data
        const activityDataArray = sortedDates.map(date => ({
          date: new Date(date),
          earnings: records[date]?.earnings || 0,
          dailyGoal: dailyGoal,
          percentage: ((records[date]?.earnings || 0) / dailyGoal) * 100
        }));

        setActivityData(activityDataArray);
        
        // Update loading states
        setLoading(prev => ({
          ...prev,
          goal: false,
          records: false,
          pastYear: false
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(prev => ({
          ...prev,
          goal: false,
          records: false,
          pastYear: false
        }));
      }
    };

    fetchUserData();
  }, [userId, selectedGoal]); // Added selectedGoal as dependency

  // Handler functions
  const handleGoalChange = async (e) => {
    if (!userId) return;
    const newGoal = parseInt(e.target.value);
    setSelectedGoal(newGoal);
    try {
      await setDoc(doc(db, 'users', userId), { monthlyGoal: newGoal }, { merge: true });
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  // Add this function to aggregate data when saving records
  const handleDataChange = async (date, updates) => {
    if (!userId) return;
    const dateKey = date.toISOString().split('T')[0];
    
    try {
      // Update records in users collection
      const updatedRecords = {
        ...currentMonthRecords,
        [dateKey]: {
          ...(currentMonthRecords[dateKey] || {}),
          ...updates
        }
      };
      setCurrentMonthRecords(updatedRecords);

      // Calculate weekly and monthly aggregates
      const weekNum = Math.ceil((date - new Date(date.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
      const monthNum = date.getMonth();
      
      // Get profile reference
      const profileRef = doc(db, 'profiles', userId);
      const profileDoc = await getDoc(profileRef);
      const currentAggregates = profileDoc.data().aggregates || {
        weekly: {},
        monthly: {}
      };

      // Update weekly aggregate
      currentAggregates.weekly[weekNum] = (currentAggregates.weekly[weekNum] || 0) + 
        (updates.earnings - (currentMonthRecords[dateKey]?.earnings || 0));

      // Update monthly aggregate
      currentAggregates.monthly[monthNum] = (currentAggregates.monthly[monthNum] || 0) + 
        (updates.earnings - (currentMonthRecords[dateKey]?.earnings || 0));

      // Batch write to both collections
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', userId), {
        records: updatedRecords
      });
      batch.update(profileRef, {
        aggregates: currentAggregates,
        monthlyAverage: Object.values(currentAggregates.monthly).reduce((sum, val) => sum + val, 0) / 
          Object.keys(currentAggregates.monthly).length
      });
      
      await batch.commit();

      // Calculate daily goal
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const dailyGoal = selectedGoal / daysInMonth;

      // Update activity data immediately
      setActivityData(prev => {
        const dateStr = date.toISOString().split('T')[0];
        return prev.map(activity => {
          if (activity.date.toISOString().split('T')[0] === dateStr) {
            return {
              ...activity,
              earnings: updates.earnings || activity.earnings,
              dailyGoal,
              percentage: ((updates.earnings || activity.earnings) / dailyGoal) * 100
            };
          }
          return activity;
        });
      });

      await setDoc(doc(db, 'users', userId), {
        records: updatedRecords
      }, { merge: true });
    } catch (error) {
      console.error('Error updating records:', error);
    }
  };

  const getRecordForSelectedDate = () => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    return currentMonthRecords[dateKey] || {};
  };

  const toggleChartView = () => {
    setIsAccumulatedView(!isAccumulatedView);
  };

  if (!userId) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      <header className="pt-16 pb-12 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            {profileName}'s Dashboard
          </h1>
          <p className="text-base text-gray-500 mt-2 tracking-tight">
            {isOwner ? 'Manage your income and track your progress.' : 'View income progress.'}
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Only show MainDashboard if owner */}
        {isOwner && (
          <MainDashboard 
            selectedGoal={selectedGoal}
            onGoalChange={handleGoalChange}
            loading={loading}
          />
        )}

        {/* Only show DailySection if owner */}
        {isOwner && (
          <DailySection 
            loading={loading}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onDataChange={handleDataChange}
            record={getRecordForSelectedDate()}
          />
        )}

        {/* Always show MetricsSection and ProgressSection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <MetricsSection 
            loading={loading}
            metrics={{
              selectedGoal,
              currentMonthRecords,
              selectedDate,
            }}
            activityData={activityData}
          />

          <ProgressSection 
            loading={loading}
            chartData={chartData}
            goalLines={{
              daily: goalLineDaily,
              accumulated: goalLineAccumulated
            }}
            isAccumulatedView={isAccumulatedView}
            onToggleView={toggleChartView}
          />
        </div>
      </main>
    </div>
  );
};

// Define Header component before App
const Header = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if profile already exists for this user
      const profilesCollection = collection(db, 'profiles');
      const q = query(profilesCollection, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Create new profile using user's display name
        const newProfileRef = await addDoc(profilesCollection, {
          name: user.displayName,
          createdAt: new Date().toISOString(),
          userId: user.uid,
          aggregates: {
            weekly: {},
            monthly: {}
          },
          monthlyAverage: 0
        });

        // Create corresponding user document
        await setDoc(doc(db, 'users', newProfileRef.id), {
          monthlyGoal: 10000,
          records: {},
          createdAt: new Date().toISOString(),
          userId: user.uid
        });

        // Navigate to new profile
        navigate(`/${encodeURIComponent(user.displayName)}`);
      } else {
        // Navigate to existing profile
        const profileData = snapshot.docs[0].data();
        navigate(`/${encodeURIComponent(profileData.name)}`);
      }
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Income Tracker
          </h1>
        </div>
        {currentUser ? (
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-500">Signed in as</span>{' '}
              <span className="font-medium text-gray-900">{currentUser.displayName}</span>
            </div>
            <SecondaryButton
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </SecondaryButton>
          </div>
        ) : (
          <PrimaryButton
            onClick={handleLogin}
            className="flex items-center space-x-2"
          >
            <FiLogIn className="w-4 h-4" />
            <span>Sign in with Google</span>
          </PrimaryButton>
        )}
      </div>
    </header>
  );
};

// Then define App component
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#FBFBFD]">
          <Header />
          <Routes>
            <Route path="/" element={<ProfileSelection />} />
            <Route path="/:profileName" element={<Dashboard />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
