import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, LineController, BarController } from 'chart.js';
import { FiBriefcase, FiDollarSign, FiMinus, FiPlus, FiChevronLeft, FiChevronRight, FiClock, FiCreditCard, FiTarget, FiUser, FiLogIn, FiLogOut, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { db } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, query, where, addDoc, writeBatch } from 'firebase/firestore';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProgressChart from './components/ProgressChart';
import ProfileSelection from './components/ProfileSelection';
import { getGoalsPath, getRecordsPath, getStatsPath, calculateMonthlyAverage } from './firebase';
// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, LineController, BarController, ChartDataLabels);

// Add these color constants at the top of the file
const colors = {
  success: {
    primary: '#34C759', // Apple's success green
    light: '#E3F9E7',
    dark: '#248A3D'
  },
  accent: {
    primary: '#0A84FF', // Apple's blue
    light: '#E5F1FF',
    dark: '#0058B6'
  },
  warning: {
    primary: '#FF9F0A', // Apple's orange
    light: '#FFF4E5',
    dark: '#B36D00'
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
};

// Add this helper function near the top of the file, before any components
const formatCurrency = (amount) => 
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount ?? 0);

// Add this with the other helper functions at the top of the file
const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

// Add the getWeekNumber function here
const getWeekNumber = (date) => {
  // Create a copy of the date to avoid modifying the original
  const target = new Date(date.valueOf());
  // ISO week starts on Monday (1), so we adjust Sunday (0) to be 7
  const dayNr = (target.getDay() + 6) % 7;
  // Set to nearest Thursday
  target.setDate(target.getDate() - dayNr + 3);
  // Get first day of year
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  // Calculate week number
  const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
  
  console.log('📅 Week calculation:', {
    date: date.toISOString(),
    weekNumber,
    dayNr,
    firstThursday: new Date(firstThursday).toISOString()
  });
  
  return weekNumber;
};

