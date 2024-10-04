// src/App.jsx
import React, { useState, useEffect } from 'react';
import DayInput from './DayInput';
import ProgressChart from './ProgressChart';
import ActivityTracker from './ActivityTracker';
import { db } from './firebase'; // Import Firestore
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

const App = () => {
  const userId = 'defaultUser'; // Fixed user ID

  const [currentMonthRecords, setCurrentMonthRecords] = useState({});
  const [pastYearRecords, setPastYearRecords] = useState({});
  const [chartData, setChartData] = useState({
    earnings: [],
    hoursWorked: [],
    sleepHours: [],
    didWorkout: [],
    projectsCount: [],
    labels: [],
  });
  const [goalLineDaily, setGoalLineDaily] = useState([]);
  const [goalLineAccumulated, setGoalLineAccumulated] = useState([]);
  const [isAccumulatedView, setIsAccumulatedView] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(5000);
  const [activityData, setActivityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // **Loading States**
  const [isCurrentMonthLoaded, setIsCurrentMonthLoaded] = useState(false);
  const [isPastYearLoaded, setIsPastYearLoaded] = useState(false);

  // Firestore Collections
  const recordsCollection = collection(db, 'users', userId, 'records');

  // Helper function to format date key
  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  };

  // Helper function to get number of days in a month for a given date
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper function to calculate the start date (today - 365 days)
  const getStartDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pastYear = new Date(today);
    pastYear.setDate(today.getDate() - 364); // Including today
    return pastYear;
  };

  // **Load data for the current month**
  useEffect(() => {
    const loadCurrentMonthRecords = async () => {
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
        setIsCurrentMonthLoaded(true);
        console.log(`Loaded current month data for ${year}-${month}:`, records);
      } catch (error) {
        console.error('Failed to load current month records:', error);
        setCurrentMonthRecords({});
        setIsCurrentMonthLoaded(true);
      }
    };

    loadCurrentMonthRecords();
  }, [selectedDate]);

  // **Load data for the past year**
  useEffect(() => {
    const loadPastYearRecords = async () => {
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
        setIsPastYearLoaded(true);
        console.log(`Loaded past year data from ${startDateKey} to ${endDateKey}:`, records);
      } catch (error) {
        console.error('Failed to load past year records:', error);
        setPastYearRecords({});
        setIsPastYearLoaded(true);
      }
    };

    loadPastYearRecords();
  }, []);

  // **Save currentMonthRecords to Firestore whenever it changes, but only after loading**
  useEffect(() => {
    if (!isCurrentMonthLoaded) return; // Prevent saving before loading

    const saveCurrentMonthRecords = async () => {
      try {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1;
        const daysInMonth = getDaysInMonth(selectedDate);

        const batchPromises = [];

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, selectedDate.getMonth(), day);
          const dateKey = formatDateKey(date);
          const record = currentMonthRecords[dateKey];

          if (record) {
            const recordDocRef = doc(recordsCollection, dateKey);
            const recordData = {
              ...record,
              date: dateKey,
              year,
              month,
            };
            batchPromises.push(setDoc(recordDocRef, recordData, { merge: true }));
          }
        }

        await Promise.all(batchPromises);
        console.log(`Saved current month data for ${year}-${month}:`, currentMonthRecords);
      } catch (error) {
        console.error('Failed to save current month records:', error);
      }
    };

    saveCurrentMonthRecords();
  }, [currentMonthRecords, selectedDate, isCurrentMonthLoaded]);

  // **Update chart data and activity data whenever dependencies change**
  useEffect(() => {
    if (!isCurrentMonthLoaded || !isPastYearLoaded) return; // Ensure data is loaded before updating chart
    updateChartData();
    updateActivityData();
  }, [currentMonthRecords, pastYearRecords, selectedDate, selectedGoal, isAccumulatedView, isCurrentMonthLoaded, isPastYearLoaded]);

  const updateChartData = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    // Get the number of days in the selected month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
    const earnings = [];
    const hoursWorked = [];
    const sleepHours = [];
    const didWorkout = [];
    const projectsCount = [];

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

      // For each data point, set to 0 if missing and it's a past day
      const earning = isPastDay
        ? record.earnings !== undefined && record.earnings !== null
          ? record.earnings
          : 0
        : record.earnings || null;

      totalEarnings += earning || 0;

      earnings.push(earning !== undefined && earning !== null ? earning : (isPastDay ? 0 : null));
      accumulatedEarnings.push(totalEarnings);

      // Hours Worked
      const hours = isPastDay
        ? record.hoursWorked !== undefined && record.hoursWorked !== null
          ? record.hoursWorked
          : 0
        : record.hoursWorked || null;
      hoursWorked.push(hours !== undefined && hours !== null ? hours : (isPastDay ? 0 : null));

      // Sleep Hours
      const sleep = isPastDay
        ? record.sleepHours !== undefined && record.sleepHours !== null
          ? record.sleepHours
          : 0
        : record.sleepHours || null;
      sleepHours.push(sleep !== undefined && sleep !== null ? sleep : (isPastDay ? 0 : null));

      // Did Workout
      const workout = isPastDay
        ? record.didWorkout !== undefined && record.didWorkout !== null
          ? record.didWorkout
          : false
        : record.didWorkout || false;
      didWorkout.push(workout !== undefined && workout !== null ? workout : (isPastDay ? false : false));

      // Won Projects
      const projects = isPastDay
        ? record.projectsCount !== undefined && record.projectsCount !== null
          ? record.projectsCount
          : 0
        : record.projectsCount || null;
      projectsCount.push(projects !== undefined && projects !== null ? projects : (isPastDay ? 0 : null));
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
      const dailyGoal = record.dailyGoal || (selectedGoal / getDaysInMonth(date));
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
    setSelectedGoal(newGoal);
  };

  const toggleChartView = () => {
    setIsAccumulatedView(!isAccumulatedView);
  };

  const handleDataChange = async (date, data) => {
    const key = formatDateKey(date);
    const daysInMonth = getDaysInMonth(date);
    const dailyGoal = selectedGoal / daysInMonth;

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
  };

  const getRecordForSelectedDate = () => {
    const dateKey = formatDateKey(selectedDate);
    return currentMonthRecords[dateKey] || {};
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mb-56">
      <h1 className="text-4xl font-bold text-center mb-10">Progress Tracker</h1>

      {/* Goal Selection Dropdown */}
      <div className="flex justify-end mb-6">
        <select
          id="goalSelect"
          className="bg-white border border-gray-300 text-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={selectedGoal}
          onChange={handleGoalChange}
        >
          <option value="3000">Goal: $3,000</option>
          <option value="5000">Goal: $5,000</option>
          <option value="10000">Goal: $10,000</option>
          <option value="20000">Goal: $20,000</option>
          <option value="30000">Goal: $30,000</option>
        </select>
      </div>

      <div className="flex flex-col space-y-8">
        {/* Inputs Section */}
        <section className="bg-white p-6 rounded-3xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-gray-600">
        Daily Inputs</h2>
          <DayInput
            onDataChange={handleDataChange}
            date={selectedDate}
            onDateChange={setSelectedDate}
            record={getRecordForSelectedDate()}
          />
        </section>

        {/* Progress Section */}
        <section className="bg-white p-6 rounded-3xl shadow-md">
          <ProgressChart
            chartData={chartData}
            goalLineDaily={goalLineDaily}
            goalLineAccumulated={goalLineAccumulated}
            isAccumulatedView={isAccumulatedView}
            toggleChartView={toggleChartView}
          />
          <ActivityTracker activityData={activityData} today={new Date()} />
        </section>
      </div>
    </div>
  );
};

export default App;
