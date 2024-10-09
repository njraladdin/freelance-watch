// src/DayInput.jsx
import React, { useEffect, useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  FiPlay,
  FiPause,
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import { AiOutlineFrown } from 'react-icons/ai';

// Reusable TimePickerModal Component
const TimePickerModal = React.memo(({ isOpen, onClose, onSelect, onReset, title, color }) => {
  if (!isOpen) return null;

  const hoursArray = Array.from({ length: 24 }, (_, i) => i);

  // Define color-specific classes
  const colorClasses = {
    start: {
      hoverBg: 'hover:bg-green-500',
      hoverText: 'hover:text-white',
      text: 'text-green-500',
    },
    end: {
      hoverBg: 'hover:bg-orange-500',
      hoverText: 'hover:text-white',
      text: 'text-orange-500',
    },
  };

  const currentColor = colorClasses[color] || colorClasses.start;

  // Helper Function to Format Hour
  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:00 ${period}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-sm">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className={`text-lg font-semibold ${currentColor.text}`}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="text-gray-600 hover:text-gray-800 text-2xl leading-none focus:outline-none"
          >
            &times;
          </button>
        </div>

        {/* Hour Selection Grid */}
        <div className="p-4 grid grid-cols-3 gap-3">
          {hoursArray.map((hour) => (
            <button
              key={hour}
              onClick={() => onSelect(hour)}
              className={`w-full py-3 bg-gray-100 rounded-md text-center text-lg font-medium text-gray-700 ${currentColor.hoverBg} ${currentColor.hoverText} transition-colors duration-150 ease-in-out`}
              aria-label={`Select hour ${formatHour(hour)}`}
            >
              {formatHour(hour)}
            </button>
          ))}
        </div>

        {/* Reset Button */}
        <div className="flex justify-center p-4">
          <button
            onClick={onReset}
            className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-150 ease-in-out"
            aria-label="Reset Selection"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
});


// Reusable ToggleSwitch Component
const ToggleSwitch = React.memo(({ label, Icon, isChecked, onToggle, color }) => {
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
    exercise: {
      text: 'text-red-500',
      bg: 'bg-red-500',
      switch: 'red',
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
    anxiety: {
      text: 'text-blue-500',
      bg: 'bg-blue-500',
      iconFilled: 'text-blue-500',
      iconEmpty: 'text-gray-300',
    },
  };

  const colorClasses = colors[color] || colors['earnings'];

  return (
    <div className="flex flex-col bg-gray-50 p-5 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
      <div className={`flex items-center space-x-3 mb-3 ${colorClasses.text}`}>
        <Icon
          className={`w-6 h-6 transition-colors duration-150 ease-in-out ${colorClasses.text}`}
        />
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
            className={`w-11 h-6 ${isChecked ? colorClasses.bg : 'bg-gray-300'
              } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-${colorClasses.switch}-500 rounded-full transition-colors duration-150 ease-in-out`}
          ></div>
          <div
            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-150 ease-in-out ${isChecked ? `transform translate-x-5` : ''
              }`}
          ></div>
        </label>
        <span className="text-gray-600">Yes</span>
      </div>
    </div>
  );
});

// Reusable MotivationSelector Component
const MotivationSelector = React.memo(({ level, onChange }) => {
  const colors = {
    motivation: {
      text: 'text-yellow-500',
      bg: 'bg-yellow-500',
      iconFilled: 'text-yellow-500',
      iconEmpty: 'text-gray-300',
    },
  };
  const maxLevel = 5;

  const handleClick = (selectedLevel) => {
    if (selectedLevel === level) {
      onChange(0);
    } else {
      onChange(selectedLevel);
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 p-5 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
      <div className={`flex items-center space-x-3 mb-3 ${colors['motivation'].text}`}>
        <FaFire
          className={`w-8 h-8 transition-colors duration-150 ease-in-out ${colors['motivation'].text}`}
        />
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
              className={`w-8 h-8 ${i < level
                ? colors['motivation'].iconFilled
                : colors['motivation'].iconEmpty
                } transition-colors duration-150 ease-in-out hover:text-yellow-400`}
            />
          </button>
        ))}
      </div>
    </div>
  );
});

// Reusable AnxietySelector Component
const AnxietySelector = React.memo(({ level, onChange }) => {
  const colors = {
    anxiety: {
      text: 'text-blue-500',
      bg: 'bg-blue-500',
      iconFilled: 'text-blue-500',
      iconEmpty: 'text-gray-300',
    },
  };
  const maxLevel = 5;

  const handleClick = (selectedLevel) => {
    if (selectedLevel === level) {
      onChange(0);
    } else {
      onChange(selectedLevel);
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 p-5 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
      <div className={`flex items-center space-x-3 mb-3 ${colors['anxiety'].text}`}>
        <AiOutlineFrown
          className={`w-8 h-8 transition-colors duration-150 ease-in-out ${colors['anxiety'].text}`}
        />
        <p className="text-lg font-medium text-gray-700">Anxiety Level</p>
      </div>
      <div className="flex items-center justify-center space-x-2">
        {Array.from({ length: maxLevel }, (_, i) => (
          <button
            key={i}
            onClick={() => handleClick(i + 1)}
            className="focus:outline-none"
            aria-label={`Set anxiety level to ${i + 1}`}
          >
            <AiOutlineFrown
              className={`w-8 h-8 ${i < level
                ? colors['anxiety'].iconFilled
                : colors['anxiety'].iconEmpty
                } transition-colors duration-150 ease-in-out hover:text-blue-400`}
            />
          </button>
        ))}
      </div>
    </div>
  );
});

// Reusable TimeRangeSelector Component without Break Functionality
const TimeRangeSelector = React.memo(({
  selectedTimes,
  onTimeChange,
  maxHours,
  label,
  // Removed break-related props
  // breakData,
  // onBreakChange,
  // allowBreak = true, // New prop to control break functionality
}) => {
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);

  // Helper Function to Format Hour
  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:00 ${period}`;
  };

  // Determine if Break can be started (handled externally now)
  // const canStartBreak = selectedTimes.length > 0 && selectedTimes[0].start !== null;

  // Handle Start Time Selection
  const handleStartSelect = (hour) => {
    // Removed break-related checks
    if (selectedTimes.length > 0 && selectedTimes[0].end !== null && hour >= selectedTimes[0].end) {
      alert('Start time must be before end time.');
      return;
    }
    const newTimes = [{ start: hour, end: selectedTimes[0]?.end || null }];
    onTimeChange(newTimes);
    setIsStartModalOpen(false);
  };

  // Handle End Time Selection
  const handleEndSelect = (hour) => {
    // Removed break-related checks
    if (selectedTimes.length > 0 && selectedTimes[0].start !== null && hour <= selectedTimes[0].start) {
      alert('End time must be after start time.');
      return;
    }
    const newTimes = [{ start: selectedTimes[0]?.start || null, end: hour }];
    onTimeChange(newTimes);
    setIsEndModalOpen(false);
  };

  // Removed break-related state and handlers
 // Handle Reset (Clear Selected Times)
 const handleReset = () => {
  onTimeChange([{ start: null, end: null }]);
};
  return (
    <div className="flex flex-col space-y-4">
      {/* Start and End Time Buttons Side by Side */}
      <div className="flex space-x-4">
        {/* Start Time Button */}
        <button
          onClick={() => setIsStartModalOpen(true)}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium text-left focus:outline-none focus:ring-2 transition-colors duration-150 ease-in-out ${selectedTimes.length > 0 && selectedTimes[0].start !== null
              ? 'bg-green-500 text-white focus:ring-green-500'
              : 'bg-gray-100 border border-gray-300 text-gray-700 focus:ring-gray-300'
            }`}
          aria-label="Select Start Time"
        >
          {selectedTimes.length > 0 && selectedTimes[0].start !== null ? `Start: ${formatHour(selectedTimes[0].start)}` : 'Start Time'}
        </button>

        {/* End Time Button */}
        <button
          onClick={() => setIsEndModalOpen(true)}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium text-left focus:outline-none focus:ring-2 transition-colors duration-150 ease-in-out ${selectedTimes.length > 0 && selectedTimes[0].end !== null
              ? 'bg-orange-500 text-white focus:ring-orange-500'
              : 'bg-gray-100 border border-gray-300 text-gray-700 focus:ring-gray-300'
            }`}
          aria-label="Select End Time"
        >
          {selectedTimes.length > 0 && selectedTimes[0].end !== null ? `End: ${formatHour(selectedTimes[0].end)}` : 'End Time'}
        </button>
      </div>

      {/* TimePicker Modals */}
      <TimePickerModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onSelect={handleStartSelect}
        onReset={handleReset}  // Pass the reset handler
        title="Select Start Time"
        color="start"
      />
      <TimePickerModal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        onSelect={handleEndSelect}
        onReset={handleReset}  // Pass the reset handler
        title="Select End Time"
        color="end"
      />
      {/* Removed Break Button */}
      {/* {allowBreak && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={handleBreakToggle}
            disabled={!canStartBreak}
            className={`flex items-center px-4 py-2 rounded-md transition-colors duration-150 ease-in-out ${isBreakActive
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                : 'bg-blue-200 text-blue-800 hover:bg-blue-300'
              } ${!canStartBreak ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Toggle Break"
            title={!canStartBreak ? 'Set a start time first to start a break' : ''}
          >
            {isBreakActive ? (
              <>
                <FiPause className="w-5 h-5 mr-2" />
                <span>Pause Break ({Math.floor(breakTotal / 3600)}h {Math.floor((breakTotal % 3600) / 60)}m)</span>
              </>
            ) : (
              <>
                <FiPlay className="w-5 h-5 mr-2" />
                <span>Start Break</span>
              </>
            )}
          </button>
        </div>
      )} */}
    </div>
  );
});