// Then define components
const DateSelector = React.memo(({ date, onDateChange, disabled }) => {
  // Get today and tomorrow dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check if selected date is today or tomorrow
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  // Handle previous/next day
  const goToPreviousDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    if (newDate <= tomorrow) {
      onDateChange(newDate);
    }
  };

  return (
    <div className={`bg-white p-4 rounded-xl border border-neutral-200 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={goToPreviousDay}
          disabled={disabled}
          className="p-2 rounded-full hover:bg-neutral-100 disabled:cursor-not-allowed transition-colors"
        >
          <FiChevronLeft className="w-5 h-5 text-neutral-600" />
        </button>

        <div className="text-center">
          <DatePicker
            selected={date}
            onChange={onDateChange}
            dateFormat="dd/MMM/yyyy"
            maxDate={tomorrow}
            disabled={disabled}
            className="text-center border border-neutral-200 rounded-lg p-2 disabled:cursor-not-allowed hover:border-neutral-300 focus:border-accent-primary focus:outline-none transition-colors"
          />
          {(isToday || isTomorrow) && (
            <div className="mt-1 text-sm font-medium">
              {isToday ? (
                <span className="text-success-primary">Today</span>
              ) : (
                <span className="text-accent-primary">Tomorrow</span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={goToNextDay}
          disabled={disabled || date >= tomorrow}
          className="p-2 rounded-full hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

// First, let's create reusable UI components
const MetricCard = ({ icon: Icon, title, children, disabled }) => (
  <div className={`mt-6 sm:mt-8 p-6 sm:p-8 rounded-2xl border border-neutral-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 
    ${disabled ? 'opacity-50' : 'hover:border-neutral-200'}`}>
    <div className="flex items-center mb-4 sm:mb-6">
      <div className={`p-2 sm:p-3 ${Icon.color} rounded-xl transition-colors`}>
        <Icon.component className={`${Icon.textColor} w-6 h-6 sm:w-7 sm:h-7`} />
      </div>
      <h3 className="ml-3 sm:ml-4 text-lg sm:text-xl font-medium text-neutral-800">{title}</h3>
    </div>
    {children}
  </div>
);

// Simplified DailySection component
const DailySection = ({ 
  loading, 
  selectedDate, 
  onDateChange, 
  userId, 
  selectedGoal, 
  currentRecord, 
  onRecordUpdate,
  isUpdating,
  setIsUpdating 
}) => {
  const handleUpdate = useCallback(async (updates) => {
    if (isUpdating || loading || !userId) return;
    
    setIsUpdating(true);
    try {
      const monthKey = getMonthKey(selectedDate);
      const dayKey = selectedDate.getDate().toString();
      
      // Calculate percentage based on current day's earnings and current monthly goal
      const daysInMonth = getDaysInMonth(selectedDate);
      const dailyGoal = selectedGoal / daysInMonth;
      const percentage = ((updates.earnings || 0) / dailyGoal) * 100;
      
      // Get current month's records
      const recordsDoc = await getDoc(doc(db, getRecordsPath(userId, monthKey)));
      const monthRecords = recordsDoc.exists() ? recordsDoc.data().days || {} : {};
      
      // Update the specific day with percentage
      monthRecords[dayKey] = {
        ...monthRecords[dayKey],
        ...updates,
        percentage // Store the percentage with the record
      };
      
      // Calculate new monthly total
      const totalEarnings = Object.values(monthRecords).reduce((sum, day) => sum + (day.earnings || 0), 0);
      
      // Get profile document to update recentMonths
      const profileDoc = await getDoc(doc(db, 'profiles', userId));
      const profileData = profileDoc.exists() ? profileDoc.data() : {};
      const recentMonths = profileData.recentMonths || {};
      
      // Update the current month's total
      recentMonths[monthKey] = totalEarnings;
      
      // Calculate new monthly average using the helper function
      const monthlyAverage = calculateMonthlyAverage(recentMonths);
      
      const batch = writeBatch(db);
      
      // Update records
      batch.set(doc(db, getRecordsPath(userId, monthKey)), {
        days: monthRecords,
        totalEarnings,
        averageDailyEarnings: totalEarnings / Object.keys(monthRecords).length,
        projectsCompleted: Object.values(monthRecords).reduce((sum, day) => sum + (day.projectsCount || 0), 0)
      });

      // Update profile with new recentMonths and monthlyAverage
      batch.set(doc(db, 'profiles', userId), {
        recentMonths,
        monthlyAverage
      }, { merge: true });

      // Update stats
      batch.set(doc(db, getStatsPath(userId)), {
        monthlyAverages: {
          [monthKey]: totalEarnings
        },
        monthlyTotals: {
          [monthKey]: totalEarnings
        },
        lastUpdated: new Date()
      }, { merge: true });

      await batch.commit();
      
      // Update local state with new values
      onRecordUpdate({
        ...updates,
        percentage,
        recentMonths,
        monthlyAverage
      });
    } catch (error) {
      console.error('[handleUpdate] Error:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, loading, userId, selectedDate, selectedGoal, onRecordUpdate]);

  if (loading) return <LoadingPlaceholder />;

  return (
    <section className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h2 className="text-2xl font-medium text-gray-800 mb-8">Today's Progress</h2>
      
      <div className="mb-12">
        <DateSelector 
          date={selectedDate} 
          onDateChange={onDateChange} 
          disabled={isUpdating}
        />
      </div>
      
      <MetricCard 
        icon={{ 
          component: FiDollarSign, 
          color: 'bg-green-50', 
          textColor: 'text-green-500' 
        }} 
        title="Today's Income"
        disabled={isUpdating}
      >
        <div className="flex flex-col items-center justify-center space-y-6">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.target.elements.earnings;
              const newValue = Math.max(parseFloat(input.value) || 0, 0);
              if (!isNaN(newValue)) {
                handleUpdate({ earnings: newValue });
              }
              input.blur();
            }}
            className="relative"
          >
            <div className="relative group">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">$</span>
              <input
                type="number"
                name="earnings"
                defaultValue={currentRecord.earnings || 0}
                onFocus={(e) => e.target.select()}
                onBlur={(e) => {
                  const newValue = Math.max(parseFloat(e.target.value) || 0, 0);
                  if (!isNaN(newValue) && newValue !== currentRecord.earnings) {
                    handleUpdate({ earnings: newValue });
                  }
                }}
                disabled={isUpdating}
                className="w-48 sm:w-64 text-center text-3xl sm:text-5xl font-bold border-b-2 border-success-primary hover:border-success-dark focus:border-success-dark focus:outline-none disabled:cursor-not-allowed pl-8 sm:pl-12 py-2 sm:py-4 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <FiEdit2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 opacity-0 group-hover:opacity-100 group-focus-within:opacity-0 w-6 h-6" />
              <FiEdit2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 opacity-0 group-focus-within:opacity-100 w-6 h-6" />
            </div>
          </form>

          {isUpdating && (
            <div className="flex items-center space-x-2 text-sm text-green-500 animate-fade-in">
              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </div>
          )}
        </div>
      </MetricCard>

      <MetricCard 
        icon={{ 
          component: FiBriefcase, 
          color: 'bg-purple-50', 
          textColor: 'text-purple-500' 
        }} 
        title="Projects Won"
        disabled={isUpdating}
      >
        <div className="flex justify-center space-x-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              disabled={isUpdating}
              onClick={() => handleUpdate({ 
                projectsCount: currentRecord.projectsCount === num ? 0 : num 
              })}
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-base sm:text-lg font-medium transition-all duration-200
                ${currentRecord.projectsCount >= num 
                  ? 'bg-accent-primary text-white shadow-md hover:bg-accent-dark' 
                  : 'bg-neutral-50 hover:bg-accent-light hover:shadow-sm text-neutral-700 hover:text-accent-primary'}
                disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {currentRecord.projectsCount >= num ? <FiBriefcase className="w-5 h-5 sm:w-6 sm:h-6" /> : num}
            </button>
          ))}
        </div>
      </MetricCard>
    </section>
  );
};

// First, let's create a separate hook for metrics calculations
const useMetricsCalculation = (selectedGoal, currentMonthRecords, selectedDate) => {
  return useMemo(() => {
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    const monthRecords = Object.entries(currentMonthRecords).filter(([date]) => {
      const recordDate = new Date(date);
      return recordDate.getMonth() === selectedDate.getMonth() &&
             recordDate.getFullYear() === selectedDate.getFullYear();
    });

    const totalEarnings = monthRecords.reduce((sum, [_, rec]) => sum + (rec.earnings || 0), 0);
    const remainingGoal = Math.max(selectedGoal - totalEarnings, 0);
    const remainingDays = Math.max(daysInMonth - selectedDate.getDate() + 1, 1);
    const dailyPace = remainingDays > 0 ? remainingGoal / remainingDays : 0;
    const progressPercentage = Math.min((totalEarnings / selectedGoal) * 100, 100);

    return {
      totalEarnings,
      remainingGoal,
      remainingDays,
      dailyPace,
      progressPercentage
    };
  }, [selectedGoal, currentMonthRecords, selectedDate]);
};

// Simplified MetricsDashboard component
const MetricsDashboard = ({ selectedGoal, currentMonthRecords, selectedDate, activityData }) => {
  const metrics = useMetricsCalculation(selectedGoal, currentMonthRecords, selectedDate);
  
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Monthly Progress Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between items-end mb-6 sm:mb-8">
          <div>
            <h3 className="text-lg sm:text-xl text-neutral-600 mb-3 sm:mb-4">
              Monthly Progress ({selectedDate.toLocaleString('default', { month: 'long' })})
            </h3>
            <p className="text-3xl sm:text-5xl font-bold text-success-primary mb-1 sm:mb-2">
              {formatCurrency(metrics.totalEarnings)}
            </p>
            <p className="text-sm sm:text-base text-neutral-500">
              of {formatCurrency(selectedGoal)} goal
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl sm:text-3xl font-bold text-accent-primary mb-1 sm:mb-2">
              {formatCurrency(metrics.remainingGoal)}
            </p>
            <p className="text-sm sm:text-base text-neutral-500">remaining</p>
          </div>
        </div>

        <div className="w-full bg-neutral-100 rounded-full h-4 sm:h-6">
          <div
            className="bg-success-primary h-4 sm:h-6 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${metrics.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Daily Target Card */}
      <div className="bg-warning-light p-6 sm:p-8 rounded-2xl border border-warning-primary/20 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <FiTarget className="text-warning-primary w-8 h-8 sm:w-12 sm:h-12" />
          <div>
            <h3 className="text-lg sm:text-xl font-medium text-neutral-800 mb-2 sm:mb-3">
              Daily Target
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-warning-dark mb-1 sm:mb-2">
              {formatCurrency(metrics.dailyPace)}
            </p>
            <p className="text-sm sm:text-base text-neutral-600">
              needed daily for the next {metrics.remainingDays} days
            </p>
          </div>
        </div>
      </div>

      {/* Activity History */}
      <div className="mt-8 sm:mt-12">
        <h3 className="text-sm sm:text-base font-medium text-gray-500 mb-4 sm:mb-6">Activity History (last 6 months)</h3>
        <ActivityTracker activityData={activityData} today={new Date()} />
      </div>
    </div>
  );
};

// Simplified ActivityTracker component
const ActivityTracker = React.memo(({ activityData, today }) => {
  const getColorClass = useCallback((percentage) => {
    if (!percentage && percentage !== 0) return 'bg-gray-100';
    if (percentage >= 100) return 'bg-yellow-400';
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-green-400';
    if (percentage >= 25) return 'bg-green-300';
    if (percentage > 0) return 'bg-green-200';
    return 'bg-gray-100';
  }, []);

  const dates = useMemo(() => {
    const endDate = new Date(today);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 6);

    const allDates = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateKey = current.toISOString().split('T')[0];
      const data = activityData.find(d => d.date.toISOString().split('T')[0] === dateKey) || {
        earnings: 0,
        percentage: 0
      };

      allDates.push({
        date: new Date(current),
        ...data
      });

      current.setDate(current.getDate() + 1);
    }

    return allDates;
  }, [activityData, today]);

  return (
    <div className="flex justify-center">
      <div className="flex flex-wrap gap-1 max-w-[728px]">
        {[...Array(dates[0].date.getDay())].map((_, i) => (
          <div key={`empty-${i}`} className="w-4 h-4" />
        ))}
        {dates.map((data) => (
          <Tippy
            key={data.date.toISOString()}
            content={`
              Date: ${data.date.toLocaleDateString()}
              Earnings: $${data.earnings}
              Achievement: ${data.percentage.toFixed(1)}%
            `}
          >
            <div className={`w-4 h-4 rounded ${getColorClass(data.percentage)}`} />
          </Tippy>
        ))}
      </div>
    </div>
  );
});





// 2. Secondary Sections - Simplified headers
const MetricsSection = ({ loading, metrics, activityData, className = '' }) => (
  <section className={`bg-white rounded-3xl p-4 sm:p-8 shadow-sm ${className}`}>
    <h2 className="text-lg font-medium text-gray-600 mb-8">Monthly Overview</h2>
    {loading ? (
      <LoadingPlaceholder type="metrics" />
    ) : (
      <MetricsDashboard {...metrics} activityData={activityData} />
    )}
  </section>
);

const ProgressSection = ({ loading, chartData, className = '', selectedGoal, selectedDate }) => {
  // Calculate goal line data for all days in the month
  const daysInMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  ).getDate();
  
  const goalLineAccumulated = Array.from({ length: daysInMonth }, (_, index) => {
    const dailyGoal = selectedGoal / daysInMonth;
    return dailyGoal * (index + 1);
  });

  return (
    <section className={`bg-white rounded-3xl p-4 sm:p-8 shadow-sm ${className}`}>
      <h2 className="text-lg font-medium text-gray-600 mb-8">Earnings Progress</h2>
      {loading ? (
        <LoadingPlaceholder type="chart" />
      ) : (
        <ProgressChart
          chartData={chartData}
          goalLineAccumulated={goalLineAccumulated}
          selectedDate={selectedDate}
        />
      )}
    </section>
  );
};

// Replace all the separate loading components with this single flexible one
const LoadingPlaceholder = ({ type = 'default' }) => {
  const templates = {
    default: [
      'h-10 w-48',
      'h-32 w-full',
      'h-12 w-full',
      'h-12 w-full',
      'h-12 w-full'
    ],
    chart: [
      'h-64 w-full rounded-xl',
      'h-4 w-20',
      'h-4 w-20',
      'h-4 w-20'
    ],
    metrics: [
      'h-16 w-32',
      'h-16 w-32',
      'h-4 w-full',
      'h-4 w-3/4',
      'h-4 w-1/2'
    ]
  };

  return (
    <div className="animate-pulse space-y-4">
      {templates[type].map((className, i) => (
        <div key={i} className={`bg-gray-100 rounded ${className}`} />
      ))}
    </div>
  );
};

// Replace the DEFAULT_TAGLINES array with a single default tagline
const DEFAULT_TAGLINE = "Freelance wizard at work 🪄";

// Add this new reusable component near the other shared components
const MonthlyIncomePill = ({ amount, className = '' }) => (
  <Tippy content={
    <div>
      <p>Average income from past 6 months</p>
      <div className="text-xs mt-1 text-gray-300 flex flex-col items-center">
        <div className="text-center">Total earnings from active months</div>
        <div className="w-48 border-t border-gray-300 my-0.5"></div>
        <div className="text-center">Number of active months</div>
      </div>
    </div>
  }>
    <div className={`flex items-center justify-center bg-blue-50 px-4 py-2 rounded-xl ${className}`}>
      <FiCreditCard className="w-5 h-5 text-blue-500 mr-2" />
      <span className="text-sm sm:text-base font-medium text-blue-600">
        {formatCurrency(amount)}
      </span>
      <span className="text-xs sm:text-sm text-blue-400 ml-1">/mo</span>
    </div>
  </Tippy>
);

// Add these helper functions at the top of the file
const getMonthKey = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getDayKey = (date) => {
  return date.getDate().toString();
};

// Add this helper function at the top with other helpers
const getLast6MonthKeys = (date) => {
  const months = [];
  const currentDate = new Date(date);
  
  for (let i = 0; i < 6; i++) {
    months.push(getMonthKey(currentDate));
    currentDate.setMonth(currentDate.getMonth() - 1);
  }
  return months;
};

// Update the useDashboardData hook
const useDashboardData = (profileName) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [state, setState] = useState({
    userData: {
      userId: null,
      isOwner: false,
      selectedGoal: 10000,
      monthlyAverage: 0,
      tagline: DEFAULT_TAGLINE
    },
    records: {
      currentMonth: {},
      chartData: { labels: [], earnings: [], projectsCount: [] },
      activityData: []
    },
    loading: true,
    isUpdating: false
  });

  // Fetch data whenever selectedDate changes
  useEffect(() => {
    if (!state.userData.userId) return;

    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const monthKey = getMonthKey(selectedDate);
        const last6Months = getLast6MonthKeys(selectedDate);
        
        console.log('[fetchData] Starting fetch:', {
          monthKey,
          last6Months,
          selectedDate: selectedDate.toISOString()
        });
        
        // Fetch goal for the current month
        const goalDoc = await getDoc(doc(db, getGoalsPath(state.userData.userId, monthKey)));
        const monthlyGoal = goalDoc.exists() ? goalDoc.data().amount : state.userData.defaultGoal;

        // Fetch records for all 6 months
        const recordPromises = last6Months.map(mKey => 
          getDoc(doc(db, getRecordsPath(state.userData.userId, mKey)))
        );
        const recordDocs = await Promise.all(recordPromises);

        // Combine all records
        const allFormattedRecords = {};
        recordDocs.forEach((doc, index) => {
          if (doc.exists()) {
            const monthKey = last6Months[index];
            const [year, month] = monthKey.split('-').map(Number);
            
            Object.entries(doc.data().days || {}).forEach(([day, data]) => {
              const recordDate = new Date(year, month - 1, Number(day), 12, 0, 0);
              const dateKey = recordDate.toISOString().split('T')[0];
              allFormattedRecords[dateKey] = {
                earnings: data.earnings || 0,
                projectsCount: data.projectsCount || 0,
                percentage: data.percentage || 0
              };
            });
          }
        });

        // Get current month records for chart data
        const currentMonthRecords = {};
        Object.entries(allFormattedRecords).forEach(([dateKey, data]) => {
          const recordDate = new Date(dateKey);
          if (recordDate.getMonth() === selectedDate.getMonth() && 
              recordDate.getFullYear() === selectedDate.getFullYear()) {
            currentMonthRecords[dateKey] = {
              ...data,
              earnings: data.earnings || 0,
              projectsCount: data.projectsCount || 0,
              percentage: data.percentage || 0
            };
          }
        });

        console.log('[fetchData] Final formatted records:', { 
          all: allFormattedRecords, 
          currentMonth: currentMonthRecords 
        });

        // Update state with new data structure
        setState(prev => ({
          ...prev,
          userData: {
            ...prev.userData,
            selectedGoal: monthlyGoal
          },
          records: {
            currentMonth: currentMonthRecords,
            chartData: {
              labels: Object.keys(currentMonthRecords).map(date => new Date(date).toLocaleDateString()),
              earnings: Object.values(currentMonthRecords).map(r => r.earnings || 0),
              projectsCount: Object.values(currentMonthRecords).map(r => r.projectsCount || 0)
            },
            activityData: Object.entries(allFormattedRecords).map(([date, data]) => ({
              date: new Date(date),
              earnings: data.earnings || 0,
              percentage: data.percentage || 0
            }))
          },
          loading: false
        }));
      } catch (error) {
        console.error('[fetchData] Error:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, [selectedDate, state.userData.userId, state.userData.defaultGoal]);

  // Initial profile fetch
  useEffect(() => {
    if (!profileName) return;

    const fetchProfile = async () => {
      try {
        const profileSnapshot = await getDocs(
          query(collection(db, 'profiles'), where('name', '==', profileName))
        );

        if (profileSnapshot.empty) {
          navigate('/');
          return;
        }

        const profileDoc = profileSnapshot.docs[0];
        const profileData = profileDoc.data();
        
        setState(prev => ({
          ...prev,
          userData: {
            userId: profileDoc.id,
            isOwner: currentUser && profileData.userId === currentUser.uid,
            defaultGoal: profileData.defaultGoal || 10000,
            monthlyAverage: profileData.monthlyAverage || 0,  // Just use the one from profile
            tagline: profileData.tagline || DEFAULT_TAGLINE
          }
        }));
      } catch (error) {
        console.error('Error:', error);
        navigate('/');
      }
    };

    fetchProfile();
  }, [profileName, currentUser, navigate]);

  const handleDateChange = useCallback((newDate) => {
    setSelectedDate(newDate);
  }, []);

  return [state, setState, handleDateChange, selectedDate];
};

// Simplified Dashboard component
const Dashboard = () => {
  const { profileName } = useParams();
  const [{ userData, records, loading, isUpdating }, setState, handleDateChange, selectedDate] = useDashboardData(profileName);
  const [isEditingTagline, setIsEditingTagline] = useState(false);

  const handleGoalUpdate = async (newGoal) => {
    if (!userData.userId || isUpdating) return;
    setState(prev => ({ ...prev, isUpdating: true }));
    
    try {
      const currentMonth = getMonthKey(selectedDate);
      
      // Only update the goal for the current month
      await setDoc(doc(db, getGoalsPath(userData.userId, currentMonth)), {
        amount: newGoal,
        updatedAt: new Date()
      });

      setState(prev => ({
        ...prev,
        userData: {
          ...prev.userData,
          selectedGoal: newGoal,
        },
        isUpdating: false
      }));
    } catch (error) {
      console.error('Error:', error);
      setState(prev => ({ ...prev, isUpdating: false }));
    }
  };

  const handleTaglineUpdate = async (newTagline) => {
    if (!userData.userId || !userData.isOwner) return;
    try {
      await setDoc(doc(db, 'profiles', userData.userId), { tagline: newTagline }, { merge: true });
      setState(prev => ({
        ...prev,
        userData: { ...prev.userData, tagline: newTagline }
      }));
      setIsEditingTagline(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRecordUpdate = (updatedRecord) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    
    setState(prev => {
      // Extract recentMonths and monthlyAverage from the update
      const { recentMonths, monthlyAverage, ...recordUpdate } = updatedRecord;
      
      const newRecord = {
        ...(prev.records.currentMonth[dateKey] || {}),
        ...recordUpdate
      };

      const updatedMonthRecords = {
        ...prev.records.currentMonth,
        [dateKey]: newRecord
      };

      // Keep existing activity data and only update the current date
      const updatedActivityData = prev.records.activityData.map(record => {
        if (record.date.toISOString().split('T')[0] === dateKey) {
          return {
            date: record.date,
            earnings: newRecord.earnings || 0,
            percentage: newRecord.percentage || 0
          };
        }
        return record;
      });

      return {
        ...prev,
        userData: {
          ...prev.userData,
          monthlyAverage: monthlyAverage || prev.userData.monthlyAverage
        },
        records: {
          ...prev.records,
          currentMonth: updatedMonthRecords,
          chartData: {
            labels: Object.keys(updatedMonthRecords).map(date => new Date(date).toLocaleDateString()),
            earnings: Object.values(updatedMonthRecords).map(r => r.earnings || 0),
            projectsCount: Object.values(updatedMonthRecords).map(r => r.projectsCount || 0)
          },
          activityData: updatedActivityData
        }
      };
    });
  };

  if (!userData.userId) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-[#FBFBFD] min-h-screen">
      <DashboardHeader 
        profileName={profileName}
        userData={userData}
        isEditingTagline={isEditingTagline}
        setIsEditingTagline={setIsEditingTagline}
        onTaglineUpdate={handleTaglineUpdate}
        onGoalUpdate={handleGoalUpdate}
        isUpdating={isUpdating}
      />

      <main className="max-w-6xl mx-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {userData.isOwner ? (
            <>
              <div className="lg:col-start-2 lg:row-start-1">
                <MetricsSection
                  loading={loading}
                  metrics={{
                    selectedGoal: userData.selectedGoal,
                    currentMonthRecords: records.currentMonth,
                    selectedDate,
                  }}
                  activityData={records.activityData}
                />
              </div>
              <div className="lg:col-start-1 lg:row-start-1">
                <DailySection
                  loading={loading}
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                  userId={userData.userId}
                  selectedGoal={userData.selectedGoal}
                  currentRecord={records.currentMonth[selectedDate.toISOString().split('T')[0]] || { earnings: 0, projectsCount: 0 }}
                  isUpdating={isUpdating}
                  setIsUpdating={(value) => setState(prev => ({ ...prev, isUpdating: value }))}
                  onRecordUpdate={handleRecordUpdate}
                />
              </div>
            </>
          ) : (
            <MetricsSection
              loading={loading}
              metrics={{
                selectedGoal: userData.selectedGoal,
                currentMonthRecords: records.currentMonth,
                selectedDate,
              }}
              activityData={records.activityData}
              className="col-span-2"
            />
          )}
          <ProgressSection
            loading={loading}
            chartData={records.chartData}
            selectedGoal={userData.selectedGoal}
            selectedDate={selectedDate}
            className="col-span-1 lg:col-span-2 mt-8"
          />
        </div>
      </main>
    </div>
  );
};

// Simple loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
  </div>
);

// Header component extracted for cleaner code
const DashboardHeader = ({ 
  profileName, 
  userData, 
  isEditingTagline, 
  setIsEditingTagline, 
  onTaglineUpdate, 
  onGoalUpdate,
  isUpdating 
}) => (
  <header className="p-4 sm:p-8 border-b">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{profileName}'s Page</h1>
          <TaglineEditor
            isEditing={isEditingTagline}
            tagline={userData.tagline}
            isOwner={userData.isOwner}
            onEdit={() => setIsEditingTagline(true)}
            onSave={onTaglineUpdate}
            onCancel={() => setIsEditingTagline(false)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {userData.isOwner && (
            <GoalSelector
              value={userData.selectedGoal}
              onChange={onGoalUpdate}
              disabled={isUpdating}
            />
          )}
          <MonthlyIncomePill amount={userData.monthlyAverage} />
        </div>
      </div>
    </div>
  </header>
);

// Add these components before the DashboardHeader component

const TaglineEditor = ({ isEditing, tagline, isOwner, onEdit, onSave, onCancel }) => {
  const [editedTagline, setEditedTagline] = useState(tagline);

  if (isEditing) {
    return (
      <div className="flex items-center mt-2">
        <input
          type="text"
          value={editedTagline}
          onChange={(e) => setEditedTagline(e.target.value)}
          className="border rounded px-2 py-1 w-full sm:w-auto"
          maxLength={50}
        />
        <button 
          onClick={() => onSave(editedTagline)}
          className="ml-2 text-green-500 hover:text-green-600"
        >
          <FiCheck className="w-4 h-4" />
        </button>
        <button 
          onClick={onCancel}
          className="ml-2 text-red-500 hover:text-red-600"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center mt-2">
      <p className="text-gray-500 text-sm sm:text-base">{tagline}</p>
      {isOwner && (
        <button 
          onClick={onEdit}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          <FiEdit2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const GoalSelector = ({ value, onChange, disabled }) => (
  <select
    value={value}
    onChange={(e) => onChange(parseInt(e.target.value))}
    disabled={disabled}
    className="border rounded p-2 disabled:cursor-not-allowed w-full sm:w-auto"
  >
    {[3000, 5000, 10000, 20000, 30000].map(amount => (
      <option key={amount} value={amount}>
        Goal: {formatCurrency(amount)}
      </option>
    ))}
  </select>
);

// Update the App component
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col bg-[#FBFBFD]">
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
