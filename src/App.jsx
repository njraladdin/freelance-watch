import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Chart } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, LineController, BarController } from 'chart.js';
import { FiBriefcase, FiDollarSign, FiMinus, FiPlus, FiChevronLeft, FiChevronRight, FiClock, FiCreditCard, FiTarget, FiUser, FiLogIn, FiLogOut, FiEdit2 } from 'react-icons/fi';
import { db } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, query, where, addDoc, writeBatch } from 'firebase/firestore';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { AuthProvider, useAuth } from './contexts/AuthContext';



const useTrackerInputs = (userId, updateTrackerState, trackerState) => {
  const handleInputUpdate = useCallback(async (type, value, date = new Date()) => {
    if (!userId) return;
    
    const dateKey = date.toISOString().split('T')[0];
    let updates = {};

    switch (type) {
      case 'goal':
        // Prepare updates
        updates = { selectedGoal: parseInt(value) };
        
        try {
          // Single write to Firebase
          await setDoc(doc(db, 'users', userId), { monthlyGoal: value }, { merge: true });
          
          // If successful, update local state
          const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
          updateTrackerState(date, {
            _initializeState: {
              selectedGoal: parseInt(value),
              // Update activity data with new goal
              activityData: trackerState.activityData.map(activity => ({
                ...activity,
                dailyGoal: value / daysInMonth,
                percentage: (activity.earnings / (value / daysInMonth)) * 100
              })),
              // Update goal line with new goal
              goalLineAccumulated: trackerState.chartData.labels.map((_, index) => 
                (value / trackerState.chartData.labels.length) * (index + 1)
              )
            }
          });
        } catch (error) {
          console.error('Error updating goal:', error);
        }
        break;

      case 'earnings':
        updates = { earnings: Math.max(value, 0) };
        try {
          // Update the path to include 'records' in the document structure
          await setDoc(doc(db, 'users', userId), {
            records: {
              [dateKey]: updates
            }
          }, { merge: true });
          
          // If successful, update local state
          updateTrackerState(date, updates);
        } catch (error) {
          console.error('Error updating earnings:', error);
        }
        break;

      case 'projects':
        // Toggle projects if clicking same value
        const newValue = value.current === value.clicked ? 0 : value.clicked;
        updates = { projectsCount: newValue };
        
        try {
          // Single write to Firebase
          await setDoc(doc(db, 'users', userId), {
            [`records.${dateKey}`]: updates
          }, { merge: true });
          
          // If successful, update local state
          updateTrackerState(date, updates);
        } catch (error) {
          console.error('Error updating projects:', error);
        }
        break;

      default:
        return;
    }
  }, [userId, updateTrackerState, trackerState]);

  return handleInputUpdate;
};
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