const DayInput = React.memo(({ onDataChange, record, date, onDateChange }) => {
  // Local state variables
  const [selectedWorkTimes, setSelectedWorkTimes] = useState(record.selectedWorkTimes || []);
  const [selectedSleepTimes, setSelectedSleepTimes] = useState(record.selectedSleepTimes || []);
  const [didExercise, setDidExercise] = useState(record.didExercise || false);
  const [motivationLevel, setMotivationLevel] = useState(record.motivationLevel || 0);
  const [anxietyLevel, setAnxietyLevel] = useState(record.anxietyLevel || 0);
  const [workBreak, setWorkBreak] = useState(record.workBreak || { isActive: false, startTime: null, total: 0 });

  // Synchronize state with props
  useEffect(() => {
    setSelectedWorkTimes(record.selectedWorkTimes || []);
  }, [record.selectedWorkTimes]);

  useEffect(() => {
    setSelectedSleepTimes(record.selectedSleepTimes || []);
  }, [record.selectedSleepTimes]);

  useEffect(() => {
    setDidExercise(record.didExercise || false);
  }, [record.didExercise]);

  useEffect(() => {
    setMotivationLevel(record.motivationLevel || 0);
  }, [record.motivationLevel]);

  useEffect(() => {
    setAnxietyLevel(record.anxietyLevel || 0);
  }, [record.anxietyLevel]);

  useEffect(() => {
    setWorkBreak(record.workBreak || { isActive: false, startTime: null, total: 0 });
  }, [record.workBreak]);

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
    exercise: {
      text: 'text-red-500',
      bg: 'bg-red-500',
      switch: 'red',
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
    anxiety: {
      text: 'text-blue-500',
      bg: 'bg-blue-500',
      iconFilled: 'text-blue-500',
      iconEmpty: 'text-gray-300',
    },
  };

  // Handle Date Change via React DatePicker
  const handleDateChange = (newDate) => {
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

  // Determine if the selected date is today or tomorrow
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = date.toDateString() === today.toDateString();

  const isTomorrow = (() => {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  })();

  // Determine Min and Max Dates for DatePicker
  const minDate = today;
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 1);

  // Handle Earnings Change
  const handleAmountChange = (value) => {
    const newValue = Math.max(value, 0);
    onDataChange(date, { earnings: newValue });
  };

  // Handle Exercise Toggle
  const handleExerciseToggle = useCallback(() => {
    const newValue = !didExercise;
    setDidExercise(newValue);
    onDataChange(date, { didExercise: newValue });
  }, [didExercise, onDataChange, date]);

  // Handle Project Count Change
  const handleProjectVisualClick = (value) => {
    const newValue = record.projectsCount === value ? 0 : value;
    onDataChange(date, { projectsCount: newValue });
  };

  // Helper Function to Calculate Hours Between Start and End
  const calculateHours = (start, end) => {
    let hours = end - start;
    if (hours <= 0) {
      hours += 24; // Handle overnight
    }
    return hours;
  };

  // Handle Work Time Changes from TimeRangeSelector
  const handleWorkTimeChange = useCallback(
    (newTimes) => {
      let total = 0;
      newTimes.forEach((range) => {
        if (range.start !== null && range.end !== null) {
          total += calculateHours(range.start, range.end);
        }
      });
      const breakHours = workBreak.total / 3600; // Convert total break seconds to hours (fractional)
      const adjustedHours = total - breakHours;
      onDataChange(date, {
        hoursWorked: adjustedHours >= 0 ? parseFloat(adjustedHours.toFixed(2)) : 0,
        selectedWorkTimes: newTimes,
        workBreak
      });
    },
    [onDataChange, date, workBreak]
  );

  // Handle Sleep Time Changes from TimeRangeSelector
  const handleSleepTimeChange = useCallback(
    (newTimes) => {
      let total = 0;
      newTimes.forEach((range) => {
        if (range.start !== null && range.end !== null) {
          total += calculateHours(range.start, range.end);
        }
      });
      const clampedSleep = Math.min(Math.max(total, 0), 12);
      onDataChange(date, {
        sleepHours: clampedSleep,
        selectedSleepTimes: newTimes
      });
    },
    [onDataChange, date]
  );

  // Handle Break Toggle
  const handleBreakToggle = () => {
    if (workBreak.isActive) {
      // Stop Break
      const endTime = Date.now();
      const elapsed = Math.floor((endTime - workBreak.startTime) / 1000); // in seconds
      const newTotalBreak = workBreak.total + elapsed;
  
      // Update the workBreak state
      setWorkBreak(prev => ({
        ...prev,
        isActive: false,
        startTime: null,
        total: newTotalBreak
      }));
  
      // Recalculate hoursWorked based on the new break total
      let totalWorkHours = 0;
      selectedWorkTimes.forEach((range) => {
        if (range.start !== null && range.end !== null) {
          totalWorkHours += calculateHours(range.start, range.end);
        }
      });
      const breakHours = newTotalBreak / 3600; // Convert seconds to hours
      const adjustedHours = totalWorkHours - breakHours;
  
      // Update the data via onDataChange
      onDataChange(date, {
        workBreak: { isActive: false, startTime: null, total: newTotalBreak },
        hoursWorked: adjustedHours >= 0 ? parseFloat(adjustedHours.toFixed(2)) : 0
      });
    } else {
      // Start Break
      const startTime = Date.now();
      setWorkBreak(prev => ({
        ...prev,
        isActive: true,
        startTime: startTime
      }));
      onDataChange(date, { workBreak: { isActive: true, startTime: startTime, total: workBreak.total } });
    }
  };
  

  // Handle Break Changes
  const handleWorkBreakChange = useCallback(
    (newBreak) => {
      setWorkBreak(newBreak);
      // Recalculate hoursWorked based on newBreak
      let totalWorkHours = 0;
      selectedWorkTimes.forEach((range) => {
        if (range.start !== null && range.end !== null) {
          totalWorkHours += calculateHours(range.start, range.end);
        }
      });
      const breakHours = newBreak.total / 3600; // Convert seconds to hours
      const adjustedHours = totalWorkHours - breakHours;
      onDataChange(date, {
        workBreak: newBreak,
        hoursWorked: adjustedHours >= 0 ? parseFloat(adjustedHours.toFixed(2)) : 0
      });
    },
    [onDataChange, date, selectedWorkTimes]
  );

  // Cleanup on Unmount
  useEffect(() => {
    return () => {
      // Any necessary cleanup can be handled here
      // For example, clearing intervals if you implement a live timer
    };
  }, []);

  // Persist Break Timer Across Sessions
  useEffect(() => {
    if (workBreak.isActive && workBreak.startTime) {
      const now = Date.now();
      const elapsed = Math.floor((now - workBreak.startTime) / 1000);
      setWorkBreak(prev => ({
        ...prev,
        total: prev.total + elapsed,
        startTime: now
      }));
      // Optionally, set up a timer to update breakTotal
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper Function to Format Hour
  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:00 ${period}`;
  };

  // Helper Function to Format Hours Worked
  const formatHoursWorked = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Calculate Total Hours Minus Break (if needed)
  const calculateTotalHours = () => {
    let total = 0;
    selectedWorkTimes.forEach((range) => {
      if (range.start !== null && range.end !== null) {
        let hours = range.end - range.start;
        if (hours <= 0) {
          hours += 24; // Handle overnight
        }
        total += hours;
      }
    });
    let breakHours = 0;
    let breakMinutes = 0;
    if (workBreak.total > 0) {
      breakHours = Math.floor(workBreak.total / 3600);
      breakMinutes = Math.floor((workBreak.total % 3600) / 60);
    }
    const breakDisplay = workBreak.total > 0
      ? ` (-${breakHours}h ${breakMinutes}m)`
      : '';
    return `${total - breakHours}${breakDisplay}`;
  };

  return (
    <div className="space-y-8">
      {/* Date Picker with Navigation Arrows */}
      <div className="flex flex-col items-center space-y-2">
        <div className="flex justify-center items-center space-x-4">
          {/* Previous Day Button */}
          <button
            onClick={handlePrevDay}
            className={`p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-150 ease-in-out`}
            aria-label="Previous Day"
          >
            <FiChevronLeft className="w-5 h-5 text-gray-600 transition-colors duration-150 ease-in-out hover:scale-110" />
          </button>

          {/* React DatePicker */}
          <DatePicker
            selected={date}
            onChange={handleDateChange}
            dateFormat="dd/MMMM/yyyy"
            minDate={minDate}
            maxDate={maxDate}
            className="w-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700 transition-colors duration-150 ease-in-out"
            aria-label="Select Date"
          />

          {/* Next Day Button */}
          <button
            onClick={handleNextDay}
            className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors duration-150 ease-in-out ${date >= maxDate ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            aria-label="Next Day"
            disabled={date >= maxDate}
          >
            <FiChevronRight className="w-5 h-5 transition-colors duration-150 ease-in-out hover:scale-110" />
          </button>
        </div>

        {/* Formatted Date and Label */}
        <div className="text-center">
          {isToday && <span className="text-green-500 font-medium">Today</span>}
          {isTomorrow && <span className="text-blue-500 font-medium">Tomorrow</span>}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Row 1: Sleep Time | Exercise | Anxiety Level */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sleep Time */}
          <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <FiMoon className="text-orange-500 w-6 h-6 transition-colors duration-150 ease-in-out" />
                <p className="text-lg font-medium text-gray-700">Sleep Time</p>
                <p className="text-lg font-semibold text-gray-800">
                  {selectedSleepTimes.length > 0 && selectedSleepTimes[0].start !== null && selectedSleepTimes[0].end !== null ? (
                    <span>
                      {calculateHours(selectedSleepTimes[0].start, selectedSleepTimes[0].end)}h
                    </span>
                  ) : (
                    '0h'
                  )}
                </p>
              </div>
            </div>

            <TimeRangeSelector
              selectedTimes={selectedSleepTimes}
              onTimeChange={handleSleepTimeChange}
              maxHours={12}
              label="Sleep Time"
              // Disable break functionality for sleep
            />
          </div>

          {/* Exercise */}
          <ToggleSwitch
            label="Did You Exercise?"
            Icon={FiActivity}
            isChecked={didExercise}
            onToggle={handleExerciseToggle}
            color="exercise"
          />

          {/* Anxiety Level */}
          <AnxietySelector level={anxietyLevel} onChange={setAnxietyLevel} />
        </div>

        {/* Row 2: Motivation Level | Projects Won | Work Hours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Motivation Level */}
          <MotivationSelector level={motivationLevel} onChange={setMotivationLevel} />

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
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-150 ease-in-out ${(record.projectsCount || 0) >= i + 1
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

          {/* Work Hours */}
          <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
            {/* Header with Break Button */}
            <div className="mb-4">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center space-x-3">
      <FiClock className="text-blue-500 w-6 h-6 transition-colors duration-150 ease-in-out" />
      <p className="text-lg font-medium text-gray-700">Work Hours</p>
      <p className="text-sm font-semibold text-gray-800 ">
        {formatHoursWorked(record.hoursWorked || 0)}
      </p>
    </div>
    
    {/* Break Button for desktop */}
    <button
      onClick={handleBreakToggle}
      disabled={!(selectedWorkTimes.length > 0 && selectedWorkTimes[0].start !== null)}
      className={`hidden md:flex items-center px-3 py-1 rounded-md transition-colors duration-150 ease-in-out ${workBreak.isActive
        ? 'bg-red-200 text-red-800 ' // Changed to red color for active state
        : 'bg-blue-200 text-blue-800 '
        } ${!(selectedWorkTimes.length > 0 && selectedWorkTimes[0].start !== null) ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label="Toggle Break"
      title={!(selectedWorkTimes.length > 0 && selectedWorkTimes[0].start !== null) ? 'Set a start time first to start a break' : ''}
    >
      {workBreak.isActive ? (
        <>
          <FiPause className="w-5 h-5 mr-2" />
          <span className="whitespace-nowrap"> Stop <span className="text-xs"> ({Math.floor(workBreak.total / 60)}m)</span></span>
        </>
      ) : (
        <>
          <FiPlay className="w-5 h-5 mr-2" />
          <span> Break</span>
        </>
      )}
    </button>
  </div>

  {/* Break Button for mobile (under start/end buttons) */}
 
</div>


            {/* TimeRangeSelector without Break Button */}
            <TimeRangeSelector
              selectedTimes={selectedWorkTimes}
              onTimeChange={handleWorkTimeChange}
              maxHours={24}
              label="Work Hours"
              // Removed break-related props
            />

<button
    onClick={handleBreakToggle}
    disabled={!(selectedWorkTimes.length > 0 && selectedWorkTimes[0].start !== null)}
    className={`flex md:hidden items-center px-3 py-3 rounded-md transition-colors duration-150 ease-in-out mt-6 ${workBreak.isActive
      ? 'bg-red-200 text-red-800 ' // Changed to red color for active state
      : 'bg-blue-200 text-blue-800 '
    } ${!(selectedWorkTimes.length > 0 && selectedWorkTimes[0].start !== null) ? 'opacity-50 cursor-not-allowed' : ''}`}
    aria-label="Toggle Break"
    title={!(selectedWorkTimes.length > 0 && selectedWorkTimes[0].start !== null) ? 'Set a start time first to start a break' : ''}
  >
    {workBreak.isActive ? (
      <>
        <FiPause className="w-5 h-5 mr-2" />
        <span> Stop Break <span className="text-sm"> ({Math.floor(workBreak.total / 60)}m)</span></span>
      </>
    ) : (
      <>
        <FiPlay className="w-5 h-5 mr-2" />
        <span>Start Break</span>
      </>
    )}
  </button>
          </div>
          
        </div>

        {/* Row 3: Money Earned */}
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
});

export default DayInput;
