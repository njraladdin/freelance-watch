// App.jsx
import React, { useState, useEffect } from 'react';
import DayInput from './DayInput';
import ProgressChart from './ProgressChart';
import ActivityTracker from './ActivityTracker';

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
  const [projectsData, setProjectsData] = useState([]); // Projects Data

  // Initialize selectedDate to today's date
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
    setLabels(labels);

    // Load data from localStorage or initialize empty arrays
    const storedDailyData = JSON.parse(localStorage.getItem('dailyData')) || new Array(daysInMonth).fill(null);
    const storedAccumulatedData = JSON.parse(localStorage.getItem('accumulatedData')) || new Array(daysInMonth).fill(null);
    const storedHoursData = JSON.parse(localStorage.getItem('hoursData')) || new Array(daysInMonth).fill(0);
    const storedSleepData = JSON.parse(localStorage.getItem('sleepData')) || new Array(daysInMonth).fill(0);
    const storedWorkoutData = JSON.parse(localStorage.getItem('workoutData')) || new Array(daysInMonth).fill(false);
    const storedProjectsData = JSON.parse(localStorage.getItem('projectsData')) || new Array(daysInMonth).fill(0);

    setDailyData(storedDailyData);
    setAccumulatedData(storedAccumulatedData);
    setHoursData(storedHoursData);
    setSleepData(storedSleepData);
    setWorkoutData(storedWorkoutData);
    setProjectsData(storedProjectsData);

    // Update goal lines
    updateGoalLines(selectedGoal, daysInMonth, labels);

    // Initialize activityData
    const storedActivityData = JSON.parse(localStorage.getItem('activityData')) || new Array(365).fill(0);
    setActivityData(storedActivityData);
  }, [daysInMonth, selectedGoal]);

  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem('dailyData', JSON.stringify(dailyData));
    localStorage.setItem('accumulatedData', JSON.stringify(accumulatedData));
    localStorage.setItem('hoursData', JSON.stringify(hoursData));
    localStorage.setItem('sleepData', JSON.stringify(sleepData));
    localStorage.setItem('workoutData', JSON.stringify(workoutData));
    localStorage.setItem('projectsData', JSON.stringify(projectsData));
    localStorage.setItem('activityData', JSON.stringify(activityData));
  }, [dailyData, accumulatedData, hoursData, sleepData, workoutData, projectsData, activityData]);

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

  const getTodayIndex = () => {
    const day = selectedDate.getDate();
    return day - 1; // Zero-based index
  };

  const handleEarningsChange = (amount) => {
    const todayIndex = getTodayIndex();

    // Update the amount for the selected date
    const newDailyData = [...dailyData];
    newDailyData[todayIndex] = amount;

    // Update accumulated data
    const newAccumulatedData = [...accumulatedData];
    let accumulated = 0;
    for (let i = 0; i <= todayIndex; i++) {
      accumulated += newDailyData[i] || 0;
      newAccumulatedData[i] = accumulated;
    }
    for (let i = todayIndex + 1; i < newAccumulatedData.length; i++) {
      newAccumulatedData[i] = null;
    }

    setDailyData(newDailyData);
    setAccumulatedData(newAccumulatedData);

    // Update activity tracker
    const dailyGoal = selectedGoal / daysInMonth;
    const todayTotal = newDailyData[todayIndex] || 0;
    const percentage = (todayTotal / dailyGoal) * 100;
    updateActivityTracker(selectedDate, percentage);
  };

  const handleHoursChange = (hours) => {
    const todayIndex = getTodayIndex();
    const newHoursData = [...hoursData];
    newHoursData[todayIndex] = hours;
    setHoursData(newHoursData);
  };

  const handleSleepChange = (sleepHours) => {
    const todayIndex = getTodayIndex();
    const newSleepData = [...sleepData];
    newSleepData[todayIndex] = sleepHours;
    setSleepData(newSleepData);
  };

  const handleWorkoutChange = (didWorkout) => {
    const todayIndex = getTodayIndex();
    const newWorkoutData = [...workoutData];
    newWorkoutData[todayIndex] = didWorkout;
    setWorkoutData(newWorkoutData);
  };

  const handleProjectsChange = (newCount) => {
    const todayIndex = getTodayIndex();
    const newProjectsData = [...projectsData];
    newProjectsData[todayIndex] = newCount;
    setProjectsData(newProjectsData);
  };

  const updateActivityTracker = (date, percentage) => {
    const newActivityData = [...activityData];
    const dayOfYear = getDayOfYear(date) - 1; // Index from 0
    newActivityData[dayOfYear] = percentage;
    setActivityData(newActivityData);
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
      <DayInput
        onEarningsChange={handleEarningsChange}
        onHoursChange={handleHoursChange}
        onSleepChange={handleSleepChange}
        onWorkoutChange={handleWorkoutChange}
        onProjectsChange={handleProjectsChange}
        earnings={dailyData[getTodayIndex()]}
        hours={hoursData[getTodayIndex()]}
        sleepHours={sleepData[getTodayIndex()]}
        didWorkout={workoutData[getTodayIndex()]}
        projectsCount={projectsData[getTodayIndex()]}
        date={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Render the chart */}
      <ProgressChart
        dailyData={dailyData}
        accumulatedData={accumulatedData}
        goalLineDaily={goalLineDaily}
        goalLineAccumulated={goalLineAccumulated}
        labels={labels}
        isAccumulatedView={isAccumulatedView}
        toggleChartView={toggleChartView}
        hoursData={hoursData}
        sleepData={sleepData}
        workoutData={workoutData}
        projectsData={projectsData}
      />

      {/* Show earnings activity tracker */}
      <ActivityTracker activityData={activityData} today={selectedDate} />
    </div>
  );
};

export default App;
