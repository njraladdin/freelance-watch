// src/App.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DayInput from './DayInput';
import ProgressChart from './ProgressChart';
import ActivityTracker from './ActivityTracker';
import { db } from './firebase'; // Import Firestore
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import MetricsDashboard from './MetricsDashboard'; // Import the new component

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

  const userDocRef = useMemo(() => doc(db, 'users', userId), [userId]);

  const [currentMonthRecords, setCurrentMonthRecords] = useState({});
  const [pastYearRecords, setPastYearRecords] = useState({});
  const [chartData, setChartData] = useState({
    earnings: [],
    hoursWorked: [],
    sleepHours: [],
    didWorkout: [],
    didWalk: [],
    projectsCount: [],
    motivationLevel: [], // Added Motivation Level
    labels: [],
  });
  const [goalLineDaily, setGoalLineDaily] = useState([]);
  const [goalLineAccumulated, setGoalLineAccumulated] = useState([]);
  const [isAccumulatedView, setIsAccumulatedView] = useState(true);

  // **Selected goal now represents the current month's goal**
  const [selectedGoal, setSelectedGoal] = useState(5000);
  const [activityData, setActivityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // **Loading States**
  const [isSelectedGoalLoading, setIsSelectedGoalLoading] = useState(true);
  const [isCurrentMonthLoaded, setIsCurrentMonthLoaded] = useState(false);
  const [isPastYearLoaded, setIsPastYearLoaded] = useState(false);

  // Define unique colors for each category (consistent with DayInput.jsx)
  const colors = {
    earnings: {
      text: 'text-green-500',
      bg: 'bg-green-500',
      switch: 'green',
    },
    projects: {
      text: 'text-purple-500',
      bg: 'bg-purple-500',
      switch: 'purple',
    },
    workHours: {
      text: 'text-blue-500',
      bg: 'bg-blue-500',
      switch: 'blue',
    },
    workout: {
      text: 'text-red-500',
      bg: 'bg-red-500',
      switch: 'red',
    },
    walk: {
      text: 'text-indigo-500',
      bg: 'bg-indigo-500',
      switch: 'indigo',
    },
    sleep: {
      text: 'text-orange-500',
      bg: 'bg-orange-500',
      switch: 'orange',
    },
    motivation: { // Added motivation colors for consistency
      text: 'text-yellow-500',
      bg: 'bg-yellow-500',
      switch: 'yellow',
    },
  };

  // Helper function to format date key
  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
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
      setIsSelectedGoalLoading(true);
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
        setIsSelectedGoalLoading(false);
      }
    };

    fetchMonthlyGoal();
  }, [selectedDate, monthlyGoalsCollection]);

  // **Save selectedGoal to Firestore whenever it changes**
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

    // Only save if selectedGoal is defined and valid
    if (selectedGoal) {
      saveMonthlyGoal();
    }
  }, [selectedGoal, selectedDate, monthlyGoalsCollection]);

  // **Load data for the current month**
  useEffect(() => {
    const loadCurrentMonthRecords = async () => {
      setIsCurrentMonthLoaded(false);
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
        setIsCurrentMonthLoaded(true);
      }
    };

    loadCurrentMonthRecords();
  }, [selectedDate, recordsCollection]);

  // **Load data for the past year**
  useEffect(() => {
    const loadPastYearRecords = async () => {
      setIsPastYearLoaded(false);
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
        setIsPastYearLoaded(true);
      }
    };

    loadPastYearRecords();
  }, [recordsCollection]);

  // **Update chart data and activity data whenever dependencies change**
  useEffect(() => {
    if (!isCurrentMonthLoaded || !isPastYearLoaded) return; // Ensure data is loaded before updating chart
    updateChartData();
    updateActivityData();
  }, [
    currentMonthRecords,
    pastYearRecords,
    selectedDate,
    selectedGoal,
    isAccumulatedView,
    isCurrentMonthLoaded,
    isPastYearLoaded,
  ]);

  const updateChartData = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    // Get the number of days in the selected month
    const daysInMonth = getDaysInMonth(selectedDate);

    const labels = Array.from({ length: daysInMonth }, (_, i) =>
      (i + 1).toString()
    );
    const earnings = [];
    const hoursWorked = [];
    const sleepHours = [];
    const didWorkout = [];
    const didWalk = [];
    const projectsCount = [];
    const motivationLevel = []; // Initialize motivationLevel array

    let accumulatedEarnings = [];
    let totalEarnings = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = formatDateKey(date);

      // Determine if the day is in the past
      const isPastDay = date < today;

      const record = currentMonthRecords[dateKey] || {};

      // **Set default values only for past days**
      const earning =
        isPastDay && (record.earnings === undefined || record.earnings === null)
          ? 0
          : record.earnings || null;

      totalEarnings += earning || 0;

      earnings.push(
        earning !== undefined && earning !== null ? earning : isPastDay ? 0 : null
      );
      accumulatedEarnings.push(totalEarnings);

      // Hours Worked
      const hours =
        isPastDay &&
        (record.hoursWorked === undefined || record.hoursWorked === null)
          ? 0
          : record.hoursWorked || null;
      hoursWorked.push(
        hours !== undefined && hours !== null ? hours : isPastDay ? 0 : null
      );

      // Sleep Hours
      const sleep =
        isPastDay &&
        (record.sleepHours === undefined || record.sleepHours === null)
          ? 0
          : record.sleepHours || null;
      sleepHours.push(
        sleep !== undefined && sleep !== null ? sleep : isPastDay ? 0 : null
      );

      // Did Workout
      const workout =
        isPastDay &&
        (record.didWorkout === undefined || record.didWorkout === null)
          ? false
          : record.didWorkout || false;
      didWorkout.push(
        workout !== undefined && workout !== null ? workout : isPastDay ? false : false
      );

      // Did Walk
      const walk =
        isPastDay &&
        (record.didWalk === undefined || record.didWalk === null)
          ? false
          : record.didWalk || false;
      didWalk.push(
        walk !== undefined && walk !== null ? walk : isPastDay ? false : false
      );

      // Won Projects
      const projects =
        isPastDay &&
        (record.projectsCount === undefined || record.projectsCount === null)
          ? 0
          : record.projectsCount || null;
      projectsCount.push(
        projects !== undefined && projects !== null ? projects : isPastDay ? 0 : null
      );

      // Motivation Level
      const motivation =
        isPastDay &&
        (record.motivationLevel === undefined || record.motivationLevel === null)
          ? 0
          : record.motivationLevel || null;
      motivationLevel.push(
        motivation !== undefined && motivation !== null ? motivation : isPastDay ? 0 : null
      );
    }

    // Update goal lines
    const dailyGoal = selectedGoal / daysInMonth;
    setGoalLineDaily(new Array(daysInMonth).fill(dailyGoal));
    setGoalLineAccumulated(labels.map((_, index) => dailyGoal * (index + 1)));

    setChartData({
      earnings: isAccumulatedView ? accumulatedEarnings : earnings,
      hoursWorked,
      sleepHours,
      didWorkout,
      didWalk,
      projectsCount,
      motivationLevel, // Update chartData with motivationLevel
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

  const handleDataChange = useCallback(async (date, data) => {
    const key = formatDateKey(date);
    const daysInMonth = getDaysInMonth(date);
    const dailyGoal = selectedGoal / daysInMonth;

    // Optimistically update currentMonthRecords state
    setCurrentMonthRecords((prevRecords) => ({
      ...prevRecords,
      [key]: {
        ...prevRecords[key],
        ...data,
        dailyGoal, // Store dailyGoal for the day
      },
    }));

    // Update pastYearRecords if the date is within the past year
    const startDate = getStartDate();
    if (date >= startDate && date <= new Date()) {
      setPastYearRecords((prevRecords) => ({
        ...prevRecords,
        [key]: {
          ...prevRecords[key],
          ...data,
          dailyGoal,
        },
      }));
    }

    // Debounce Firebase writes to prevent rapid successive writes
    if (handleDataChange.debounceTimeout) {
      clearTimeout(handleDataChange.debounceTimeout);
    }

    handleDataChange.debounceTimeout = setTimeout(async () => {
      // Save the updated record to Firestore
      try {
        const recordDocRef = doc(recordsCollection, key);
        const recordData = {
          ...data,
          date: key,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          dailyGoal,
        };
        await setDoc(recordDocRef, recordData, { merge: true });
        console.log(`Saved record for ${key}:`, recordData);
      } catch (error) {
        console.error(`Failed to save record for ${key}:`, error);
        // Optionally, revert the optimistic update here
      }
    }, 500); // 500ms debounce delay
  }, [recordsCollection, selectedGoal]);

  const getRecordForSelectedDate = () => {
    const dateKey = formatDateKey(selectedDate);
    return currentMonthRecords[dateKey] || {};
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mb-56">
      <h1 className="text-4xl font-bold text-center mb-10">Progress Tracker</h1>

      {/* Goal Selection Dropdown */}
      <div className="flex justify-end mb-6">
        {isSelectedGoalLoading ? (
          <div className="w-48 h-10 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <select
            id="goalSelect"
            className="bg-white border border-gray-300 text-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedGoal}
            onChange={handleGoalChange}
            aria-label="Select Earnings Goal"
          >
            <option value="3000">Goal: $3,000</option>
            <option value="5000">Goal: $5,000</option>
            <option value="10000">Goal: $10,000</option>
            <option value="20000">Goal: $20,000</option>
            <option value="30000">Goal: $30,000</option>
          </select>
        )}
      </div>

      <div className="flex flex-col space-y-8">
        {/* Inputs Section */}
        <section className="bg-white p-6 rounded-3xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-gray-600">
            Daily Inputs
          </h2>
          {isCurrentMonthLoaded ? (
            <DayInput
              onDataChange={handleDataChange}
              date={selectedDate}
              onDateChange={setSelectedDate}
              record={getRecordForSelectedDate()}
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 animate-pulse rounded"></div>
          )}
        </section>

        {/* Metrics Dashboard */}
        <section className="bg-white p-6 rounded-3xl shadow-md mb-6">
          {isCurrentMonthLoaded && isPastYearLoaded ? (
            <MetricsDashboard
              selectedGoal={selectedGoal}
              currentMonthRecords={currentMonthRecords}
              selectedDate={selectedDate}
              pastYearRecords={pastYearRecords}
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 animate-pulse rounded"></div>
          )}
        </section>

        {/* Progress Section */}
        <section className="bg-white p-6 px-1 md:p-6 rounded-3xl shadow-md">
          {isCurrentMonthLoaded && isPastYearLoaded ? (
            <>
              <ProgressChart
                chartData={chartData}
                goalLineDaily={goalLineDaily}
                goalLineAccumulated={goalLineAccumulated}
                isAccumulatedView={isAccumulatedView}
                toggleChartView={toggleChartView}
              />
              <ActivityTracker activityData={activityData} today={new Date()} />
            </>
          ) : (
            <div className="w-full h-96 bg-gray-200 animate-pulse rounded"></div>
          )}
        </section>
      </div>
    </div>
  );
};

export default App;
