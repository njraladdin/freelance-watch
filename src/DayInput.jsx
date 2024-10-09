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
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import { AiOutlineFrown } from 'react-icons/ai';

const DayInput = React.memo(({ onDataChange, record, date, onDateChange }) => {
  // Local state variables
  const [selectedWorkTimes, setSelectedWorkTimes] = useState(record.selectedWorkTimes || []);
  const [selectedSleepTimes, setSelectedSleepTimes] = useState(record.selectedSleepTimes || []);
  const [didExercise, setDidExercise] = useState(record.didExercise || false);
  const [motivationLevel, setMotivationLevel] = useState(record.motivationLevel || 0);
  const [anxietyLevel, setAnxietyLevel] = useState(record.anxietyLevel || 0);

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

  // Reusable ToggleSwitch Component
  const ToggleSwitch = React.memo(
    ({ label, Icon, isChecked, onToggle, color }) => {
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
                className={`w-11 h-6 ${isChecked ? colors[color].bg : 'bg-gray-300'
                  } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-${colors[color].switch}-500 rounded-full transition-colors duration-150 ease-in-out`}
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
    }
  );

  // Reusable MotivationSelector Component
  const MotivationSelector = React.memo(({ level, onChange }) => {
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

  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:00 ${period}`;
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
  // **Helper Function to Calculate Hours Between Start and End**
  const calculateHours = (start, end) => {
    let hours = end - start;
    if (hours <= 0) {
      hours += 24; // Handle overnight
    }
    return hours;
  };
  // Reusable TimeRangeSelector Component
  const TimeRangeSelector = React.memo(({ selectedTimes, onTimeChange, maxHours, label }) => {
    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [isEndModalOpen, setIsEndModalOpen] = useState(false);
    const [startTime, setStartTime] = useState(
      selectedTimes.length > 0 && selectedTimes[0].start !== null ? selectedTimes[0].start : null
    );
    const [endTime, setEndTime] = useState(
      selectedTimes.length > 0 && selectedTimes[0].end !== null ? selectedTimes[0].end : null
    );

    useEffect(() => {
      if (selectedTimes.length > 0) {
        setStartTime(selectedTimes[0].start);
        setEndTime(selectedTimes[0].end);
      } else {
        setStartTime(null);
        setEndTime(null);
      }
    }, [selectedTimes]);

    const handleStartSelect = (hour) => {
      if (endTime !== null && hour >= endTime) {
        alert('Start time must be before end time.');
        return;
      }
      setStartTime(hour);
      onTimeChange([{ start: hour, end: endTime }]);
    };

    const handleEndSelect = (hour) => {
      if (startTime !== null && hour <= startTime) {
        alert('End time must be after start time.');
        return;
      }
      setEndTime(hour);
      onTimeChange([{ start: startTime, end: hour }]);
    };

    // **Reusable TimePickerModal Component**
    const TimePickerModal = React.memo(({ isOpen, onClose, onSelect, title, color }) => {
      if (!isOpen) return null;

      const hoursArray = Array.from({ length: 24 }, (_, i) => i);

      const handleSelect = (hour) => {
        onSelect(hour);
        onClose();
      };

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
            <div className="p-4 grid grid-cols-3 gap-3">
              {hoursArray.map((hour) => (
                <button
                  key={hour}
                  onClick={() => handleSelect(hour)}
                  className={`w-full py-3 bg-gray-100 rounded-md text-center text-lg font-medium text-gray-700 ${currentColor.hoverBg} ${currentColor.hoverText} transition-colors duration-150 ease-in-out`}
                  aria-label={`Select hour ${formatHour(hour)}`}
                >
                  {formatHour(hour)}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    });

    // **Helper Function to Format Hour**
    const formatHour = (hour) => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${formattedHour}:00 ${period}`;
    };

    // **Helper Function to Calculate Hours Between Start and End**
    const calculateHours = (start, end) => {
      let hours = end - start;
      if (hours <= 0) {
        hours += 24; // Handle overnight
      }
      return hours;
    };

    return (
      <div className="flex flex-col space-y-4">
        {/* Start and End Time Buttons Side by Side */}
        <div className="flex space-x-4">
          {/* Start Time Button */}
          <button
            onClick={() => setIsStartModalOpen(true)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium text-left focus:outline-none focus:ring-2 transition-colors duration-150 ease-in-out ${startTime !== null
                ? 'bg-green-500 text-white focus:ring-green-500'
                : 'bg-gray-100 border border-gray-300 text-gray-700 focus:ring-gray-300'
              }`}
            aria-label="Select Start Time"
          >
            {startTime !== null ? `Start: ${formatHour(startTime)}` : 'Start Time'}
          </button>

          {/* End Time Button */}
          <button
            onClick={() => setIsEndModalOpen(true)}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium text-left focus:outline-none focus:ring-2 transition-colors duration-150 ease-in-out ${endTime !== null
                ? 'bg-orange-500 text-white focus:ring-orange-500'
                : 'bg-gray-100 border border-gray-300 text-gray-700 focus:ring-gray-300'
              }`}
            aria-label="Select End Time"
          >
            {endTime !== null ? `End: ${formatHour(endTime)}` : 'End Time'}
          </button>
        </div>

        {/* TimePicker Modals */}
        <TimePickerModal
          isOpen={isStartModalOpen}
          onClose={() => setIsStartModalOpen(false)}
          onSelect={handleStartSelect}
          title="Select Start Time"
          color="start"
        />
        <TimePickerModal
          isOpen={isEndModalOpen}
          onClose={() => setIsEndModalOpen(false)}
          onSelect={handleEndSelect}
          title="Select End Time"
          color="end"
        />

        {/* Display Total Hours */}
        {/* <div className="text-center">
          <p className="text-lg font-semibold text-gray-800">
            {startTime !== null && endTime !== null
              ? `${calculateHours(startTime, endTime)}h`
              : 'Select Time'}
          </p>
        </div> */}
      </div>
    );
  });

  // Handle Work Time Changes from TimeRangeSelector
  const handleWorkTimeChange = useCallback(
    (newTimes) => {
      let total = 0;
      newTimes.forEach((range) => {
        if (range.start !== null && range.end !== null) {
          total += calculateHours(range.start, range.end);
        }
      });

      onDataChange(date, { hoursWorked: total, selectedWorkTimes: newTimes });
    },
    [onDataChange, date]
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
      total = Math.min(Math.max(total, 0), 12);
      onDataChange(date, { sleepHours: total, selectedSleepTimes: newTimes });
    },
    [onDataChange, date]
  );

  // Handle Motivation Level Change
  const handleMotivationLevelChange = useCallback(
    (level) => {
      setMotivationLevel(level);
      onDataChange(date, { motivationLevel: level });
    },
    [onDataChange, date]
  );

  // Handle Anxiety Level Change
  const handleAnxietyLevelChange = useCallback(
    (level) => {
      setAnxietyLevel(level);
      onDataChange(date, { anxietyLevel: level });
    },
    [onDataChange, date]
  );

  // Reset Function for Work Hours
  const resetWorkSelections = () => {
    setSelectedWorkTimes([]);
    onDataChange(date, { selectedWorkTimes: [], hoursWorked: 0 });
  };

  // Reset Function for Sleep Hours
  const resetSleepSelections = () => {
    setSelectedSleepTimes([]);
    onDataChange(date, { selectedSleepTimes: [], sleepHours: 0 });
  };

  // Main return statement with updated JSX
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
                  {selectedSleepTimes.length > 0 && selectedSleepTimes[0].start !== null && selectedSleepTimes[0].end !== null
                    ? `${calculateHours(selectedSleepTimes[0].start, selectedSleepTimes[0].end)}h`
                    : '0h'}
                </p>
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

          {/* Exercise */}
          <ToggleSwitch
            label="Did You Exercise?"
            Icon={FiActivity}
            isChecked={didExercise}
            onToggle={handleExerciseToggle}
            color="exercise"
          />

          {/* Anxiety Level */}
          <AnxietySelector level={anxietyLevel} onChange={handleAnxietyLevelChange} />
        </div>

        {/* Row 2: Motivation Level | Projects Won | Work Hours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Motivation Level */}
          <MotivationSelector level={motivationLevel} onChange={handleMotivationLevelChange} />

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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FiClock className="text-blue-500 w-6 h-6 transition-colors duration-150 ease-in-out" />
                <p className="text-lg font-medium text-gray-700">Work Hours</p>
                <p className="text-lg font-semibold text-gray-800">
                  {selectedWorkTimes.length > 0 && selectedWorkTimes[0].start !== null && selectedWorkTimes[0].end !== null
                    ? `${calculateHours(selectedWorkTimes[0].start, selectedWorkTimes[0].end)}h`
                    : '0h'}
                </p>
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
