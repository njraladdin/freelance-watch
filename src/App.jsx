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

  // Load data from localStorage when the component mounts
  useEffect(() => {
    const storedDailyRecords = JSON.parse(localStorage.getItem('dailyRecords')) || {};
    setDailyRecords(storedDailyRecords);
  }, []);

  // Update chart data whenever dailyRecords or selectedDate changes
  useEffect(() => {
    updateChartData();
  }, [dailyRecords, selectedDate, selectedGoal]);

  // Save dailyRecords to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dailyRecords', JSON.stringify(dailyRecords));
  }, [dailyRecords]);

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

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(new Date(year, month, day));
      const record = dailyRecords[dateKey] || {};

      const earning = record.earnings || 0;
      totalEarnings += earning;

      earnings.push(earning || null);
      accumulatedEarnings.push(totalEarnings);

      hoursWorked.push(record.hoursWorked || null);
      sleepHours.push(record.sleepHours || null);
      didWorkout.push(record.didWorkout || false);
      projectsCount.push(record.projectsCount || null);
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

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  };

  const handleGoalChange = (event) => {
    const newGoal = parseInt(event.target.value);
    setSelectedGoal(newGoal);
  };

  const toggleChartView = () => {
    setIsAccumulatedView(!isAccumulatedView);
  };

  const handleDataChange = (date, data) => {
    setDailyRecords((prevRecords) => {
      const dateKey = formatDateKey(date);
      return {
        ...prevRecords,
        [dateKey]: {
          ...prevRecords[dateKey],
          ...data,
        },
      };
    });
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
      <ActivityTracker activityData={activityData} today={selectedDate} />
    </div>
  );
};

export default App;
