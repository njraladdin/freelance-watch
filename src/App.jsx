import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Chart } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, LineController, BarController } from 'chart.js';
import { FiBriefcase, FiDollarSign, FiMinus, FiPlus, FiChevronLeft, FiChevronRight, FiClock, FiCreditCard, FiTarget } from 'react-icons/fi';
import { db } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, query, where } from 'firebase/firestore';

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

  const firstDayOfWeek = new Date(activityData[0]?.date).getDay() || 0;

  return (
    <div className="px-4">
      <div className="flex justify-end">
        <div className="flex flex-wrap gap-1 max-w-[728px]">
          {/* Fill the empty squares for the first week */}
          {[...Array(firstDayOfWeek)].map((_, index) => (
            <div key={`empty-earnings-${index}`} className="w-4 h-4"></div>
          ))}
          {/* Render the activity squares */}
          {activityData.slice(-182).map((data, index) => (
            <Tippy
              key={`earnings-${data.date.toISOString()}`}
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
    averageEarningsPerHour,
    remainingDays,
    dailyPace,
  } = useMemo(() => {
    const today = new Date();
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const daysPassed = today.getDate();

    const records = Object.values(currentMonthRecords);
    const totalEarnings = records.reduce((sum, rec) => sum + (rec.earnings || 0), 0);

    // Calculate average earnings per day
    const averageEarningsPerDay = daysPassed ? totalEarnings / daysPassed : 0;

    // Calculate average earnings per hour based on 8-hour workday
    const averageEarningsPerHour = averageEarningsPerDay / 8;

    const remainingDays = daysInMonth - daysPassed;
    const remainingGoal = selectedGoal - totalEarnings;
    const dailyPace = remainingDays > 0 ? remainingGoal / remainingDays : 0;

    return {
      totalEarnings,
      averageEarningsPerDay,
      averageEarningsPerHour,
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

// Add this new Card component near the top with other components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl p-8 shadow-sm ${className}`}>
    {children}
  </div>
);

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

// Main App - Simplified hero section
const App = () => {
  const userId = 'defaultUser'; // Replace with actual user ID in production

  // Memoize Firestore references to prevent useEffect from triggering infinitely
  const recordsCollection = useMemo(
    () => collection(db, 'users', userId, 'records'),
    [userId]
  );

  // **Reference to monthlyGoals collection**
  const monthlyGoalsCollection = useMemo(
    () => collection(db, 'users', userId, 'monthlyGoals'),
    [userId]
  );

  const [loading, setLoading] = useState({
    goal: true,
    records: true,
    pastYear: true,
  });

  const [currentMonthRecords, setCurrentMonthRecords] = useState({});
  const [pastYearRecords, setPastYearRecords] = useState({});
  const [chartData, setChartData] = useState({
    earnings: [],
    projectsCount: [],
    labels: [],
  });
  const [goalLineDaily, setGoalLineDaily] = useState([]);
  const [goalLineAccumulated, setGoalLineAccumulated] = useState([]);
  const [isAccumulatedView, setIsAccumulatedView] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(5000);
  const [activityData, setActivityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Helper function to format date key using local time
  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // 'YYYY-MM-DD'
  };

  // Helper function to format month key
  const formatMonthKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 'MM'
    return `${year}-${month}`; // 'YYYY-MM'
  };

  // Helper function to get number of days in a month for a given date
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Helper function to calculate the start date (today - 365 days)
  const getStartDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pastYear = new Date(today);
    pastYear.setDate(today.getDate() - 364); // Including today
    return pastYear;
  };

  // **Fetch selectedGoal for the current month from Firestore on mount and when selectedDate changes**
  useEffect(() => {
    const fetchMonthlyGoal = async () => {
      setLoading(prev => ({ ...prev, goal: true }));
      const monthKey = formatMonthKey(selectedDate);
      const monthlyGoalDocRef = doc(monthlyGoalsCollection, monthKey);

      try {
        const monthlyGoalDoc = await getDoc(monthlyGoalDocRef);
        if (monthlyGoalDoc.exists()) {
          const data = monthlyGoalDoc.data();
          if (data.selectedGoal) {
            setSelectedGoal(data.selectedGoal);
          } else {
            // If selectedGoal doesn't exist, set to default
            setSelectedGoal(5000);
          }
        } else {
          // If monthly goal document doesn't exist, create it with default selectedGoal
          await setDoc(monthlyGoalDocRef, { selectedGoal: 5000 });
          console.log(`Monthly goal document created for ${monthKey} with selectedGoal: 5000`);
          setSelectedGoal(5000);
        }
      } catch (error) {
        console.error(`Failed to fetch selectedGoal for ${monthKey}:`, error);
        setSelectedGoal(5000); // Fallback to default
      } finally {
        setLoading(prev => ({ ...prev, goal: false, initialLoad: false }));
      }
    };

    fetchMonthlyGoal();
  }, [selectedDate, monthlyGoalsCollection]);

  // **Save selectedGoal to Firestore whenever it changes, but not on initial load**
  useEffect(() => {
    const saveMonthlyGoal = async () => {
      const monthKey = formatMonthKey(selectedDate);
      const monthlyGoalDocRef = doc(monthlyGoalsCollection, monthKey);

      try {
        const monthlyGoalDoc = await getDoc(monthlyGoalDocRef);
        if (monthlyGoalDoc.exists()) {
          const data = monthlyGoalDoc.data();
          if (data.selectedGoal !== selectedGoal) {
            await setDoc(monthlyGoalDocRef, { selectedGoal }, { merge: true });
            console.log(`Selected goal for ${monthKey} saved:`, selectedGoal);
          } else {
            console.log(`Selected goal for ${monthKey} is already up-to-date.`);
          }
        } else {
          // If monthly goal document doesn't exist, create it with selectedGoal
          await setDoc(monthlyGoalDocRef, { selectedGoal }, { merge: true });
          console.log(`Monthly goal document created for ${monthKey} with selectedGoal:`, selectedGoal);
        }
      } catch (error) {
        console.error(`Failed to save selectedGoal for ${monthKey}:`, error);
      }
    };

    // **Only save if selectedGoal is defined, valid, and not during initial load**
    if (selectedGoal && !isInitialLoad) {
      saveMonthlyGoal();
    }
  }, [selectedGoal, selectedDate, monthlyGoalsCollection, isInitialLoad]); // **Added isInitialLoad to dependencies**

  // **Load data for the current month**
  useEffect(() => {
    const loadCurrentMonthRecords = async () => {
      setLoading(prev => ({ ...prev, records: true }));
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1; // 1-12

      try {
        const q = query(
          recordsCollection,
          where('year', '==', year),
          where('month', '==', month)
        );
        const querySnapshot = await getDocs(q);
        const records = {};
        querySnapshot.forEach((docSnap) => {
          records[docSnap.id] = docSnap.data();
        });
        setCurrentMonthRecords(records);
        console.log(`Loaded current month data for ${year}-${month}:`, records);
      } catch (error) {
        console.error('Failed to load current month records:', error);
        setCurrentMonthRecords({});
      } finally {
        setLoading(prev => ({ ...prev, records: false }));
      }
    };

    loadCurrentMonthRecords();
  }, [selectedDate, recordsCollection]);

  // **Load data for the past year**
  useEffect(() => {
    const loadPastYearRecords = async () => {
      setLoading(prev => ({ ...prev, pastYear: true }));
      const startDate = getStartDate();
      const endDate = new Date();
      endDate.setHours(0, 0, 0, 0);

      const startDateKey = formatDateKey(startDate);
      const endDateKey = formatDateKey(endDate);

      try {
        const q = query(
          recordsCollection,
          where('date', '>=', startDateKey),
          where('date', '<=', endDateKey)
        );
        const querySnapshot = await getDocs(q);
        const records = {};
        querySnapshot.forEach((docSnap) => {
          records[docSnap.id] = docSnap.data();
        });
        setPastYearRecords(records);
        console.log(
          `Loaded past year data from ${startDateKey} to ${endDateKey}:`,
          records
        );
      } catch (error) {
        console.error('Failed to load past year records:', error);
        setPastYearRecords({});
      } finally {
        setLoading(prev => ({ ...prev, pastYear: false }));
      }
    };

    loadPastYearRecords();
  }, [recordsCollection]);

  // **Update chart data and activity data whenever dependencies change**
  useEffect(() => {
    if (loading.records || loading.pastYear) return;
    updateChartData();
    updateActivityData();
  }, [
    currentMonthRecords,
    pastYearRecords,
    selectedDate,
    selectedGoal,
    isAccumulatedView,
    loading.records,
    loading.pastYear,
  ]);

  const updateChartData = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = getDaysInMonth(selectedDate);

    const labels = Array.from({ length: daysInMonth }, (_, i) =>
      (i + 1).toString()
    );
    const earnings = [];
    const projectsCount = [];

    let accumulatedEarnings = [];
    let totalEarnings = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = formatDateKey(date);
      const isPastDay = date < today;
      const record = currentMonthRecords[dateKey] || {};

      // Earnings
      const earning = isPastDay && (record.earnings === undefined || record.earnings === null)
        ? 0
        : record.earnings || null;
      totalEarnings += earning || 0;
      earnings.push(earning !== undefined && earning !== null ? earning : isPastDay ? 0 : null);
      accumulatedEarnings.push(totalEarnings);

      // Won Projects
      const projects = isPastDay && (record.projectsCount === undefined || record.projectsCount === null)
        ? 0
        : record.projectsCount || null;
      projectsCount.push(projects !== undefined && projects !== null ? projects : isPastDay ? 0 : null);
    }

    // Update goal lines
    const dailyGoal = selectedGoal / daysInMonth;
    setGoalLineDaily(new Array(daysInMonth).fill(dailyGoal));
    setGoalLineAccumulated(labels.map((_, index) => dailyGoal * (index + 1)));

    setChartData({
      earnings: isAccumulatedView ? accumulatedEarnings : earnings,
      projectsCount,
      labels,
    });
  };

  // **Compute Activity Data**
  const updateActivityData = () => {
    const today = new Date();
    const dates = getLastYearDates(today);
    const data = dates.map((date) => {
      const dateKey = formatDateKey(date);
      const record = pastYearRecords[dateKey] || {};
      const earnings = record.earnings || 0;
      const dailyGoal =
        record.dailyGoal || selectedGoal / getDaysInMonth(date);
      const percentage = dailyGoal > 0 ? (earnings / dailyGoal) * 100 : 0;
      return {
        date,
        earnings,
        dailyGoal,
        percentage,
      };
    });
    setActivityData(data);
  };

  // Helper function to get the last 365 dates
  const getLastYearDates = (today) => {
    const dates = [];
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  const handleGoalChange = (event) => {
    const newGoal = parseInt(event.target.value);
    setSelectedGoal(newGoal); // Optimistically update the UI
  };

  const toggleChartView = () => {
    setIsAccumulatedView(!isAccumulatedView);
  };

  // **Handle Data Changes from DayInput**
  const handleDataChange = useCallback(async (date, data) => {
    const key = formatDateKey(date);
    const daysInMonth = getDaysInMonth(date);
    const dailyGoal = selectedGoal / daysInMonth;

    // Only include work-related fields
    const recordData = {
      ...data,
      date: key,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      dailyGoal,
    };

    // Optimistically update currentMonthRecords state
    setCurrentMonthRecords((prevRecords) => ({
      ...prevRecords,
      [key]: {
        ...prevRecords[key],
        ...recordData,
      },
    }));

    // Update pastYearRecords if the date is within the past year
    const startDate = getStartDate();
    if (date >= startDate && date <= new Date()) {
      setPastYearRecords((prevRecords) => ({
        ...prevRecords,
        [key]: {
          ...prevRecords[key],
          ...recordData,
        },
      }));
    }

    // Debounce Firebase writes
    if (handleDataChange.debounceTimeout) {
      clearTimeout(handleDataChange.debounceTimeout);
    }

    handleDataChange.debounceTimeout = setTimeout(async () => {
      try {
        const recordDocRef = doc(recordsCollection, key);
        await setDoc(recordDocRef, recordData, { merge: true });
        console.log(`Saved record for ${key}:`, recordData);
      } catch (error) {
        console.error(`Failed to save record for ${key}:`, error);
      }
    }, 500);
  }, [recordsCollection, selectedGoal]);

  const getRecordForSelectedDate = () => {
    const dateKey = formatDateKey(selectedDate);
    return currentMonthRecords[dateKey] || {};
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      {/* Hero Section - More focused messaging */}
      <header className="pt-16 pb-12 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Income Tracker
          </h1>
          <p className="text-base text-gray-500 mt-2 tracking-tight">
            Track your earnings. Meet your goals.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <MainDashboard 
          selectedGoal={selectedGoal}
          onGoalChange={handleGoalChange}
          loading={loading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <DailySection 
            loading={loading}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onDataChange={handleDataChange}
            record={getRecordForSelectedDate()}
          />

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

export default App;
