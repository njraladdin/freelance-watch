// src/DayInput.jsx
import React, { useEffect } from 'react';
import {
  FiDollarSign,
  FiClock,
  FiMoon,
  FiActivity,
  FiBriefcase,
  FiPlus,
  FiMinus,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { FaWalking, FaFire } from 'react-icons/fa'; // Importing walking and fire icons from react-icons/fa

const DayInput = ({ onDataChange, record, date, onDateChange }) => {
  // Local state for selected work times (array of { start: hour, end: hour })
  const [selectedWorkTimes, setSelectedWorkTimes] = React.useState(record.selectedWorkTimes || []);

  // Local state for selected sleep times (array of { start: hour, end: hour })
  const [selectedSleepTimes, setSelectedSleepTimes] = React.useState(record.selectedSleepTimes || []);

  // Local state for workout and walk toggles
  const [didWorkout, setDidWorkout] = React.useState(record.didWorkout || false);
  const [didWalk, setDidWalk] = React.useState(record.didWalk || false);

  // Local state for motivation level
  const [motivationLevel, setMotivationLevel] = React.useState(record.motivationLevel || 0);

  // Synchronize selected times with record props
  useEffect(() => {
    setSelectedWorkTimes(record.selectedWorkTimes || []);
  }, [record.selectedWorkTimes]);

  useEffect(() => {
    setSelectedSleepTimes(record.selectedSleepTimes || []);
  }, [record.selectedSleepTimes]);

  useEffect(() => {
    setDidWorkout(record.didWorkout || false);
  }, [record.didWorkout]);

  useEffect(() => {
    setDidWalk(record.didWalk || false);
  }, [record.didWalk]);

  useEffect(() => {
    setMotivationLevel(record.motivationLevel || 0);
  }, [record.motivationLevel]);

  const hoursArray = Array.from({ length: 24 }, (_, i) => i);

  // Define unique colors for each category
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
    motivation: {
      text: 'text-yellow-500',
      bg: 'bg-yellow-500',
      iconFilled: 'text-yellow-500',
      iconEmpty: 'text-gray-300',
    },
  };

  // **Reusable ToggleSwitch Component**
  const ToggleSwitch = ({ label, Icon, isChecked, onToggle, color }) => {
    const colorClasses = colors[color] || colors['earnings']; // Default to 'earnings' if color not found

    return (
      <div className="flex flex-col bg-gray-50 p-5 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
        <div className={`flex items-center space-x-3 mb-3 ${colorClasses.text}`}>
          <Icon className={`w-6 h-6 transition-colors duration-150 ease-in-out ${colorClasses.text}`} />
          <p className="text-lg font-medium text-gray-700">{label}</p>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <span className="text-gray-600">No</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={onToggle}
              className="sr-only peer"
              aria-label={`Toggle ${label}`}
            />
            <div
              className={`w-11 h-6 ${isChecked ? colors[color].bg : 'bg-gray-300'} peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-${colors[color].switch}-500 rounded-full transition-colors duration-150 ease-in-out`}
            ></div>
            <div
              className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-150 ease-in-out ${
                isChecked ? `transform translate-x-5` : ''
              }`}
            ></div>
          </label>
          <span className="text-gray-600">Yes</span>
        </div>
      </div>
    );
  };

  // **Reusable MotivationSelector Component**
  const MotivationSelector = ({ level, onChange }) => {
    const maxLevel = 5; // 5 levels instead of 10

    const handleClick = (selectedLevel) => {
      if (selectedLevel === level) {
        onChange(0); // Reset to 0 if the same level is clicked
      } else {
        onChange(selectedLevel);
      }
    };

    return (
      <div className="flex flex-col bg-gray-50 p-5 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
        <div className={`flex items-center space-x-3 mb-3 ${colors['motivation'].text}`}>
          <FaFire className={`w-8 h-8 transition-colors duration-150 ease-in-out ${colors['motivation'].text}`} />
          <p className="text-lg font-medium text-gray-700">Motivation Level</p>
        </div>
        <div className="flex items-center justify-center space-x-2">
          {Array.from({ length: maxLevel }, (_, i) => (
            <button
              key={i}
              onClick={() => handleClick(i + 1)}
              className="focus:outline-none"
              aria-label={`Set motivation level to ${i + 1}`}
            >
              <FaFire
                className={`w-8 h-8 ${
                  i < level ? colors['motivation'].iconFilled : colors['motivation'].iconEmpty
                } transition-colors duration-150 ease-in-out hover:text-yellow-400`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const formatHour = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // Handle Date Change via Date Picker
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    onDateChange(newDate);
  };

  // Handle Previous Day Navigation
  const handlePrevDay = () => {
    const prev = new Date(date);
    prev.setDate(date.getDate() - 1);
    onDateChange(prev);
  };

  // Handle Next Day Navigation
  const handleNextDay = () => {
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    onDateChange(next);
  };

  // Determine if the selected date is today
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date
  const isToday = date.toDateString() === today.toDateString();

  // Handle Earnings Change
  const handleAmountChange = (value) => {
    const newValue = Math.max(value, 0);
    onDataChange(date, { earnings: newValue });
  };

  // Handle Workout Toggle
  const handleWorkoutToggle = () => {
    const newValue = !didWorkout;
    setDidWorkout(newValue);
    onDataChange(date, { didWorkout: newValue });
  };

  // Handle Walk Toggle
  const handleWalkToggle = () => {
    const newValue = !didWalk;
    setDidWalk(newValue);
    onDataChange(date, { didWalk: newValue });
  };

  // Handle Project Count Change
  const handleProjectVisualClick = (value) => {
    const newValue = record.projectsCount === value ? 0 : value;
    onDataChange(date, { projectsCount: newValue });
  };

  // **Reusable TimeRangeSelector Component**
  const TimeRangeSelector = ({ selectedTimes, onTimeChange, maxHours, label }) => {
    // selectedTimes is an array of { start: hour, end: hour }
    const [localSelectedTimes, setLocalSelectedTimes] = React.useState(selectedTimes || []);

    useEffect(() => {
      setLocalSelectedTimes(selectedTimes || []);
    }, [selectedTimes]);

    // Handle the selection of times
    const handleLocalTimeClick = (hour) => {
      let newSelectedTimes = [...localSelectedTimes];

      // Determine if we need to add a start time or an end time
      const lastRange = newSelectedTimes[newSelectedTimes.length - 1];

      if (!lastRange || lastRange.end !== null) {
        // Add a new range with start time
        newSelectedTimes.push({ start: hour, end: null });
      } else {
        // Set the end time for the last range
        // Prevent overlapping with existing ranges
        const overlapping = newSelectedTimes.some((range, index) => {
          if (index === newSelectedTimes.length - 1) return false; // Current range being set
          const rangeStart = range.start;
          const rangeEnd = range.end < range.start ? range.end + 24 : range.end;
          const currentStart = lastRange.start;
          const currentEnd = hour < currentStart ? hour + 24 : hour;
          return (
            (currentStart >= rangeStart && currentStart < rangeEnd) ||
            (currentEnd > rangeStart && currentEnd <= rangeEnd) ||
            (currentStart <= rangeStart && currentEnd >= rangeEnd)
          );
        });

        if (overlapping) {
          alert('Selected time overlaps with an existing range.');
          return;
        }

        newSelectedTimes[newSelectedTimes.length - 1].end = hour;
      }

      setLocalSelectedTimes(newSelectedTimes);
      onTimeChange(newSelectedTimes);
    };

    // Calculate total hours across all ranges, including both start and end hours
    const calculateTotalHours = () => {
      let total = 0;
      localSelectedTimes.forEach((range) => {
        if (range.start !== null && range.end !== null) {
          let hours = range.end - range.start + 1; // +1 to include both start and end hours
          if (hours <= 0) {
            hours += 24; // Handle overnight
          }
          total += hours;
        }
      });
      return total;
    };

    const totalHours = calculateTotalHours();

    return (
      <div>
        {/* Total Hours Display */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <p className="text-center text-xl font-semibold text-gray-800">
            {totalHours > 0 ? `${totalHours}h` : 'Select Time'}
          </p>
        </div>

        {/* Hours Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {hoursArray.map((hour) => {
            // Determine if the hour is part of any selected range
            let isStart = false;
            let isEnd = false;

            localSelectedTimes.forEach((range) => {
              if (range.start === hour) isStart = true;
              if (range.end === hour) isEnd = true;
            });

            return (
              <button
                key={hour}
                onClick={() => handleLocalTimeClick(hour)}
                className={`flex items-center justify-center p-3 text-sm font-medium rounded-md transition-colors duration-100 ease-in-out ${
                  isStart
                    ? 'bg-green-500 text-white'
                    : isEnd
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                } focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-105 lg:p-4 lg:text-lg`}
                aria-label={`Select ${formatHour(hour)}`}
              >
                <span className="text-sm font-medium">{formatHour(hour)}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // **Handle Work Time Changes from TimeRangeSelector**
  const handleWorkTimeChange = (newTimes) => {
    let total = 0;
    newTimes.forEach((range) => {
      if (range.start !== null && range.end !== null) {
        let hours = range.end - range.start + 1; // +1 to include both start and end
        if (hours <= 0) {
          hours += 24; // Handle overnight
        }
        total += hours;
      }
    });

    onDataChange(date, { hoursWorked: total, selectedWorkTimes: newTimes });
  };

  // **Handle Sleep Time Changes from TimeRangeSelector**
  const handleSleepTimeChange = (newTimes) => {
    let total = 0;
    newTimes.forEach((range) => {
      if (range.start !== null && range.end !== null) {
        let hours = range.end - range.start + 1; // +1 to include both start and end
        if (hours <= 0) {
          hours += 24; // Handle overnight
        }
        total += hours;
      }
    });
    // Clamp total sleep hours between 0 and 12
    total = Math.min(Math.max(total, 0), 12);
    onDataChange(date, { sleepHours: total, selectedSleepTimes: newTimes });
  };

  // **Handle Motivation Level Change**
  const handleMotivationLevelChange = (level) => {
    setMotivationLevel(level);
    onDataChange(date, { motivationLevel: level });
  };

  // **Reset Function for Work Hours**
  const resetWorkSelections = () => {
    setSelectedWorkTimes([]);
    onDataChange(date, { selectedWorkTimes: [], hoursWorked: 0 });
  };

  // **Reset Function for Sleep Hours**
  const resetSleepSelections = () => {
    setSelectedSleepTimes([]);
    onDataChange(date, { selectedSleepTimes: [], sleepHours: 0 });
  };

  return (
    <div className="space-y-8">
      {/* Date Picker with Navigation Arrows */}
      <div className="flex justify-center items-center space-x-4">
        {/* Previous Day Button */}
        <button
          onClick={handlePrevDay}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-150 ease-in-out"
          aria-label="Previous Day"
        >
          <FiChevronLeft className="w-5 h-5 text-gray-600 transition-colors duration-150 ease-in-out hover:scale-110" />
        </button>

        {/* Date Input */}
        <input
          type="date"
          value={date.toISOString().split('T')[0]} // Use input type="date" for better UX
          onChange={handleDateChange}
          className="w-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700 transition-colors duration-150 ease-in-out"
          aria-label="Select Date"
        />

        {/* Next Day Button */}
        <button
          onClick={handleNextDay}
          className={`p-2 rounded-full transition-colors duration-150 ease-in-out ${
            isToday
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
          aria-label="Next Day"
          disabled={isToday}
        >
          <FiChevronRight className="w-5 h-5 transition-colors duration-150 ease-in-out hover:scale-110" />
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Sleep Time */}
      <div className="flex flex-col bg-gray-50 p-5 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <FiMoon className="text-orange-500 w-6 h-6 transition-colors duration-150 ease-in-out" />
              <p className="text-lg font-medium text-gray-700">Sleep Time</p>
            </div>
            <button
              onClick={resetSleepSelections}
              className="text-sm text-blue-400 hover:text-blue-500 transition-colors duration-150 ease-in-out"
              aria-label="Reset Sleep Time"
            >
              Reset
            </button>
          </div>
          <TimeRangeSelector
            selectedTimes={selectedSleepTimes}
            onTimeChange={handleSleepTimeChange}
            maxHours={12}
            label="Sleep Time"
          />
        </div>
        {/* Motivation Level */}
        <MotivationSelector level={motivationLevel} onChange={handleMotivationLevelChange} />
  {/* Workout */}
  <ToggleSwitch
          label="Did You Workout?"
          Icon={FiActivity}
          isChecked={didWorkout}
          onToggle={handleWorkoutToggle}
          color="workout"
        />

        {/* Walk */}
        <ToggleSwitch
          label="Did You Take a Walk?"
          Icon={FaWalking}
          isChecked={didWalk}
          onToggle={handleWalkToggle}
          color="walk"
        />

        {/* Work Hours */}
        <div className="flex flex-col bg-gray-50 p-5 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FiClock className="text-blue-500 w-6 h-6 transition-colors duration-150 ease-in-out" />
              <p className="text-lg font-medium text-gray-700">Work Hours</p>
            </div>
            <button
              onClick={resetWorkSelections}
              className="text-sm text-blue-400 hover:text-blue-500 transition-colors duration-150 ease-in-out"
              aria-label="Reset Work Hours"
            >
              Reset
            </button>
          </div>

          <TimeRangeSelector
            selectedTimes={selectedWorkTimes}
            onTimeChange={handleWorkTimeChange}
            maxHours={24}
            label="Work Hours"
          />
        </div>

      
  
              {/* Projects Won */}
              <div className="flex flex-col bg-gray-50 p-5 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
          <div className="flex items-center space-x-3 mb-3">
            <FiBriefcase className="text-purple-500 w-6 h-6 transition-colors duration-150 ease-in-out" />
            <p className="text-lg font-medium text-gray-700">Projects Won</p>
          </div>
          <div className="flex justify-center space-x-2">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleProjectVisualClick(i + 1)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-150 ease-in-out ${
                  (record.projectsCount || 0) >= i + 1
                    ? 'bg-purple-500 text-white transform hover:scale-110'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 transform hover:scale-110'
                }`}
                aria-label={`Set projects count to ${i + 1}`}
              >
                {(record.projectsCount || 0) >= i + 1 ? (
                  <FiBriefcase className="w-5 h-5 transition-colors duration-150 ease-in-out" />
                ) : (
                  <span className="text-sm font-medium transition-opacity duration-150 ease-in-out">
                    {i + 1}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

                {/* Money Earned */}
                <div className="flex flex-col bg-gray-50 p-5 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
          <div className="flex items-center space-x-3 mb-3">
            <FiDollarSign className="text-green-500 w-6 h-6 transition-colors duration-150 ease-in-out" />
            <p className="text-lg font-medium text-gray-700">Money Earned</p>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => handleAmountChange((record.earnings || 0) - 10)}
              className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-150 ease-in-out transform hover:scale-105"
              aria-label="Decrease Earnings"
            >
              <FiMinus className="w-4 h-4 text-gray-600 transition-colors duration-150 ease-in-out" />
            </button>
            <input
              type="number"
              value={record.earnings || 0}
              onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
              className="w-24 text-center text-xl font-semibold text-gray-800 border-b-2 border-green-400 focus:outline-none focus:border-green-500 transition-colors duration-150 ease-in-out"
              aria-label="Earnings Amount"
            />
            <button
              onClick={() => handleAmountChange((record.earnings || 0) + 10)}
              className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-150 ease-in-out transform hover:scale-105"
              aria-label="Increase Earnings"
            >
              <FiPlus className="w-4 h-4 text-gray-600 transition-colors duration-150 ease-in-out" />
            </button>
          </div>
        </div>

  
      </div>
    </div>
  );
};

export default DayInput;
