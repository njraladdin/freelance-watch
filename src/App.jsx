// App.jsx
import React, { useState, useEffect } from 'react';
import DayInput from './DayInput';
import ProgressChart from './ProgressChart';
import ActivityTracker from './ActivityTracker';
import { FiChevronDown } from 'react-icons/fi';

const App = () => {
  const [dailyData, setDailyData] = useState([]);
  const [accumulatedData, setAccumulatedData] = useState([]);
  const [goalLineDaily, setGoalLineDaily] = useState([]);
  const [goalLineAccumulated, setGoalLineAccumulated] = useState([]);
  const [labels, setLabels] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState(31); // October has 31 days
  const [isAccumulatedView, setIsAccumulatedView] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(5000);
  const [activityData, setActivityData] = useState([]);
  const [hoursData, setHoursData] = useState([]); // Hours Worked
  const [sleepData, setSleepData] = useState([]); // Sleep Hours
  const [workoutData, setWorkoutData] = useState([]); // Workout Data
  const [selectedTab, setSelectedTab] = useState('Work Activity'); // New state for tabs

  // Set "today" to October 16, 2024
  const today = new Date(2024, 9, 16); // Note: month is 0-indexed, so 9 is October

  useEffect(() => {
    const { labels, newDailyData, newAccumulatedData } = generateChartData();
    setLabels(labels);
    setDailyData(newDailyData);
    setAccumulatedData(newAccumulatedData);
    updateGoalLines(selectedGoal, daysInMonth, labels);

    // Generate activity data for last 365 days
    const { yearlyActivityData, yearlySleepData, yearlyWorkoutData } = generateYearlyData();
    setActivityData(yearlyActivityData);
    setSleepData(yearlySleepData);
    setWorkoutData(yearlyWorkoutData);

    // Initialize hoursData for current month
    setHoursData(new Array(daysInMonth).fill(0));
  }, []);

  const generateChartData = () => {
    const labels = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    const newDailyData = [];
    const newAccumulatedData = [];
    let accumulated = 0;

    // Generate data for October 1-15
    for (let i = 0; i < 15; i++) {
      const dailyEarning = Math.floor(Math.random() * 300) + 50;
      newDailyData.push(dailyEarning);
      accumulated += dailyEarning;
      newAccumulatedData.push(accumulated);
    }

    // Add today's data (October 16)
    newDailyData.push(0);
    newAccumulatedData.push(accumulated);

    // Fill the rest of the month with null values
    for (let i = 16; i < 31; i++) {
      newDailyData.push(null);
      newAccumulatedData.push(null);
    }

    return { labels, newDailyData, newAccumulatedData };
  };

  const generateYearlyData = () => {
    const yearlyActivityData = [];
    const yearlySleepData = [];
    const yearlyWorkoutData = [];

    for (let i = 0; i < 365; i++) {
      // Random earnings percentage
      const earningsPercentage = Math.random() * 100;
      yearlyActivityData.push(earningsPercentage);

      // Random sleep between 4 and 10 hours
      const sleepHours = Math.floor(Math.random() * 7) + 4;
      yearlySleepData.push(sleepHours);

      // Random workout status
      const workedOut = Math.random() > 0.5;
      yearlyWorkoutData.push(workedOut);
    }

    return { yearlyActivityData, yearlySleepData, yearlyWorkoutData };
  };

  const updateGoalLines = (goal, days, labels) => {
    const dailyGoal = goal / days;
    setGoalLineDaily(new Array(days).fill(dailyGoal));
    setGoalLineAccumulated(labels.map((_, index) => dailyGoal * (index + 1)));
  };

  const handleGoalChange = (event) => {
    const newGoal = parseInt(event.target.value);
    setSelectedGoal(newGoal);
    updateGoalLines(newGoal, daysInMonth, labels);
  };

  const toggleChartView = () => {
    setIsAccumulatedView(!isAccumulatedView);
  };

  const handleAddEarnings = (amount, hours, sleep, didWorkout) => {
    const todayIndex = today.getDate() - 1;

    // Update Earnings Data
    const newDailyData = [...dailyData];
    const newAccumulatedData = [...accumulatedData];
    const newHoursData = [...hoursData];

    newDailyData[todayIndex] = (newDailyData[todayIndex] || 0) + amount;
    newAccumulatedData[todayIndex] = (newAccumulatedData[todayIndex] || 0) + amount;
    newHoursData[todayIndex] = (newHoursData[todayIndex] || 0) + hours;

    // Update accumulated data for the rest of the month
    for (let i = todayIndex + 1; i < newAccumulatedData.length; i++) {
      if (newAccumulatedData[i] !== null) {
        newAccumulatedData[i] += amount;
      }
    }

    setDailyData(newDailyData);
    setAccumulatedData(newAccumulatedData);
    setHoursData(newHoursData);

    const dailyGoal = selectedGoal / daysInMonth;
    const todayTotal = newDailyData[todayIndex] || 0;
    const percentage = (todayTotal / dailyGoal) * 100;

    updateActivityTracker(today, percentage, didWorkout, sleep);
  };

  const updateActivityTracker = (date, percentage, didWorkout, sleepHours) => {
    const newActivityData = [...activityData];
    const newSleepData = [...sleepData];
    const newWorkoutData = [...workoutData];

    const dayOfYear = getDayOfYear(date) - 1; // Index from 0

    newActivityData[dayOfYear] = percentage;
    newSleepData[dayOfYear] = sleepHours;
    newWorkoutData[dayOfYear] = didWorkout;

    setActivityData(newActivityData);
    setSleepData(newSleepData);
    setWorkoutData(newWorkoutData);
  };

  const getDayOfYear = (date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
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
    <DayInput onAddEarnings={handleAddEarnings} />

    {/* Moved Tabs Below the Input */}
    <div className="mb-4 mt-6">
      <nav className="flex justify-center space-x-4">
        <button
          className={`px-4 py-2 rounded ${
            selectedTab === 'Work Activity'
              ? 'text-white bg-blue-600'
              : 'text-gray-600 bg-gray-200'
          } transition-colors duration-200`}
          onClick={() => setSelectedTab('Work Activity')}
        >
          Work Activity
        </button>
        <button
          className={`px-4 py-2 rounded ${
            selectedTab === 'Health Activity'
              ? 'text-white bg-blue-600'
              : 'text-gray-600 bg-gray-200'
          } transition-colors duration-200`}
          onClick={() => setSelectedTab('Health Activity')}
        >
          Health Activity
        </button>
        <button
          className={`px-4 py-2 rounded ${
            selectedTab === 'All' ? 'text-white bg-blue-600' : 'text-gray-600 bg-gray-200'
          } transition-colors duration-200`}
          onClick={() => setSelectedTab('All')}
        >
          All
        </button>
      </nav>
    </div>

    {/* Render content based on selectedTab */}
    {selectedTab === 'Work Activity' && (
      <>
        {/* Show the chart with earnings, goal, hours worked */}
        <ProgressChart
          dailyData={dailyData}
          accumulatedData={accumulatedData}
          goalLineDaily={goalLineDaily}
          goalLineAccumulated={goalLineAccumulated}
          labels={labels}
          isAccumulatedView={isAccumulatedView}
          toggleChartView={toggleChartView}
          hoursData={hoursData}
          sleepData={null}
          workoutData={null}
          selectedTab={selectedTab}
        />

        {/* Show the activity tracker for earnings */}
        <ActivityTracker
          activityData={activityData}
          workoutData={null}
          sleepData={null}
          selectedTab={selectedTab}
          today={today}
        />
      </>
    )}

    {selectedTab === 'Health Activity' && (
      <>
        {/* Show the chart with sleep hours and workout data */}
        <ProgressChart
          dailyData={null}
          accumulatedData={null}
          goalLineDaily={null}
          goalLineAccumulated={null}
          labels={labels}
          isAccumulatedView={isAccumulatedView}
          toggleChartView={null}
          hoursData={null}
          sleepData={sleepData.slice(-daysInMonth)}
          workoutData={workoutData.slice(-daysInMonth)}
          selectedTab={selectedTab}
        />

        {/* Show the activity tracker for sleep and workout */}
        <ActivityTracker
          activityData={null}
          workoutData={workoutData}
          sleepData={sleepData}
          selectedTab={selectedTab}
          today={today}
        />
      </>
    )}

    {selectedTab === 'All' && (
      <>
        {/* Show all data */}
        <ProgressChart
          dailyData={dailyData}
          accumulatedData={accumulatedData}
          goalLineDaily={goalLineDaily}
          goalLineAccumulated={goalLineAccumulated}
          labels={labels}
          isAccumulatedView={isAccumulatedView}
          toggleChartView={toggleChartView}
          hoursData={hoursData}
          sleepData={sleepData.slice(-daysInMonth)}
          workoutData={workoutData.slice(-daysInMonth)}
          selectedTab={selectedTab}
        />

        {/* Show all activity data */}
        <ActivityTracker
          activityData={activityData}
          workoutData={workoutData}
          sleepData={sleepData}
          selectedTab={selectedTab}
          today={today}
        />
      </>
    )}
  </div>

  );
};

export default App;
