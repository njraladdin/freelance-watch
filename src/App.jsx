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

// Add this helper function near the top of the file, before any components
const formatCurrency = (amount) => 
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount ?? 0);

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
    <div className={`bg-white p-4 rounded-xl border border-gray-100 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={goToPreviousDay}
          disabled={disabled}
          className="p-2 rounded-full hover:bg-gray-100 disabled:cursor-not-allowed"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <DatePicker
            selected={date}
            onChange={onDateChange}
            dateFormat="dd/MMM/yyyy"
            maxDate={tomorrow}
            disabled={disabled}
            className="text-center border rounded-lg p-2 disabled:cursor-not-allowed"
          />
          {(isToday || isTomorrow) && (
            <div className="mt-1 text-sm font-medium">
              {isToday ? (
                <span className="text-green-500">Today</span>
              ) : (
                <span className="text-blue-500">Tomorrow</span>
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
  const updateRecord = async (updates) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      console.log('🔍 updateRecord called with:', {
        updates,
        currentRecord,
        userId,
        selectedDate: selectedDate.toISOString()
      });
      
      if (loading || !userId) {
        console.log('❌ Skipping update - loading:', loading, 'userId:', userId);
        return;
      }
      
      const dateKey = selectedDate.toISOString().split('T')[0];
      const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
      const dailyGoal = selectedGoal / daysInMonth;

      const updatedRecord = {
        ...currentRecord,
        ...updates,
        ...(updates.earnings !== undefined && {
          percentage: (updates.earnings / dailyGoal) * 100
        })
      };

      console.log('📝 Updated record:', updatedRecord);

      // Get profile document directly by ID instead of querying
      const profileDoc = doc(db, 'profiles', userId);
      const profileSnapshot = await getDoc(profileDoc);
      
      if (!profileSnapshot.exists()) {
        console.error('❌ No profile found with ID:', userId);
        return;
      }

      const profileData = profileSnapshot.data();
      console.log('👤 Found profile:', profileData);

      const batch = writeBatch(db);

      // Update daily record in users collection
      batch.set(doc(db, 'users', userId), {
        [`records.${dateKey}`]: updatedRecord
      }, { merge: true });

      // If earnings were updated, update aggregates
      if (updates.earnings !== undefined) {
        const weekNumber = getWeekNumber(selectedDate);
        const monthNumber = selectedDate.getMonth();
        
        console.log('📅 Updating aggregates for:', {
          weekNumber,
          monthNumber,
          currentEarnings: currentRecord.earnings || 0,
          newEarnings: updates.earnings
        });

        // Get current aggregates or initialize if not exists
        const currentAggregates = profileData.aggregates || { weekly: {}, monthly: {} };
        
        // Calculate the difference in earnings
        const earningsDifference = updates.earnings - (currentRecord.earnings || 0);
        
        console.log('💰 Earnings difference:', earningsDifference);

        // Update weekly and monthly totals
        const updatedAggregates = {
          weekly: { ...currentAggregates.weekly },
          monthly: { ...currentAggregates.monthly }
        };

        // Update weekly total
        updatedAggregates.weekly[weekNumber] = (updatedAggregates.weekly[weekNumber] || 0) + earningsDifference;

        // Update monthly total
        updatedAggregates.monthly[monthNumber] = (updatedAggregates.monthly[monthNumber] || 0) + earningsDifference;

        console.log('📊 Updated aggregates:', updatedAggregates);

        // Calculate new monthly average
        const monthlyValues = Object.values(updatedAggregates.monthly);
        const monthlyAverage = monthlyValues.length > 0 
          ? monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length 
          : 0;

        console.log('📈 New monthly average:', monthlyAverage);

        // Update profile document
        batch.set(profileDoc, {
          aggregates: updatedAggregates,
          monthlyAverage
        }, { merge: true });
      }

      await batch.commit();
      console.log('✅ Successfully saved all updates to Firebase');
      onRecordUpdate(updatedRecord);
    } catch (error) {
      console.error('❌ Error updating record:', error);
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm">
      <h2 className="text-lg font-medium text-gray-600 mb-8">Today's Progress</h2>
      {loading ? (
        <LoadingPlaceholder />
      ) : (
        <>
          <DateSelector 
            date={selectedDate} 
            onDateChange={onDateChange} 
            disabled={isUpdating}
          />
          
          {/* Income Input */}
          <div className={`mt-6 p-6 rounded-xl border border-gray-100 ${isUpdating ? 'opacity-50' : ''}`}>
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <FiDollarSign className="text-green-500 w-6 h-6" />
              </div>
              <h3 className="ml-3 text-lg font-semibold">Today's Income</h3>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                disabled={isUpdating}
                onClick={() => updateRecord({ earnings: Math.max((currentRecord.earnings || 0) - 50, 0) })}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:cursor-not-allowed"
              >
                <FiMinus className="w-6 h-6" />
              </button>

              <input
                type="number"
                value={currentRecord.earnings || 0}
                onChange={(e) => updateRecord({ earnings: Math.max(parseFloat(e.target.value) || 0, 0) })}
                disabled={isUpdating}
                className="w-32 text-center text-2xl font-bold border-b-2 border-green-400 disabled:cursor-not-allowed"
              />

              <button
                disabled={isUpdating}
                onClick={() => updateRecord({ earnings: (currentRecord.earnings || 0) + 50 })}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:cursor-not-allowed"
              >
                <FiPlus className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Projects Input */}
          <div className={`mt-6 p-6 rounded-xl border border-gray-100 ${isUpdating ? 'opacity-50' : ''}`}>
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FiBriefcase className="text-purple-500 w-6 h-6" />
              </div>
              <h3 className="ml-3 text-lg font-semibold">Projects Won</h3>
            </div>

            <div className="flex justify-center space-x-3">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  disabled={isUpdating}
                  onClick={() => updateRecord({ 
                    projectsCount: currentRecord.projectsCount === num ? 0 : num 
                  })}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center
                    ${currentRecord.projectsCount >= num ? 'bg-purple-500 text-white' : 'bg-gray-50 hover:bg-purple-50'}
                    disabled:cursor-not-allowed`}
                >
                  {currentRecord.projectsCount >= num ? (
                    <FiBriefcase />
                  ) : (
                    num
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
};

const ActivityTracker = ({ activityData, today }) => {
  const getColorClass = (percentage) => {
    if (!percentage && percentage !== 0) return 'bg-gray-100';
    if (percentage >= 100) return 'bg-yellow-400';
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-green-400';
    if (percentage >= 25) return 'bg-green-300';
    if (percentage > 0) return 'bg-green-200';
    return 'bg-gray-100';
  };

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
const MetricsSection = ({ loading, metrics, activityData, className = '' }) => (
  <section className={`bg-white rounded-3xl p-4 sm:p-8 shadow-sm ${className}`}>
    <h2 className="text-lg font-medium text-gray-600 mb-8">Monthly Overview</h2>
    {loading ? (
      <MetricsLoadingPlaceholder />
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
        <ChartLoadingPlaceholder />
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




// Remove useTrackerState custom hook and simplify Dashboard component state
const Dashboard = () => {
  const { profileName } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Simplified state structure
  const [userData, setUserData] = useState({
    userId: null,
    isOwner: false,
    selectedGoal: 10000,
    monthlyAverage: 0,
    tagline: DEFAULT_TAGLINE
  });

  const [records, setRecords] = useState({
    currentMonth: {},
    chartData: { labels: [], earnings: [], projectsCount: [] },
    activityData: []
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isEditingTagline, setIsEditingTagline] = useState(false);
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);  // Shared loading state

  // Simplified profile fetch
  useEffect(() => {
    if (!profileName) return;

    const fetchProfile = async () => {
      try {
        const q = query(collection(db, 'profiles'), where('name', '==', profileName));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          navigate('/');
          return;
        }

        const profileData = snapshot.docs[0].data();
        setUserData({
          userId: snapshot.docs[0].id,
          isOwner: currentUser && profileData.userId === currentUser.uid,
          selectedGoal: 10000,
          monthlyAverage: profileData.monthlyAverage || 0,
          tagline: profileData.tagline || DEFAULT_TAGLINE
        });
      } catch (error) {
        console.error('Error:', error);
        navigate('/');
      }
    };

    fetchProfile();
  }, [profileName, currentUser, navigate]);

  // Simplified data fetch
  useEffect(() => {
    if (!userData.userId) return;

    const fetchData = async () => {
      console.log('🔄 Fetching data for userId:', userData.userId);
      try {
        const userDocRef = await getDoc(doc(db, 'users', userData.userId));
        const userDocData = userDocRef.exists() ? userDocRef.data() : { monthlyGoal: 10000, records: {} };

        console.log('📥 Raw data from Firebase:', userDocData);

        // Update the selectedGoal from Firebase data
        setUserData(prev => ({
          ...prev,
          selectedGoal: userDocData.monthlyGoal || 10000
        }));

        // Convert records
        const records = {};
        Object.entries(userDocData)
          .filter(([key]) => key.startsWith('records.'))
          .forEach(([key, value]) => {
            records[key.replace('records.', '')] = value;
          });

        console.log('🔄 Processed records:', records);

        // Update states
        const dates = Object.keys(records).sort();
        const processedData = {
          currentMonth: records,
          chartData: {
            labels: dates.map(date => new Date(date).toLocaleDateString()),
            earnings: dates.map(date => records[date]?.earnings || 0),
            projectsCount: dates.map(date => records[date]?.projectsCount || 0)
          },
          activityData: dates.map(date => ({
            date: new Date(date),
            earnings: records[date]?.earnings || 0,
            percentage: records[date]?.percentage || 0  // Use existing percentage
          }))
        };

        console.log('📊 Processed data being set:', processedData);
        setRecords(processedData);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      }
    };

    fetchData();
  }, [userData.userId]);

  // Simplified handlers
  const handleGoalUpdate = async (newGoal) => {
    if (!userData.userId || isUpdating) return;
    setIsUpdating(true);
    try {
      await setDoc(doc(db, 'users', userData.userId), { monthlyGoal: newGoal }, { merge: true });
      console.log('✅ Goal updated in Firebase');
      setUserData(prev => ({ ...prev, selectedGoal: newGoal }));
    } catch (error) {
      console.error('❌ Error updating goal:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTaglineUpdate = async (newTagline) => {
    if (!userData.userId || !userData.isOwner) return;
    try {
      await setDoc(doc(db, 'profiles', userData.userId), { tagline: newTagline }, { merge: true });
      setUserData(prev => ({ ...prev, tagline: newTagline }));
      setIsEditingTagline(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Update the record update handler to also update activity data
  const handleRecordUpdate = (updatedRecord) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    
    setRecords(prev => {
      // Update current month records
      const newCurrentMonth = {
        ...prev.currentMonth,
        [dateKey]: updatedRecord
      };

      // Update chart data
      const dates = Object.keys(newCurrentMonth).sort();
      const newChartData = {
        labels: dates.map(date => new Date(date).toLocaleDateString()),
        earnings: dates.map(date => newCurrentMonth[date]?.earnings || 0),
        projectsCount: dates.map(date => newCurrentMonth[date]?.projectsCount || 0)
      };

      // Update activity data
      const newActivityData = dates.map(date => ({
        date: new Date(date),
        earnings: newCurrentMonth[date]?.earnings || 0,
        percentage: newCurrentMonth[date]?.percentage || 0
      }));

      return {
        currentMonth: newCurrentMonth,
        chartData: newChartData,
        activityData: newActivityData
      };
    });
  };

  if (!userData.userId) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>;
  }

  // Simplified JSX
  return (
    <div className="bg-[#FBFBFD] min-h-screen">
      <header className="p-4 sm:p-8 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">{profileName}'s Page</h1>
                {isEditingTagline ? (
                  <div className="flex items-center mt-2">
                    <input
                      type="text"
                      value={userData.tagline}
                      onChange={(e) => setUserData(prev => ({ ...prev, tagline: e.target.value }))}
                      className="border rounded px-2 py-1 w-full sm:w-auto"
                      maxLength={50}
                    />
                    <button onClick={() => handleTaglineUpdate(userData.tagline)}>Save</button>
                    <button onClick={() => setIsEditingTagline(false)}>Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center mt-2">
                    <p className="text-gray-500 text-sm sm:text-base">{userData.tagline}</p>
                    {userData.isOwner && (
                      <button onClick={() => setIsEditingTagline(true)}>
                        <FiEdit2 className="w-4 h-4 ml-2" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {userData.isOwner && (
                  <div className={`${isUpdating ? 'opacity-50' : ''} transition-opacity duration-200 w-full sm:w-auto`}>
                    <select
                      value={userData.selectedGoal}
                      onChange={(e) => handleGoalUpdate(parseInt(e.target.value))}
                      disabled={isUpdating}
                      className="border rounded p-2 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {[3000, 5000, 10000, 20000, 30000].map(value => (
                        <option key={value} value={value}>Goal: {formatCurrency(value)}</option>
                      ))}
                    </select>
                  </div>
                )}
                <MonthlyIncomePill amount={userData.monthlyAverage} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {userData.isOwner && (
            <DailySection
              loading={loading}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              userId={userData.userId}
              selectedGoal={userData.selectedGoal}
              currentRecord={records.currentMonth[selectedDate.toISOString().split('T')[0]] || {}}
              isUpdating={isUpdating}
              setIsUpdating={setIsUpdating}
              onRecordUpdate={handleRecordUpdate}
            />
          )}
          <MetricsSection
            loading={loading}
            metrics={{
              selectedGoal: userData.selectedGoal,
              currentMonthRecords: records.currentMonth,
              selectedDate,
            }}
            activityData={records.activityData}
          />
          <ProgressSection
            loading={loading}
            chartData={records.chartData}
            selectedGoal={userData.selectedGoal}
            selectedDate={selectedDate}
            className="col-span-1 lg:col-span-2"
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