const DayInput = React.memo(({ onInputUpdate, record, date }) => {
  const handleAmountChange = (value) => {
    onInputUpdate('earnings', value, date);
  };

  const handleProjectVisualClick = (value) => {
    onInputUpdate('projects', {
      current: record.projectsCount,
      clicked: value
    }, date);
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

const ProgressChart = ({ chartData, goalLineAccumulated }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const datasets = [
    {
      type: 'line',
      label: 'Earnings (USD)',
      yAxisID: 'y1',
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      data: chartData.earnings,
      borderWidth: 4,
      fill: true,
      tension: 0.1,
      datalabels: { display: false },
      pointRadius: isMobile ? 0 : 3,
      pointHoverRadius: isMobile ? 0 : 6,
    },
    {
      type: 'line',
      label: 'Goal',
      yAxisID: 'y1',
      borderColor: '#FF6384',
      data: goalLineAccumulated,
      borderWidth: 2,
      borderDash: [5, 5],
      fill: false,
      pointRadius: 0,
      datalabels: { display: false },
    },
    {
      type: 'line',
      label: 'Projects Won',
      yAxisID: 'y3',
      borderColor: '#A855F7',
      data: chartData.projectsCount,
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
  ];

  const options = {
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
        display: true,
        position: 'right',
        beginAtZero: true,
        max: Math.max(...chartData.projectsCount, 10),
        grid: { drawOnChartArea: false },
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

  return (
    <div className="mb-8 px-4">
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
      <div className="flex justify-center">
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





// 2. Secondary Sections - Simplified headers
const DailySection = ({ loading, selectedDate, onDateChange, onInputUpdate, record }) => (
  <section className="bg-white rounded-3xl p-8 shadow-sm">
    <h2 className="text-lg font-medium text-gray-600 mb-8">Today's Progress</h2>
    {loading ? (
      <LoadingPlaceholder />
    ) : (
      <>
        <DateSelector date={selectedDate} onDateChange={onDateChange} />
        <DayInput
          onInputUpdate={onInputUpdate}
          record={record}
          date={selectedDate}
        />
      </>
    )}
  </section>
);

const MetricsSection = ({ loading, metrics, activityData, className = '' }) => (
  <section className={`bg-white rounded-3xl p-8 shadow-sm ${className}`}>
    <h2 className="text-lg font-medium text-gray-600 mb-8">Monthly Overview</h2>
    {loading ? (
      <MetricsLoadingPlaceholder />
    ) : (
      <MetricsDashboard {...metrics} activityData={activityData} />
    )}
  </section>
);

const ProgressSection = ({ loading, chartData, goalLineAccumulated, className = '' }) => (
  <section className={`col-span-1 lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm ${className}`}>
    <h2 className="text-lg font-medium text-gray-600 mb-8">Earnings Progress</h2>
    {loading ? (
      <ChartLoadingPlaceholder />
    ) : (
      <ProgressChart
        chartData={chartData}
        goalLineAccumulated={goalLineAccumulated}
      />
    )}
  </section>
);

// Loading Placeholder Components
const Skeleton = ({ className = '', count = 1 }) => (
  <div className="animate-pulse space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className={`bg-gray-100 rounded ${className}`}></div>
    ))}
  </div>
);

const LoadingPlaceholder = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-48" />
    <Skeleton className="h-32" />
    <Skeleton className="h-12" count={3} />
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


// Replace the DEFAULT_TAGLINES array with a single default tagline
const DEFAULT_TAGLINE = "Freelance wizard at work 🪄";

// Add this new reusable component near the other shared components
const MonthlyIncomePill = ({ amount, className = '' }) => (
  <div className={`flex items-center justify-center bg-blue-50 px-4 py-2 rounded-xl ${className}`}>
    <FiCreditCard className="w-5 h-5 text-blue-500 mr-2" />
    <span className="text-sm sm:text-base font-medium text-blue-600">
      {formatCurrency(amount)}
    </span>
    <span className="text-xs sm:text-sm text-blue-400 ml-1">/mo</span>
  </div>
);

// Update ProfileCard component (replace the existing monthly average display)
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
              {profile.tagline || DEFAULT_TAGLINE}
            </p>
          </div>
        </div>
        <MonthlyIncomePill amount={profile.monthlyAverage} />
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

  // Add handleAuth function
  const handleAuth = async (isJoining = false) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if profile already exists for this user
      const profilesCollection = collection(db, 'profiles');
      const q = query(profilesCollection, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        if (!isJoining) {
          // User tried to sign in but doesn't have an account
          await signOut(auth);
          alert('No account found. Please join first.');
          return;
        }

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
        if (isJoining) {
          // User tried to join but already has an account
          alert('Account already exists. Please sign in instead.');
        }
        // Navigate to existing profile
        const profileData = snapshot.docs[0].data();
        navigate(`/${encodeURIComponent(profileData.name)}`);
      }
    } catch (error) {
      console.error('Auth Error:', error);
    }
  };

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
          <img 
            src="/cat.png" 
            alt="Freelance Watch Logo" 
            className="w-24 h-24 mx-auto mb-8"
          />
          <h1 className="text-5xl font-semibold text-gray-900 tracking-tight mb-6">
            Freelance Watch
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12">
            Monitor your freelance income alongside a community of independent professionals. 
            Share progress, stay motivated, and grow together.
          </p>
          
          {/* Only show CTA buttons for non-authenticated users */}
          {!currentUser && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <button
                onClick={() => handleAuth(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 
                         bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium
                         rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <div className="bg-white p-1 rounded">
                  <GoogleLogo />
                </div>
                <span>Join the Community</span>
              </button>
              
              <button
                onClick={() => handleAuth(false)}
                className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4
                         bg-white hover:bg-gray-50 text-gray-600 text-lg
                         rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-md 
                         transition-all"
              >
                <GoogleLogo />
                <span>Sign in</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Profiles Grid */}
        {profiles.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Community</h2>
              <span className="text-sm text-gray-500">
                {profiles.length} {profiles.length === 1 ? 'active member' : 'active members'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

// Add this custom hook at the top level
const useTrackerState = (initialData = {}) => {
  const [state, setState] = useState({
    currentMonthRecords: {},
    chartData: { labels: [], earnings: [], projectsCount: [] },
    activityData: [],
    goalLineAccumulated: [],
    monthlyAverage: 0,
    ...initialData
  });

  const updateRecord = useCallback((date, updates) => {
    const dateKey = date.toISOString().split('T')[0];
    
    setState(prevState => {
      // Handle initialization update
      if (updates._initializeState) return { ...prevState, ...updates._initializeState };

      // Handle regular updates
      const updatedRecords = {
        ...prevState.currentMonthRecords,
        [dateKey]: { ...(prevState.currentMonthRecords[dateKey] || {}), ...updates }
      };

      // Calculate new state
      const sortedDates = Object.keys(updatedRecords).sort();
      const newState = {
        ...prevState,
        currentMonthRecords: updatedRecords,
        chartData: {
          labels: sortedDates.map(date => new Date(date).toLocaleDateString()),
          earnings: sortedDates.map(date => updatedRecords[date]?.earnings || 0),
          projectsCount: sortedDates.map(date => updatedRecords[date]?.projectsCount || 0)
        }
      };

      // Update activity data if needed
      if (updates.earnings !== undefined) {
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const dailyGoal = prevState.selectedGoal / daysInMonth;
        newState.activityData = prevState.activityData.map(activity => 
          activity.date.toISOString().split('T')[0] === dateKey
            ? {
                ...activity,
                earnings: updates.earnings,
                dailyGoal,
                percentage: (updates.earnings / dailyGoal) * 100
              }
            : activity
        );
      }

      return newState;
    });
  }, []);

  return [state, updateRecord];
};

// Update Dashboard component (replace the existing monthly average display)
const Dashboard = () => {
  const { profileName } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [userId, setUserId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(10000);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonthRecords, setCurrentMonthRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    earnings: [],
    projectsCount: []
  });
  const [goalLineAccumulated, setGoalLineAccumulated] = useState([]);
  const [monthlyAverage, setMonthlyAverage] = useState(0);
  const [isEditingTagline, setIsEditingTagline] = useState(false);
  const [tagline, setTagline] = useState("");

  const [trackerState, updateTrackerState] = useTrackerState({
    selectedGoal,
    currentMonthRecords: {},
    chartData: {
      labels: [],
      earnings: [],
      projectsCount: []
    },
    activityData: [],
    goalLineAccumulated: []
  });

  const handleInputUpdate = useCallback(async (type, value, date = new Date()) => {
    if (!userId) return;
    
    const dateKey = date.toISOString().split('T')[0];
    let updates = {};

    switch (type) {
      case 'goal':
        // Prepare updates
        updates = { selectedGoal: parseInt(value) };
        
        try {
          // Single write to Firebase
          await setDoc(doc(db, 'users', userId), { monthlyGoal: value }, { merge: true });
          
          // If successful, update local state
          const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
          updateTrackerState(date, {
            _initializeState: {
              selectedGoal: parseInt(value),
              // Update activity data with new goal
              activityData: trackerState.activityData.map(activity => ({
                ...activity,
                dailyGoal: value / daysInMonth,
                percentage: (activity.earnings / (value / daysInMonth)) * 100
              })),
              // Update goal line with new goal
              goalLineAccumulated: trackerState.chartData.labels.map((_, index) => 
                (value / trackerState.chartData.labels.length) * (index + 1)
              )
            }
          });
        } catch (error) {
          console.error('Error updating goal:', error);
        }
        break;

      case 'earnings':
        updates = { earnings: Math.max(value, 0) };
        try {
          // Update the path to include 'records' in the document structure
          await setDoc(doc(db, 'users', userId), {
            records: {
              [dateKey]: updates
            }
          }, { merge: true });
          
          // Recalculate monthly average after updating earnings
          const userDoc = await getDoc(doc(db, 'users', userId));
          const records = userDoc.data()?.records || {};
          
          const monthlyTotals = {};
          Object.entries(records).forEach(([date, record]) => {
            const month = new Date(date).getMonth();
            monthlyTotals[month] = (monthlyTotals[month] || 0) + (record.earnings || 0);
          });
          const newMonthlyAverage = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0) / 
            Math.max(Object.keys(monthlyTotals).length, 1);

          // Update profile document with new monthly average
          await setDoc(doc(db, 'profiles', userId), {
            monthlyAverage: newMonthlyAverage
          }, { merge: true });
          
          // Update local state
          setMonthlyAverage(newMonthlyAverage);
          updateTrackerState(date, updates);
        } catch (error) {
          console.error('Error updating earnings:', error);
        }
        break;

      case 'projects':
        // Toggle projects if clicking same value
        const newValue = value.current === value.clicked ? 0 : value.clicked;
        updates = { projectsCount: newValue };
        
        try {
          // Single write to Firebase
          await setDoc(doc(db, 'users', userId), {
            [`records.${dateKey}`]: updates
          }, { merge: true });
          
          // If successful, update local state
          updateTrackerState(date, updates);
        } catch (error) {
          console.error('Error updating projects:', error);
        }
        break;

      default:
        return;
    }
  }, [userId, updateTrackerState]);

  // Update this handler to also set the local state
  const handleGoalChange = (e) => {
    const newGoal = parseInt(e.target.value);
    setSelectedGoal(newGoal);  // Add this line to update local state
    handleInputUpdate('goal', newGoal);
  };

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
        setMonthlyAverage(profileData.monthlyAverage || 0);
        setIsOwner(currentUser && profileData.userId === currentUser.uid);
        // Set tagline from profile or default
        setTagline(profileData.tagline || DEFAULT_TAGLINE);
        
        setLoading(false);
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
          const userData = userDoc.data();
          setSelectedGoal(userData.monthlyGoal || 10000);
          
          // Get the records
          const records = userData.records || {};
          const sortedDates = Object.keys(records).sort();
          
          // Prepare chart data
          const chartLabels = sortedDates.map(date => new Date(date).toLocaleDateString());
          const chartEarnings = sortedDates.map(date => records[date]?.earnings || 0);
          const chartProjects = sortedDates.map(date => records[date]?.projectsCount || 0);

          // Calculate goal lines
          const today = new Date();
          const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
          const dailyGoal = selectedGoal / daysInMonth;
          
          let accumulated = 0;
          const goalLine = chartLabels.map(() => {
            accumulated += dailyGoal;
            return accumulated;
          });

          // Prepare activity data
          const activityDataArray = sortedDates.map(date => ({
            date: new Date(date),
            earnings: records[date]?.earnings || 0,
            dailyGoal: dailyGoal,
            percentage: ((records[date]?.earnings || 0) / dailyGoal) * 100
          }));

          // Calculate monthly average
          const monthlyTotals = {};
          Object.entries(records).forEach(([date, record]) => {
            const month = new Date(date).getMonth();
            monthlyTotals[month] = (monthlyTotals[month] || 0) + (record.earnings || 0);
          });
          const newMonthlyAverage = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0) / 
            Math.max(Object.keys(monthlyTotals).length, 1);

          // Update profile document with new monthly average
          await setDoc(doc(db, 'profiles', userId), {
            monthlyAverage: newMonthlyAverage
          }, { merge: true });

          // Update all state at once using the tracker
          updateTrackerState(today, {
            earnings: records[today.toISOString().split('T')[0]]?.earnings || 0,
            projectsCount: records[today.toISOString().split('T')[0]]?.projectsCount || 0,
            _initializeState: {
              currentMonthRecords: records,
              chartData: {
                labels: chartLabels,
                earnings: chartEarnings,
                projectsCount: chartProjects
              },
              activityData: activityDataArray,
              goalLineAccumulated: goalLine,
              monthlyAverage: newMonthlyAverage,
              selectedGoal: userData.monthlyGoal || 10000
            }
          });

          setMonthlyAverage(newMonthlyAverage);
        }

        // Update all loading states at once
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Handler functions
  const handleTaglineUpdate = async (newTagline) => {
    if (!userId || !isOwner) return;
    
    try {
      await setDoc(doc(db, 'profiles', userId), {
        tagline: newTagline
      }, { merge: true });
      
      setTagline(newTagline);
      setIsEditingTagline(false);
    } catch (error) {
      console.error('Error updating tagline:', error);
    }
  };

  if (!userId) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className=" bg-[#FBFBFD]">
      <header className="pt-8 sm:pt-16 pb-8 sm:pb-12 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col space-y-4">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
                  {profileName}'s Page
                </h1>
                <div className="flex items-center mt-2">
                  {isEditingTagline ? (
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="text-sm sm:text-base text-gray-600 bg-white border border-gray-200 
                                 rounded-md px-3 py-1 focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                        placeholder="Enter your tagline..."
                        maxLength={50}
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTaglineUpdate(tagline)}
                          className="text-sm text-green-600 hover:text-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditingTagline(false)}
                          className="text-sm text-gray-500 hover:text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <p className="text-sm sm:text-base text-gray-500 tracking-tight">{tagline}</p>
                      {isOwner && (
                        <button
                          onClick={() => setIsEditingTagline(true)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="Edit tagline"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Goal and Monthly Income */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {isOwner && (
                  <div className="relative w-full sm:w-auto">
                    <select
                      className="w-full sm:w-auto appearance-none bg-gray-50 text-sm sm:text-base 
                               font-medium text-gray-700 rounded-xl pl-4 pr-10 py-2 border 
                               border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
                               cursor-pointer hover:bg-gray-100 transition-colors"
                      value={selectedGoal}
                      onChange={handleGoalChange}
                    >
                      {[3000, 5000, 10000, 20000, 30000].map(value => (
                        <option key={value} value={value}>Goal: {formatCurrency(value)}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}
                <MonthlyIncomePill amount={monthlyAverage} className="w-full sm:w-auto" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className={`grid grid-cols-1 ${isOwner ? 'lg:grid-cols-2' : ''} gap-6 sm:gap-12`}>
          {isOwner && (
            <DailySection 
              loading={loading}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onInputUpdate={handleInputUpdate}
              record={trackerState.currentMonthRecords[selectedDate.toISOString().split('T')[0]] || {}}
            />
          )}

          <MetricsSection 
            loading={loading}
            metrics={{
              selectedGoal,
              currentMonthRecords: trackerState.currentMonthRecords,
              selectedDate,
            }}
            activityData={trackerState.activityData}
            className={!isOwner ? 'lg:col-span-1' : ''}
          />

          <ProgressSection 
            loading={loading}
            chartData={trackerState.chartData}
            goalLineAccumulated={trackerState.goalLineAccumulated}
            className={!isOwner ? 'lg:col-span-1' : ''}
          />
        </div>
      </main>
    </div>
  );
};

// Add this Google logo component
const GoogleLogo = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// Add this new component for the mobile menu
const MobileMenu = ({ isOpen, onClose, currentUser, onAuth, onLogout }) => {
  return (
    <div 
      className={`fixed inset-0 bg-gray-800/50 backdrop-blur-sm z-50 transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div 
        className={`fixed inset-y-0 right-0 w-[280px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile Menu Content */}
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 float-right"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentUser ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-gray-500">Signed in as</p>
                  <p className="font-medium text-gray-900">{currentUser.displayName}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2
                           bg-white border border-gray-200 text-gray-600
                           rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => onAuth(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3
                           bg-blue-600 hover:bg-blue-700 text-white font-medium
                           rounded-xl shadow-sm transition-colors"
                >
                  <div className="bg-white p-0.5 rounded">
                    <GoogleLogo />
                  </div>
                  <span>Join with Google</span>
                </button>
                
                <button
                  onClick={() => onAuth(false)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3
                           bg-white hover:bg-gray-50 text-gray-600
                           rounded-xl border border-gray-200 shadow-sm transition-colors"
                >
                  <GoogleLogo />
                  <span>Sign in</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Update the Header component
const Header = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAuth = async (isJoining = false) => {
    setIsMobileMenuOpen(false);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if profile already exists for this user
      const profilesCollection = collection(db, 'profiles');
      const q = query(profilesCollection, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        if (!isJoining) {
          // User tried to sign in but doesn't have an account
          await signOut(auth);
          alert('No account found. Please join first.');
          return;
        }

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
        if (isJoining) {
          // User tried to join but already has an account
          alert('Account already exists. Please sign in instead.');
        }
        // Navigate to existing profile
        const profileData = snapshot.docs[0].data();
        navigate(`/${encodeURIComponent(profileData.name)}`);
      }
    } catch (error) {
      console.error('Auth Error:', error);
    }
  };

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <img 
                src="/cat.png" 
                alt="Freelance Watch Logo" 
                className="w-8 h-8 sm:w-9 sm:h-9 cursor-pointer"
                onClick={() => navigate('/')}
              />
              <h1 
                onClick={() => navigate('/')} 
                className="text-xl sm:text-2xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              >
                Freelance Watch
              </h1>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden sm:flex items-center space-x-4">
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
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAuth(true)}
                    className="flex items-center space-x-2 px-4 py-2 
                             bg-blue-600 hover:bg-blue-700 text-white font-medium 
                             rounded-xl shadow-sm transition-colors"
                  >
                    <div className="bg-white p-0.5 rounded">
                      <GoogleLogo />
                    </div>
                    <span>Join with Google</span>
                  </button>
                  
                  <button
                    onClick={() => handleAuth(false)}
                    className="flex items-center space-x-2 px-4 py-2 
                             bg-white hover:bg-gray-50 text-gray-600
                             rounded-xl border border-gray-200 shadow-sm transition-colors"
                  >
                    <GoogleLogo />
                    <span>Sign in</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="sm:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentUser={currentUser}
        onAuth={handleAuth}
        onLogout={handleLogout}
      />
    </>
  );
};

// Add this new Footer component before the App component
const Footer = () => (
  <footer className="bg-white border-t border-gray-100 py-6">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
        <span>Contact developer:</span>
        <a 
          href="https://x.com/aladdinnjr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          @aladdinnjr
        </a>
      </div>
    </div>
  </footer>
);

// Update the App component to include the Footer
const App = () => {
  return (
    <AuthProvider>
    <BrowserRouter>
      <div className="flex flex-col  bg-[#FBFBFD]">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<ProfileSelection />} />
            <Route path="/:profileName" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  </AuthProvider>
  );
};

export default App;
