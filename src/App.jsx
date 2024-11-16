import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, LineController, BarController } from 'chart.js';
import { FiBriefcase, FiDollarSign, FiMinus, FiPlus, FiChevronLeft, FiChevronRight, FiClock, FiCreditCard, FiTarget, FiUser, FiLogIn, FiLogOut, FiEdit2 } from 'react-icons/fi';
import { db } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, query, where, addDoc, writeBatch } from 'firebase/firestore';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProgressChart from './components/ProgressChart';
import ProfileSelection from './components/ProfileSelection';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, LineController, BarController, ChartDataLabels);


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
              className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all transform hover:scale-105 ${(record.projectsCount || 0) >= i + 1
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

const ActivityTracker = ({ activityData, today }) => {
  console.log('ActivityTracker rendered with:', {
    activityDataLength: activityData?.length,
    sampleData: activityData?.[0],
    today
  });

  const getColorLevel = (percentage) => {
    if (!percentage && percentage !== 0) return 'bg-gray-100';
    if (percentage >= 100) return 'bg-yellow-400';
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 60) return 'bg-green-500';
    if (percentage >= 40) return 'bg-green-400';
    if (percentage >= 20) return 'bg-green-300';
    if (percentage > 0) return 'bg-green-200';
    return 'bg-gray-100';
  };

  const getTooltipContent = (date, earnings, dailyGoal, percentage) => {
    return (
      <div>
        <strong>Date:</strong> {date.toLocaleDateString()}<br />
        <strong>Earnings:</strong> ${earnings}<br />
        <strong>Achievement:</strong> {percentage.toFixed(1)}%
      </div>
    );
  };

  // Generate array of all dates for the past 6 months
  const generatePastSixMonths = () => {
    const dates = [];
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 6);

    const activityMap = new Map(
      activityData.map(data => [
        new Date(data.date).toISOString().split('T')[0],
        data
      ])
    );

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = new Date(d).toISOString().split('T')[0];
      const existingData = activityMap.get(dateKey);

      dates.push({
        date: new Date(d),
        earnings: existingData?.earnings || 0,
        monthlyGoalAtTime: existingData?.monthlyGoalAtTime || 0,
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
              content={getTooltipContent(
                data.date,
                data.earnings,
                data.dailyGoal,
                data.percentage
              )}
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
    // Get the first and last day of the selected month
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Filter records for the selected month only
    const selectedMonthRecords = Object.entries(currentMonthRecords).filter(([date]) => {
      const recordDate = new Date(date);
      return recordDate.getMonth() === selectedDate.getMonth() &&
        recordDate.getFullYear() === selectedDate.getFullYear();
    });

    // Calculate totals for the selected month
    const totalEarnings = selectedMonthRecords.reduce((sum, [_, rec]) => sum + (rec.earnings || 0), 0);

    // Calculate average earnings per day based on days passed in the selected month
    const daysPassed = Math.min(
      selectedDate.getDate(),
      daysInMonth
    );
    const averageEarningsPerDay = daysPassed ? totalEarnings / daysPassed : 0;

    // Calculate remaining days in the month from the selected date
    const remainingDays = daysInMonth - selectedDate.getDate() + 1;
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
    console.log('updateRecord called with:', { date, updates });

    // Define dateKey here
    const dateKey = date.toISOString().split('T')[0];

    setState(prevState => {
      // Handle initialization update
      if (updates._initializeState) {
        console.log('Handling _initializeState update:', {
          currentActivityData: prevState.activityData,
          newActivityData: updates._initializeState.activityData
        });
        return { ...prevState, ...updates._initializeState };
      }

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
      if (updates.earnings !== undefined || updates.historicalPercentage !== undefined) {
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const dailyGoal = prevState.selectedGoal / daysInMonth;

        // Check if the date already exists in activityData
        const existingActivityIndex = prevState.activityData.findIndex(
          activity => activity.date.toISOString().split('T')[0] === dateKey
        );

        if (existingActivityIndex !== -1) {
          // Update existing activity
          newState.activityData = prevState.activityData.map((activity, index) =>
            index === existingActivityIndex
              ? {
                ...activity,
                earnings: updates.earnings || activity.earnings,
                dailyGoal,
                historicalPercentage: updates.historicalPercentage || activity.historicalPercentage
              }
              : activity
          );
        } else {
          // Add new activity
          newState.activityData = [
            ...prevState.activityData,
            {
              date: new Date(date),
              earnings: updates.earnings || 0,
              dailyGoal,
              historicalPercentage: updates.historicalPercentage || 0
            }
          ];
        }
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

    // Define dateKey at the top of the function
    const dateKey = date.toISOString().split('T')[0];
    let updates = {};

    switch (type) {
      case 'goal':
        console.log('Goal update triggered with:', {
          value,
          currentActivityData: trackerState.activityData,
          currentState: trackerState
        });

        updates = { selectedGoal: parseInt(value) };

        try {
          await setDoc(doc(db, 'users', userId), { monthlyGoal: value }, { merge: true });

          // Only update the goal line, keep all other data unchanged
          const newGoalLine = trackerState.chartData.labels.map((_, index) =>
            (value / trackerState.chartData.labels.length) * (index + 1)
          );

          const newState = {
            _initializeState: {
              ...trackerState,
              selectedGoal: parseInt(value),
              goalLineAccumulated: newGoalLine
            }
          };

          updateTrackerState(date, newState);
        } catch (error) {
          console.error('Error updating goal:', error);
        }
        break;

      case 'earnings':
        const monthlyGoalAtTime = selectedGoal;  // Capture the monthly goal when recording earnings
        const percentage = (value / (monthlyGoalAtTime / daysInMonth)) * 100;

        updates = {
          earnings: Math.max(value, 0),
          monthlyGoalAtTime,  // Store the monthly goal at time of recording
          percentage  // Store the calculated percentage
        };

        try {
          await setDoc(doc(db, 'users', userId), {
            [`records.${dateKey}`]: updates
          }, { merge: true });

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
  }, [userId, selectedGoal, updateTrackerState]);

  // Update this handler to also set the local state
  const handleGoalChange = (e) => {
    const newGoal = parseInt(e.target.value);
    setSelectedGoal(newGoal);  // Add this line to update local state
    handleInputUpdate('goal', newGoal);
  };

  // Effect to fetch profile and check ownership
  useEffect(() => {
    const fetchProfile = async () => {
      console.log('Fetching profile for:', profileName);
      try {
        const profilesCollection = collection(db, 'profiles');
        const q = query(profilesCollection, where('name', '==', profileName));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.log('No profile found');
          navigate('/');
          return;
        }

        const profileData = snapshot.docs[0].data();
        console.log('Profile found:', profileData);
        setUserId(snapshot.docs[0].id);
        setMonthlyAverage(profileData.monthlyAverage || 0);
        setIsOwner(currentUser && profileData.userId === currentUser.uid);
        setTagline(profileData.tagline || DEFAULT_TAGLINE);

        // Don't set loading to false here, let the data fetch complete first
      } catch (error) {
        console.error('Error fetching profile:', error);
        navigate('/');
      }
    };

    if (profileName) {
      fetchProfile();
    }
  }, [profileName, currentUser, navigate]);

  // Effect to fetch user data and past year records
  useEffect(() => {
    const fetchUserData = async () => {
      console.log('Fetching user data for userId:', userId);
      if (!userId) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        console.log('User doc exists:', userDoc.exists(), 'Data:', userDoc.data());

        if (!userDoc.exists()) {
          const newUserData = {
            monthlyGoal: 10000,
            records: {},
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', userId), newUserData);
          initializeStates(newUserData);
        } else {
          const userData = userDoc.data();
          initializeStates(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Helper function to initialize all states
    const initializeStates = (userData) => {
      console.log('Initializing states with userData:', userData);

      // Convert dot notation records to nested object
      const records = {};
      Object.keys(userData).forEach(key => {
        if (key.startsWith('records.')) {
          const date = key.replace('records.', '');
          records[date] = userData[key];
        }
      });

      console.log('Processed records:', records); // Debug log

      const sortedDates = Object.keys(records).sort();
      console.log('Sorted dates:', sortedDates); // Debug log

      // Set immediate states
      setSelectedGoal(userData.monthlyGoal || 10000);
      setCurrentMonthRecords(records);

      // Prepare chart data
      const chartLabels = sortedDates.map(date => new Date(date).toLocaleDateString());
      const chartEarnings = sortedDates.map(date => records[date]?.earnings || 0);
      const chartProjects = sortedDates.map(date => records[date]?.projectsCount || 0);

      console.log('Chart data prepared:', { // Debug log
        labels: chartLabels,
        earnings: chartEarnings,
        projects: chartProjects
      });

      // Calculate goal lines
      const today = new Date();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const dailyGoal = userData.monthlyGoal / daysInMonth;

      let accumulated = 0;
      const goalLine = chartLabels.map(() => {
        accumulated += dailyGoal;
        return accumulated;
      });

      // Prepare activity data
      const activityDataArray = sortedDates.map(date => {
        const record = records[date];
        const percentage = (record?.earnings || 0) / dailyGoal * 100;

        return {
          date: new Date(date),
          earnings: record?.earnings || 0,
          dailyGoal: dailyGoal,
          percentage: percentage
        };
      });

      console.log('Activity data prepared:', activityDataArray);

      // Set all states
      setChartData({
        labels: chartLabels,
        earnings: chartEarnings,
        projectsCount: chartProjects
      });
      setGoalLineAccumulated(goalLine);
      setActivityData(activityDataArray);

      // Update tracker state
      updateTrackerState(today, {
        _initializeState: {
          selectedGoal: userData.monthlyGoal || 10000,
          currentMonthRecords: records,
          chartData: {
            labels: chartLabels,
            earnings: chartEarnings,
            projectsCount: chartProjects
          },
          activityData: activityDataArray,
          goalLineAccumulated: goalLine
        }
      });

      // Finally set loading to false
      setLoading(false);
    };

    if (userId) {
      console.log('Starting data fetch for userId:', userId);
      fetchUserData();
    }
  }, [userId, updateTrackerState]); // Remove loading from dependencies

  // Add a debug effect to monitor state changes
  useEffect(() => {
    console.log('State update:', {
      userId,
      loading,
      recordsCount: Object.keys(currentMonthRecords).length,
      activityDataLength: activityData.length,
      chartDataLabels: chartData.labels.length
    });
  }, [userId, loading, currentMonthRecords, activityData, chartData]);

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
