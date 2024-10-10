// src/DayInput.jsx
import React, { useState } from 'react';
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

// TimePickerModal Component
const TimePickerModal = React.memo(({ isOpen, onClose, onSelect, onReset, title, color }) => {
  if (!isOpen) return null;

  const hoursArray = Array.from({ length: 24 }, (_, i) => i);
  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:00 ${period}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-sm">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className={`text-lg font-semibold text-${color}-500`}>{title}</h2>
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
              onClick={() => onSelect(hour)}
              className={`w-full py-3 bg-gray-100 rounded-md text-center text-lg font-medium text-gray-700 hover:bg-${color}-500 hover:text-white`}
              aria-label={`Select hour ${formatHour(hour)}`}
            >
              {formatHour(hour)}
            </button>
          ))}
        </div>

        <div className="flex justify-center p-4">
          <button
            onClick={onReset}
            className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            aria-label="Reset Selection"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
});

// ToggleSwitch Component
const ToggleSwitch = React.memo(({ label, Icon, isChecked, onToggle, color }) => (
  <div className="flex flex-col bg-gray-50 p-5 rounded-lg shadow-inner">
    <div className={`flex items-center space-x-3 mb-3 text-${color}-500`}>
      <Icon className="w-6 h-6" />
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
          className={`w-11 h-6 ${
            isChecked ? `bg-${color}-500` : 'bg-gray-300'
          } rounded-full`}
        ></div>
        <div
          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            isChecked ? 'transform translate-x-5' : ''
          }`}
        ></div>
      </label>
      <span className="text-gray-600">Yes</span>
    </div>
  </div>
));

// LevelSelector Component
const LevelSelector = React.memo(({ level, onChange, label, Icon, color }) => {
  const maxLevel = 5;

  return (
    <div className="flex flex-col bg-gray-50 p-5 rounded-lg shadow-inner">
      <div className={`flex items-center space-x-3 mb-3 text-${color}-500`}>
        <Icon className="w-8 h-8" />
        <p className="text-lg font-medium text-gray-700">{label}</p>
      </div>
      <div className="flex items-center justify-center space-x-2">
        {Array.from({ length: maxLevel }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1 === level ? 0 : i + 1)}
            className="focus:outline-none"
            aria-label={`Set ${label.toLowerCase()} to ${i + 1}`}
          >
            <Icon
              className={`w-8 h-8 ${
                i < level ? `text-${color}-500` : 'text-gray-300'
              } hover:text-${color}-400`}
            />
          </button>
        ))}
      </div>
    </div>
  );
});

// TimeSelector Component
const TimeSelector = React.memo(({ startTime, endTime, onTimeChange, label, color }) => {
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);

  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:00 ${period}`;
  };

  const handleSelect = (type, hour) => {

    onTimeChange(type === 'start' ? hour : startTime, type === 'end' ? hour : endTime);
    type === 'start' ? setIsStartModalOpen(false) : setIsEndModalOpen(false);
  };

  const handleReset = () => {
    onTimeChange(null, null);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-4">
        {['start', 'end'].map((type) => (
          <button
            key={type}
            onClick={() =>
              type === 'start' ? setIsStartModalOpen(true) : setIsEndModalOpen(true)
            }
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium text-left ${
              (type === 'start' ? startTime : endTime) !== null
                ? `bg-${type === 'start' ? 'green' : 'orange'}-500 text-white`
                : 'bg-gray-100 border border-gray-300 text-gray-700'
            }`}
            aria-label={`Select ${type} time`}
          >
            {(type === 'start' ? startTime : endTime) !== null
              ? `${type.charAt(0).toUpperCase() + type.slice(1)}: ${formatHour(
                  type === 'start' ? startTime : endTime
                )}`
              : `${type.charAt(0).toUpperCase() + type.slice(1)} Time`}
          </button>
        ))}
      </div>

      <TimePickerModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onSelect={(hour) => handleSelect('start', hour)}
        onReset={handleReset}
        title={`Select ${label} Start Time`}
        color="green"
      />
      <TimePickerModal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        onSelect={(hour) => handleSelect('end', hour)}
        onReset={handleReset}
        title={`Select ${label} End Time`}
        color="orange"
      />
    </div>
  );
});

const DayInput = React.memo(({ onDataChange, record, date, onDateChange }) => {
  const [workStartTime, setWorkStartTime] = useState(record.workStartTime || null);
  const [workEndTime, setWorkEndTime] = useState(record.workEndTime || null);
  const [sleepStartTime, setSleepStartTime] = useState(record.sleepStartTime || null);
  const [sleepEndTime, setSleepEndTime] = useState(record.sleepEndTime || null);
  const [didExercise, setDidExercise] = useState(record.didExercise || false);
  const [motivationLevel, setMotivationLevel] = useState(record.motivationLevel || 0);
  const [anxietyLevel, setAnxietyLevel] = useState(record.anxietyLevel || 0);
  const [workBreak, setWorkBreak] = useState(
    record.workBreak || { isActive: false, startTime: null, total: 0 }
  );

  const handleDateChange = (newDate) => {
    onDateChange(newDate);
  };

  const handleDayChange = (days) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    onDateChange(newDate);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow =
    date.toDateString() === new Date(today.getTime() + 86400000).toDateString();

  const minDate = today;
  const maxDate = new Date(today.getTime() + 86400000);

  const handleAmountChange = (value) => {
    onDataChange(date, { earnings: Math.max(value, 0) });
  };

  const handleExerciseToggle = () => {
    const newValue = !didExercise;
    setDidExercise(newValue);
    onDataChange(date, { didExercise: newValue });
  };

  const handleProjectVisualClick = (value) => {
    const newValue = record.projectsCount === value ? 0 : value;
    onDataChange(date, { projectsCount: newValue });
  };

  const calculateHours = (start, end) => {
    let hours = end - start;
    if (hours <= 0) hours += 24;
    return hours;
  };

  const handleTimeChange = (type, start, end) => {
    if (type === 'work') {
      setWorkStartTime(start);
      setWorkEndTime(end);
      let total = 0;
      if (start !== null && end !== null) {
        total = calculateHours(start, end);
      }
      const breakHours = workBreak.total / 3600;
      const adjustedHours = Math.max(0, total - breakHours);
      onDataChange(date, {
        workStartTime: start,
        workEndTime: end,
        hoursWorked: adjustedHours,
      });
    } else {
      setSleepStartTime(start);
      setSleepEndTime(end);
      let total = 0;
      if (start !== null && end !== null) {
        total = calculateHours(start, end);
      }
      onDataChange(date, {
        sleepStartTime: start,
        sleepEndTime: end,
        sleepHours: total,
      });
    }
  };

  const handleBreakToggle = () => {
    if (workBreak.isActive) {
      const endTime = Date.now();
      const elapsed = Math.floor((endTime - workBreak.startTime) / 1000);
      const newTotalBreak = workBreak.total + elapsed;

      setWorkBreak({ isActive: false, startTime: null, total: newTotalBreak });

      let totalWorkHours = 0;
      if (workStartTime !== null && workEndTime !== null) {
        totalWorkHours = calculateHours(workStartTime, workEndTime);
      }
      const breakHours = newTotalBreak / 3600;
      const adjustedHours = Math.max(0, totalWorkHours - breakHours);
      onDataChange(date, {
        workBreak: { isActive: false, startTime: null, total: newTotalBreak },
        hoursWorked: adjustedHours,
      });
    } else {
      const startTime = Date.now();
      setWorkBreak({ isActive: true, startTime, total: workBreak.total });
      onDataChange(date, {
        workBreak: { isActive: true, startTime, total: workBreak.total },
      });
    }
  };

  const formatHoursWorked = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-8">
      {/* Date Picker with Navigation Arrows */}
      <div className="flex flex-col items-center space-y-2">
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => handleDayChange(-1)}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
            aria-label="Previous Day"
          >
            <FiChevronLeft className="w-5 h-5 text-gray-600 hover:scale-110" />
          </button>
          <DatePicker
            selected={date}
            onChange={handleDateChange}
            dateFormat="dd/MMMM/yyyy"
            minDate={minDate}
            maxDate={maxDate}
            className="w-48 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
            aria-label="Select Date"
          />
          <button
            onClick={() => handleDayChange(1)}
            className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 ${
              date >= maxDate ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Next Day"
            disabled={date >= maxDate}
          >
            <FiChevronRight className="w-5 h-5 hover:scale-110" />
          </button>
        </div>
        <div className="text-center">
          {isToday && <span className="text-green-500 font-medium">Today</span>}
          {isTomorrow && (
            <span className="text-blue-500 font-medium">Tomorrow</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Row 1: Sleep Time | Exercise | Anxiety Level */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sleep Time */}
          <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <FiMoon className="text-orange-500 w-6 h-6" />
                <p className="text-lg font-medium text-gray-700">Sleep Time</p>
                <p className="text-lg font-semibold text-gray-800">
                  {sleepStartTime !== null && sleepEndTime !== null
                    ? `${calculateHours(sleepStartTime, sleepEndTime)}h`
                    : '0h'}
                </p>
              </div>
            </div>
            <TimeSelector
              startTime={sleepStartTime}
              endTime={sleepEndTime}
              onTimeChange={(start, end) => handleTimeChange('sleep', start, end)}
              label="Sleep"
              color="orange"
            />
          </div>

          {/* Exercise */}
          <ToggleSwitch
            label="Did You Exercise?"
            Icon={FiActivity}
            isChecked={didExercise}
            onToggle={handleExerciseToggle}
            color="red"
          />

          {/* Anxiety Level */}
          <LevelSelector
            level={anxietyLevel}
            onChange={(level) => {
              setAnxietyLevel(level);
              onDataChange(date, { anxietyLevel: level });
            }}
            label="Anxiety Level"
            Icon={AiOutlineFrown}
            color="blue"
          />
        </div>

        {/* Row 2: Motivation Level | Projects Won | Work Hours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Motivation Level */}
          <LevelSelector
            level={motivationLevel}
            onChange={(level) => {
              setMotivationLevel(level);
              onDataChange(date, { motivationLevel: level });
            }}
            label="Motivation Level"
            Icon={FaFire}
            color="yellow"
          />

          {/* Projects Won */}
          <div className="flex flex-col bg-gray-50 p-5 rounded-lg shadow-inner">
            <div className="flex items-center space-x-3 mb-3">
              <FiBriefcase className="text-purple-500 w-6 h-6" />
              <p className="text-lg font-medium text-gray-700">Projects Won</p>
            </div>
            <div className="flex justify-center space-x-2">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleProjectVisualClick(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    (record.projectsCount || 0) >= i + 1
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  aria-label={`Set projects count to ${i + 1}`}
                >
                  {(record.projectsCount || 0) >= i + 1 ? (
                    <FiBriefcase className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{i + 1}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Work Hours */}
          <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-inner">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <FiClock className="text-blue-500 w-6 h-6" />
                  <p className="text-lg font-medium text-gray-700">Work Hours</p>
                  <p className="text-sm font-semibold text-gray-800 ">
                    {formatHoursWorked(record.hoursWorked || 0)}
                  </p>
                </div>
                <button
                  onClick={handleBreakToggle}
                  disabled={!workStartTime}
                  className={`hidden md:flex items-center px-3 py-1 rounded-md ${
                    workBreak.isActive
                      ? 'bg-red-200 text-red-800'
                      : 'bg-blue-200 text-blue-800'
                  } ${!workStartTime ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Toggle Break"
                  title={!workStartTime ? 'Set a start time first to start a break' : ''}
                >
                  {workBreak.isActive ? (
                    <>
                      <FiPause className="w-5 h-5 mr-2" />
                      <span className="whitespace-nowrap">
                        Stop{' '}
                        <span className="text-xs">
                          ({Math.floor(workBreak.total / 60)}m)
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <FiPlay className="w-5 h-5 mr-2" />
                      <span>Break</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <TimeSelector
              startTime={workStartTime}
              endTime={workEndTime}
              onTimeChange={(start, end) => handleTimeChange('work', start, end)}
              label="Work"
              color="blue"
            />

            <button
              onClick={handleBreakToggle}
              disabled={!workStartTime}
              className={`flex md:hidden items-center px-3 py-3 rounded-md mt-6 ${
                workBreak.isActive
                  ? 'bg-red-200 text-red-800'
                  : 'bg-blue-200 text-blue-800'
              } ${!workStartTime ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Toggle Break"
              title={!workStartTime ? 'Set a start time first to start a break' : ''}
            >
              {workBreak.isActive ? (
                <>
                  <FiPause className="w-5 h-5 mr-2" />
                  <span>
                    Stop Break{' '}
                    <span className="text-sm">
                      ({Math.floor(workBreak.total / 60)}m)
                    </span>
                  </span>
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
        <div className="flex flex-col bg-gray-50 p-5 rounded-lg shadow-inner">
          <div className="flex items-center space-x-3 mb-3">
            <FiDollarSign className="text-green-500 w-6 h-6" />
            <p className="text-lg font-medium text-gray-700">Money Earned</p>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => handleAmountChange((record.earnings || 0) - 10)}
              className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transform hover:scale-105"
              aria-label="Decrease Earnings"
            >
              <FiMinus className="w-4 h-4 text-gray-600" />
            </button>
            <input
              type="number"
              value={record.earnings || 0}
              onChange={(e) =>
                handleAmountChange(parseFloat(e.target.value) || 0)
              }
              className="w-24 text-center text-xl font-semibold text-gray-800 border-b-2 border-green-400 focus:outline-none focus:border-green-500"
              aria-label="Earnings Amount"
            />
            <button
              onClick={() => handleAmountChange((record.earnings || 0) + 10)}
              className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transform hover:scale-105"
              aria-label="Increase Earnings"
            >
              <FiPlus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DayInput;
