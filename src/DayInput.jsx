// DayInput.jsx
import React, { useState, useEffect } from 'react';
import {
  FiDollarSign,
  FiClock,
  FiMoon,
  FiActivity,
  FiBriefcase,
  FiPlus,
  FiMinus,
} from 'react-icons/fi';

// SVG Icons for Start and End Times
const StartIcon = () => (
  <svg
    className="w-3 h-3 ml-1"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const EndIcon = () => (
  <svg
    className="w-3 h-3 mr-1"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const DayInput = ({
  onEarningsChange,
  onHoursChange,
  onSleepChange,
  onWorkoutChange,
  onProjectsChange,
  earnings,
  hours,
  sleepHours,
  didWorkout,
  projectsCount,
  date,
  onDateChange,
}) => {
  // Local state
  const [amount, setAmount] = useState(earnings || 0);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [hoursWorked, setHoursWorked] = useState(hours || 0);

  const [localSleepHours, setLocalSleepHours] = useState(
    sleepHours !== null && sleepHours !== undefined ? sleepHours : 12
  );
  const [localDidWorkout, setLocalDidWorkout] = useState(didWorkout || false);
  const [localProjectsCount, setLocalProjectsCount] = useState(
    projectsCount !== null && projectsCount !== undefined ? projectsCount : 0
  );
  const [selectedDate, setSelectedDate] = useState(date);

  const hoursArray = Array.from({ length: 24 }, (_, i) => i);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  // Initialize selectedTimes from localStorage
  useEffect(() => {
    const storedSelectedTimes =
      JSON.parse(localStorage.getItem(`selectedTimes_${selectedDate.toDateString()}`)) || [];
    setSelectedTimes(storedSelectedTimes);
  }, [selectedDate]);

  // Save selectedTimes to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      `selectedTimes_${selectedDate.toDateString()}`,
      JSON.stringify(selectedTimes)
    );
  }, [selectedTimes, selectedDate]);

  // Update amount when earnings prop changes
  useEffect(() => {
    setAmount(earnings !== null && earnings !== undefined ? earnings : 0);
  }, [earnings]);

  // Update localSleepHours when sleepHours prop changes
  useEffect(() => {
    setLocalSleepHours(
      sleepHours !== null && sleepHours !== undefined ? sleepHours : 12
    );
  }, [sleepHours]);

  // Update localDidWorkout when didWorkout prop changes
  useEffect(() => {
    setLocalDidWorkout(didWorkout || false);
  }, [didWorkout]);

  // Update localProjectsCount when projectsCount prop changes
  useEffect(() => {
    setLocalProjectsCount(
      projectsCount !== null && projectsCount !== undefined ? projectsCount : 0
    );
  }, [projectsCount]);

  const handleAmountChange = (value) => {
    const newValue = Math.max(value, 0);
    setAmount(newValue);
    onEarningsChange(newValue);
  };

  // For Sleep Hours
  const handleSleepChange = (value) => {
    const newValue = Math.min(Math.max(value, 0), 12);
    setLocalSleepHours(newValue);
    onSleepChange(newValue);
  };

  // For Workout Toggle
  const handleWorkoutToggle = () => {
    const newValue = !localDidWorkout;
    setLocalDidWorkout(newValue);
    onWorkoutChange(newValue);
  };

  // Handle Time Click
  const handleTimeClick = (hour) => {
    setSelectedTimes((prevTimes) => {
      const index = prevTimes.indexOf(hour);
      if (index !== -1) {
        // If the hour is already selected, remove it
        const newTimes = prevTimes.filter((time) => time !== hour).sort((a, b) => a - b);
        return newTimes;
      } else {
        // Add the new hour and sort the array
        const newTimes = [...prevTimes, hour].sort((a, b) => a - b);
        return newTimes;
      }
    });
  };

  useEffect(() => {
    calculateHoursWorked();
  }, [selectedTimes]);

  const calculateHoursWorked = () => {
    let total = 0;
    for (let i = 0; i < selectedTimes.length; i += 2) {
      if (selectedTimes[i + 1] !== undefined) {
        total += selectedTimes[i + 1] - selectedTimes[i];
      }
    }
    setHoursWorked(total);
    onHoursChange(total);
  };

  const formatHour = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // Adjust getButtonStyle function
  const getButtonStyle = (hour) => {
    const index = selectedTimes.indexOf(hour);
    if (index === -1) return 'bg-gray-100 text-gray-800';
    if (index % 2 === 0) return 'bg-green-500 text-white';
    return 'bg-orange-500 text-white';
  };

  const getButtonContent = (hour) => {
    const index = selectedTimes.indexOf(hour);
    if (index === -1)
      return <span className="text-xs">{formatHour(hour)}</span>;
    if (index % 2 === 0)
      return (
        <div className="flex items-center justify-center">
          <span className="text-xs">{formatHour(hour)}</span>
          <StartIcon />
        </div>
      );
    return (
      <div className="flex items-center justify-center">
        <EndIcon />
        <span className="text-xs">{formatHour(hour)}</span>
      </div>
    );
  };

  const resetSelections = () => {
    setSelectedTimes([]);
    setHoursWorked(0);
  };

  // Handle Project Count Change
  const handleProjectVisualClick = (value) => {
    if (localProjectsCount === value) {
      // If the clicked value is already selected, unselect it
      setLocalProjectsCount(0);
      onProjectsChange(0);
    } else {
      // Select the new value
      setLocalProjectsCount(value);
      onProjectsChange(value);
    }
  };

  return (
    <div className="relative mb-6 p-6 bg-white rounded-3xl shadow-lg">
      {/* Date Picker */}
      <div className="mb-6 flex justify-center">
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]} // Format date as YYYY-MM-DD
          onChange={handleDateChange}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col space-y-8">
        {/* Earnings */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <FiDollarSign className="text-green-500 w-6 h-6" />
            <p className="text-gray-700 font-semibold">Earnings</p>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={() => handleAmountChange(amount - 10)}
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center focus:outline-none hover:bg-gray-300 transition-all duration-200"
            >
              <FiMinus className="w-6 h-6 text-gray-700" />
            </button>
            <span className="mx-6 text-2xl font-semibold text-gray-800">${amount.toFixed(2)}</span>
            <button
              onClick={() => handleAmountChange(amount + 10)}
              className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center focus:outline-none hover:bg-gray-300 transition-all duration-200"
            >
              <FiPlus className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Hours Worked and Time Selection */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FiClock className="text-blue-500 w-6 h-6" />
              <p className="text-gray-700 font-semibold">Hours Worked: {hoursWorked}h</p>
            </div>
            <button
              onClick={resetSelections}
              className="text-blue-500 text-sm hover:underline focus:outline-none"
              aria-label="Reset Selections"
            >
              Reset
            </button>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {hoursArray.map((hour) => (
              <button
                key={hour}
                onClick={() => handleTimeClick(hour)}
                className={`group relative flex items-center justify-center text-center py-1 px-1 text-xs font-medium transition-colors duration-150 ease-in-out rounded-md ${getButtonStyle(
                  hour
                )} transform-gpu focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                aria-label={`Select ${formatHour(hour)} as ${
                  selectedTimes.indexOf(hour) % 2 === 0 ? 'start' : 'end'
                } time`}
              >
                {getButtonContent(hour)}
              </button>
            ))}
          </div>
        </div>

        {/* Sleep and Workout */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-md">
          {/* Sleep Hours */}
          <div className="flex items-center space-x-3">
            <FiMoon className="text-blue-500 w-6 h-6" />
            <div>
              <p className="text-sm text-gray-500">Sleep Hours</p>
              <div className="flex items-center mt-2">
                <button
                  onClick={() => handleSleepChange(localSleepHours - 1)}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center focus:outline-none hover:bg-gray-300 transition-all duration-200"
                >
                  <FiMinus className="w-5 h-5 text-gray-700" />
                </button>
                <span className="mx-4 text-xl font-semibold text-gray-800">
                  {localSleepHours}h
                </span>
                <button
                  onClick={() => handleSleepChange(localSleepHours + 1)}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center focus:outline-none hover:bg-gray-300 transition-all duration-200"
                >
                  <FiPlus className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>

          {/* Workout Toggle */}
          <div className="flex items-center space-x-3">
            <FiActivity className="text-red-500 w-6 h-6" />
            <div>
              <p className="text-sm text-gray-500">Workout</p>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={localDidWorkout}
                  onChange={handleWorkoutToggle}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <FiBriefcase className="text-purple-500 w-6 h-6" />
            <p className="text-gray-700 font-semibold">Won Projects</p>
          </div>
          <div className="flex justify-center space-x-2">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleProjectVisualClick(i + 1)}
                className={`w-10 h-10 rounded-full flex items-center justify-center focus:outline-none transition-all duration-200 ${
                  localProjectsCount >= i + 1
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
                aria-label={`Set projects count to ${i + 1}`}
              >
                {localProjectsCount >= i + 1 ? (
                  <FiBriefcase className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{i + 1}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Styles for Switch */}
      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 42px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: '';
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #10b981;
        }

        input:checked + .slider:before {
          transform: translateX(18px);
        }
      `}</style>
    </div>
  );
};

export default DayInput;
