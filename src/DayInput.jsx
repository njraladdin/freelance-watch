// DayInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const DayInput = ({ onAddEarnings }) => {
  // Earnings Input States
  const [amount, setAmount] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonTextRef = useRef(null);
  const buttonAmountRef = useRef(null);
  const checkmarkRef = useRef(null);

  // Time Input States
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [hoursWorked, setHoursWorked] = useState(0);

  // New State for Sleep Hours
  const [sleepHours, setSleepHours] = useState(7); // Default to 7 hours

  // New State for Workout
  const [didWorkout, setDidWorkout] = useState(false); // Default to 'No'

  const hours = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    calculateHoursWorked();
  }, [selectedTimes]);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleTimeClick = (hour) => {
    setSelectedTimes((prevTimes) => {
      const index = prevTimes.indexOf(hour);
      if (index !== -1) {
        // If the hour is already selected, remove it
        return prevTimes.filter((time) => time !== hour).sort((a, b) => a - b);
      } else {
        // Add the new hour and sort the array
        return [...prevTimes, hour].sort((a, b) => a - b);
      }
    });
  };

  const calculateHoursWorked = () => {
    let total = 0;
    for (let i = 0; i < selectedTimes.length; i += 2) {
      if (selectedTimes[i + 1] !== undefined) {
        total += selectedTimes[i + 1] - selectedTimes[i];
      }
    }
    setHoursWorked(total);
  };

  const formatHour = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  // Color Palette
  const colors = {
    green: 'green-500',        // Primary Green
    lightGreen: 'green-300',   // Light Green for Start Time
    orange: 'orange-500',      // Orange for End Time
    lightOrange: 'yellow-400', // Light Orange for End Time
    gray: 'gray-100',          // Light Gray for Unselected Times
    darkGray: 'gray-800',      // Dark Gray for Text
    blue: 'blue-400',          // Blue for Accents
  };

  const getButtonStyle = (hour) => {
    const index = selectedTimes.indexOf(hour);
    if (index === -1) return `bg-${colors.gray} text-${colors.darkGray} hover:bg-${colors.lightGreen}`;
    if (index % 2 === 0) return `bg-${colors.green} text-white`; // Start time
    return `bg-${colors.orange} text-white`; // End time
  };

  const getButtonContent = (hour) => {
    const index = selectedTimes.indexOf(hour);
    if (index === -1) return formatHour(hour);
    if (index % 2 === 0)
      return (
        <div className="flex items-center justify-center">
          {formatHour(hour)}
          <StartIcon />
        </div>
      ); // Start time
    return (
      <div className="flex items-center justify-center">
        <EndIcon />
        {formatHour(hour)}
      </div>
    ); // End time
  };

  const resetSelections = () => {
    setSelectedTimes([]);
    setHoursWorked(0);
    setDidWorkout(false); // Reset workout toggle
  };

  const toggleTimeInput = () => {
    setShowTimeInput(!showTimeInput);
  };

  const animateValue = (start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      buttonAmountRef.current.textContent = '$' + (progress * (end - start) + start).toFixed(2);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (!isNaN(parsedAmount)) {
      setIsAnimating(true);

      // Button animation
      buttonTextRef.current.classList.add('opacity-0');

      setTimeout(() => {
        buttonAmountRef.current.classList.remove('opacity-0');
        animateValue(0, parsedAmount, 2000);
      }, 300);

      setTimeout(() => {
        buttonAmountRef.current.classList.add('opacity-0');
      }, 2500);

      setTimeout(() => {
        checkmarkRef.current.classList.remove('opacity-0');
      }, 2800);

      setTimeout(() => {
        checkmarkRef.current.classList.add('opacity-0');
      }, 3800);

      setTimeout(() => {
        buttonTextRef.current.classList.remove('opacity-0');
        setIsAnimating(false);
      }, 4100);

      // Pass amount, hoursWorked, sleepHours, and didWorkout to the parent component
      onAddEarnings(parsedAmount, hoursWorked, sleepHours, didWorkout);

      // Reset Inputs
      setAmount('');
      resetSelections();
    }
  };

  // Handle Sleep Hours Change
  const handleSleepChange = (e) => {
    setSleepHours(parseInt(e.target.value));
  };

  // Handle Workout Toggle
  const handleWorkoutToggle = () => {
    setDidWorkout(!didWorkout);
  };

  return (
    <div className="relative mb-8 p-6 bg-white rounded-xl shadow-lg">
      {/* Reset Button for Time Inputs */}
      {showTimeInput && (
        <button
          onClick={resetSelections}
          className="absolute top-4 right-4 text-blue-500 text-sm hover:underline focus:outline-none"
          aria-label="Reset Selections"
        >
          Reset
        </button>
      )}

      {/* Earnings Input and Submit Button */}
      <div className="flex flex-col items-center space-y-6">
        {/* Earnings Input */}
        <div className="w-full">
          <h2 className="text-lg font-semibold mb-3 text-center text-gray-600">Add Today's Earnings</h2>
          <div className="flex justify-center items-center">
            <div className="relative w-48">
              <span className="absolute left-3 top-2 text-gray-400 text-lg">$</span>
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                onClick={toggleTimeInput} // Added onClick handler
                className="w-full pl-8 pr-3 py-2 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="0.00"
                step="0.01"
                aria-label="Earnings Amount"
              />
            </div>
          </div>
        </div>

        {/* Time Input and Sleep Hours Slider Section */}
        <div
          className={`w-full transition-all duration-300 ease-in-out transform ${
            showTimeInput
              ? 'max-h-screen opacity-100 translate-y-0'
              : 'max-h-0 opacity-0 overflow-hidden -translate-y-2'
          }`}
        >
          {/* Hours Worked Display */}
          <div className="mb-5 text-center">
            <p className="text-4xl font-bold text-gray-800">{hoursWorked}</p>
            <p className="text-sm text-gray-500">Hours Worked</p>
          </div>

          {/* Time Input Grid */}
          <div className="rounded-lg shadow-sm p-4 mb-6 bg-gray-50">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {hours.map((hour) => (
                <button
                  key={hour}
                  onClick={() => handleTimeClick(hour)}
                  className={`group relative flex items-center justify-center text-center py-2 px-3 text-sm font-medium transition-colors duration-150 ease-in-out rounded-lg ${getButtonStyle(
                    hour
                  )} transform-gpu focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                  aria-label={`Select ${formatHour(hour)} as ${
                    selectedTimes.indexOf(hour) % 2 === 0 ? 'start' : 'end'
                  } time`}
                >
                  {getButtonContent(hour)}
                  {/* Tooltip */}
                  {selectedTimes.includes(hour) && (
                    <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black text-white text-xs rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      {selectedTimes.indexOf(hour) % 2 === 0 ? 'Start Time' : 'End Time'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Styled Sleep Hours Slider */}
          <div className="w-full mb-6">
            <h3 className="text-md font-medium mb-3 text-center text-gray-600">Hours of Sleep</h3>
            <div className="flex flex-col items-center">
              <div className="relative w-3/4">
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={sleepHours}
                  onChange={handleSleepChange}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Sleep Hours Slider"
                />
                {/* Custom Thumb */}
                <style jsx>{`
                  input[type='range']::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: white;
                    border: 2px solid #10B981; /* Tailwind green-500 */
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
                    transition: background 0.3s ease;
                  }

                  input[type='range']::-webkit-slider-thumb:hover {
                    background: #f0fdf4; /* Tailwind green-50 */
                  }

                  input[type='range']::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    background: white;
                    border: 2px solid #10B981;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
                    transition: background 0.3s ease;
                  }

                  input[type='range']::-moz-range-thumb:hover {
                    background: #f0fdf4;
                  }

                  input[type='range']::-ms-thumb {
                    width: 20px;
                    height: 20px;
                    background: white;
                    border: 2px solid #10B981;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
                    transition: background 0.3s ease;
                  }

                  input[type='range']::-ms-thumb:hover {
                    background: #f0fdf4;
                  }
                `}</style>
                <div className="flex justify-between mt-2 px-1">
                  {Array.from({ length: 12 }, (_, i) => (
                    <span key={i} className="text-xs text-gray-500">
                      {i + 1}h
                    </span>
                  ))}
                </div>
                <div className="text-center mt-2 text-sm text-gray-700">
                  {sleepHours} {sleepHours === 1 ? 'hour' : 'hours'}
                </div>
              </div>
            </div>
          </div>

          {/* Workout Toggle Switch */}
          <div className="w-full mb-6">
            <h3 className="text-md font-medium mb-3 text-center text-gray-600">Did You Work Out / Walk?</h3>
            <div className="flex justify-center items-center">
              <label htmlFor="workout-toggle" className="flex items-center cursor-pointer">
                {/* Labels */}
                <span className={`mr-2 text-gray-500 ${didWorkout ? 'opacity-50' : 'opacity-100'}`}>No</span>
                {/* Hidden Checkbox */}
                <input
                  type="checkbox"
                  id="workout-toggle"
                  className="sr-only"
                  checked={didWorkout}
                  onChange={handleWorkoutToggle}
                />
                {/* Toggle */}
                <div className="relative">
                  <div className="block bg-gray-200 w-12 h-6 rounded-full"></div>
                  <div
                    className={`absolute left-0 top-0 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 ${
                      didWorkout ? 'transform translate-x-6 bg-green-500' : ''
                    }`}
                  ></div>
                </div>
                {/* Labels */}
                <span className={`ml-2 text-gray-500 ${didWorkout ? 'opacity-100' : 'opacity-50'}`}>Yes</span>
              </label>
            </div>
          </div>
        </div>

        {/* Toggle Arrow Button Positioned Below Time Input */}
        <button
          onClick={toggleTimeInput}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Toggle time input"
        >
          <FiChevronDown
            className={`h-6 w-6 transition-transform duration-300 ${showTimeInput ? 'transform rotate-180' : ''}`}
          />
        </button>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isAnimating}
          className="relative overflow-hidden bg-green-500 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 w-40 h-12"
        >
          <span ref={buttonTextRef} className="button-content absolute inset-0 flex items-center justify-center transition-opacity duration-300">
            Submit
          </span>
          <span ref={buttonAmountRef} className="button-content absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300">
            $0.00
          </span>
          <span ref={checkmarkRef} className="button-content absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="11" fill="#10B981" />
              <path d="M7 13l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default DayInput;
