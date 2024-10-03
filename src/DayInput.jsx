// DayInput.jsx
import React from 'react';
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

// React Icons for Start and End Times with Transitions
const StartIcon = () => (
  <FiChevronRight className="w-4 h-4 ml-1 text-green-600 transition-colors duration-150 ease-in-out" />
);

const EndIcon = () => (
  <FiChevronLeft className="w-4 h-4 mr-1 text-orange-600 transition-colors duration-150 ease-in-out" />
);

const DayInput = ({ onDataChange, record, date, onDateChange }) => {
  // Local state for inputs that need to be managed locally
  const [selectedTimes, setSelectedTimes] = React.useState(record.selectedTimes || []);

  const hoursArray = Array.from({ length: 24 }, (_, i) => i);

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

  const handleAmountChange = (value) => {
    const newValue = Math.max(value, 0);
    onDataChange(date, { earnings: newValue });
  };

  // For Sleep Hours
  const handleSleepChange = (value) => {
    const newValue = Math.min(Math.max(value, 0), 12);
    onDataChange(date, { sleepHours: newValue });
  };

  // For Workout Toggle
  const handleWorkoutToggle = () => {
    const newValue = !record.didWorkout;
    onDataChange(date, { didWorkout: newValue });
  };

  // Handle Time Click
  const handleTimeClick = (hour) => {
    setSelectedTimes((prevTimes) => {
      let newTimes;
      const index = prevTimes.indexOf(hour);
      if (index !== -1) {
        // If the hour is already selected, remove it
        newTimes = prevTimes.filter((time) => time !== hour).sort((a, b) => a - b);
      } else {
        // Add the new hour and sort the array
        newTimes = [...prevTimes, hour].sort((a, b) => a - b);
      }
      calculateHoursWorked(newTimes);
      onDataChange(date, { selectedTimes: newTimes });
      return newTimes;
    });
  };

  const calculateHoursWorked = (times) => {
    let total = 0;
    for (let i = 0; i < times.length; i += 2) {
      if (times[i + 1] !== undefined) {
        total += times[i + 1] - times[i];
      }
    }
    onDataChange(date, { hoursWorked: total });
  };

  const formatHour = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // Adjust getButtonStyle function with smoother transitions
  const getButtonStyle = (hour) => {
    const index = selectedTimes.indexOf(hour);
    if (index === -1)
      return 'bg-gray-100 text-gray-700 transition-colors duration-150 ease-in-out';
    if (index % 2 === 0)
      return 'bg-green-500 text-white transition-colors duration-150 ease-in-out';
    return 'bg-orange-500 text-white transition-colors duration-150 ease-in-out';
  };

  const getButtonContent = (hour) => {
    const index = selectedTimes.indexOf(hour);
    if (index === -1)
      return <span className="text-xs">{formatHour(hour)}</span>;
    if (index % 2 === 0)
      return (
        <div className="flex items-center justify-center transition-colors duration-150 ease-in-out">
          <span className="text-xs">{formatHour(hour)}</span>
          <StartIcon />
        </div>
      );
    return (
      <div className="flex items-center justify-center transition-colors duration-150 ease-in-out">
        <EndIcon />
        <span className="text-xs">{formatHour(hour)}</span>
      </div>
    );
  };

  const resetSelections = () => {
    setSelectedTimes([]);
    onDataChange(date, { selectedTimes: [], hoursWorked: 0 });
  };

  // Handle Project Count Change
  const handleProjectVisualClick = (value) => {
    const newValue = record.projectsCount === value ? 0 : value;
    onDataChange(date, { projectsCount: newValue });
  };

  return (
    <div className="mb-16 p-6 bg-white rounded-3xl shadow">
      {/* Date Picker with Navigation Arrows */}
      <div className="mb-6 flex justify-center items-center space-x-2">
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
          value={date.toISOString().split('T')[0]} // Format date as YYYY-MM-DD
          onChange={handleDateChange}
          className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700 transition-colors duration-150 ease-in-out"
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
      <div className="space-y-6">
        {/* Earnings */}
        <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
          <div className="flex items-center space-x-3 mb-2">
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

        {/* Sleep Hours */}
        <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
          <div className="flex items-center space-x-3 mb-2">
            <FiMoon className="text-blue-500 w-6 h-6 transition-colors duration-150 ease-in-out" />
            <p className="text-lg font-medium text-gray-700">Sleep Time</p>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => handleSleepChange((record.sleepHours || 8) - 1)}
              className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-150 ease-in-out transform hover:scale-105"
              aria-label="Decrease Sleep Hours"
            >
              <FiMinus className="w-4 h-4 text-gray-600 transition-colors duration-150 ease-in-out" />
            </button>
            <input
              type="number"
              value={record.sleepHours !== undefined ? record.sleepHours : 8}
              onChange={(e) => handleSleepChange(parseInt(e.target.value) || 0)}
              className="w-20 text-center text-xl font-semibold text-gray-800 border-b-2 border-blue-400 focus:outline-none focus:border-blue-500 transition-colors duration-150 ease-in-out"
            />
            <button
              onClick={() => handleSleepChange((record.sleepHours || 8) + 1)}
              className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-150 ease-in-out transform hover:scale-105"
              aria-label="Increase Sleep Hours"
            >
              <FiPlus className="w-4 h-4 text-gray-600 transition-colors duration-150 ease-in-out" />
            </button>
          </div>
        </div>

        {/* Workout Toggle with 'Yes' and 'No' Labels */}
        <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
          <div className="flex items-center space-x-3 mb-2">
            <FiActivity className="text-red-500 w-6 h-6 transition-colors duration-150 ease-in-out" />
            <p className="text-lg font-medium text-gray-700">Did You Exercise?</p>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <span className="text-gray-600">No</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={record.didWorkout || false}
                onChange={handleWorkoutToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:bg-green-500 transition-colors duration-150 ease-in-out"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-150 ease-in-out transform peer-checked:translate-x-5"></div>
            </label>
            <span className="text-gray-600">Yes</span>
          </div>
        </div>

        {/* Hours Worked and Time Selection */}
        <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <FiClock className="text-blue-500 w-6 h-6 transition-colors duration-150 ease-in-out" />
              <p className="text-lg font-medium text-gray-700">Work Hours</p>
            </div>
            <button
              onClick={resetSelections}
              className="text-sm text-blue-400 hover:text-blue-500 transition-colors duration-150 ease-in-out"
              aria-label="Reset Work Hours"
            >
              Reset
            </button>
          </div>
          <div className="mb-4">
            <p className="text-center text-xl font-semibold text-gray-800 transition-colors duration-150 ease-in-out">
              {record.hoursWorked || 0}h
            </p>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {hoursArray.map((hour) => (
              <button
                key={hour}
                onClick={() => handleTimeClick(hour)}
                className={`flex flex-col items-center justify-center p-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out ${
                  getButtonStyle(hour)
                } focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-105`}
                aria-label={`Select ${formatHour(hour)} as ${
                  selectedTimes.indexOf(hour) % 2 === 0 ? 'start' : 'end'
                } time`}
              >
                {getButtonContent(hour)}
              </button>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
          <div className="flex items-center space-x-3 mb-2">
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
      </div>

      {/* Custom Styles for Switch */}
      <style jsx>{`
        /* Custom Switch Styles */
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
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
          transition: background-color 0.4s ease-in-out;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: '';
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: transform 0.4s ease-in-out;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #10b981;
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        /* Responsive Adjustments */
        @media (max-width: 640px) {
          .switch {
            width: 44px;
            height: 20px;
          }

          .slider:before {
            height: 16px;
            width: 16px;
            left: 2px;
            bottom: 2px;
          }

          input:checked + .slider:before {
            transform: translateX(22px);
          }
        }
      `}</style>
    </div>
  );
};

export default DayInput;
