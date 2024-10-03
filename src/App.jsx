// App.jsx
import React, { useState, useEffect } from 'react';
import DayInput from './DayInput';
import ProgressChart from './ProgressChart';
import ActivityTracker from './ActivityTracker';

const App = () => {
  const [dailyRecords, setDailyRecords] = useState({});
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

  // **Loading State**
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper function to generate storage key based on year and month
  const getStorageKey = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 01-12
    return `dailyRecords-${year}-${month}`;
  };

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

  // **Load data for the current month when selectedDate changes**
  useEffect(() => {
    const key = getStorageKey(selectedDate);
    try {
      const storedDailyRecords = JSON.parse(localStorage.getItem(key)) || {};
      setDailyRecords(storedDailyRecords);
      setIsLoaded(true); // Data has been loaded
      console.log(`Loaded data for ${key}:`, storedDailyRecords);
    } catch (error) {
      console.error('Failed to load daily records:', error);
      setDailyRecords({});
      setIsLoaded(true); // Even if failed, prevent saving
    }
  }, [selectedDate.getFullYear(), selectedDate.getMonth()]);

  // **Save dailyRecords to localStorage whenever it changes, but only after loading**
  useEffect(() => {
    if (!isLoaded) return; // Prevent saving before loading
    try {
      const key = getStorageKey(selectedDate);
      localStorage.setItem(key, JSON.stringify(dailyRecords));
      console.log(`Saved data to ${key}:`, dailyRecords);
    } catch (error) {
      console.error('Failed to save daily records:', error);
    }
  }, [dailyRecords, selectedDate, isLoaded]);

  // **Update chart data and activity data whenever dependencies change**
  useEffect(() => {
    if (!isLoaded) return; // Ensure data is loaded before updating chart
    updateChartData();
    updateActivityData(); // Also update activity data
  }, [dailyRecords, selectedDate, selectedGoal, isAccumulatedView, isLoaded]);

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

      const record = dailyRecords[dateKey] || {};

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
      const record = dailyRecords[dateKey] || {};
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

  const handleDataChange = (date, data) => {
    const key = formatDateKey(date);
    const daysInMonth = getDaysInMonth(date);
    const dailyGoal = selectedGoal / daysInMonth;

    setDailyRecords((prevRecords) => ({
      ...prevRecords,
      [key]: {
        ...prevRecords[key],
        ...data,
        dailyGoal, // Store dailyGoal for the day
      },
    }));
  };

  const getRecordForSelectedDate = () => {
    const dateKey = formatDateKey(selectedDate);
    return dailyRecords[dateKey] || {};
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="absolute top-8 right-4">
        <select
          id="goalSelect"
          className="goal-select bg-gray-200 text-gray-700 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
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
      <h1 className="text-3xl font-semibold text-center mb-8">Progress Tracker</h1>

      {/* Integrated DayInput Component */}
      <DayInput
        onDataChange={handleDataChange}
        date={selectedDate}
        onDateChange={setSelectedDate}
        record={getRecordForSelectedDate()}
      />

      {/* Render the chart */}
      <ProgressChart
        chartData={chartData}
        goalLineDaily={goalLineDaily}
        goalLineAccumulated={goalLineAccumulated}
        isAccumulatedView={isAccumulatedView}
        toggleChartView={toggleChartView}
      />

      {/* Show earnings activity tracker */}
      <ActivityTracker activityData={activityData} today={new Date()} />
    </div>
  );
};

export default App;
