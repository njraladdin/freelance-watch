// src/MetricsDashboard.jsx
import React, { useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  FiClock,
  FiCreditCard,
  FiBarChart2,
  FiMoon,
  FiTarget,
  FiBriefcase,
} from 'react-icons/fi';

// Helper functions
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatHoursAndMinutes = (decimalHours) => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
};

const calculateAverage = (numbers) => {
  const validNumbers = numbers.filter((num) => num != null);
  return validNumbers.length ? validNumbers.reduce((acc, curr) => acc + curr, 0) / validNumbers.length : 0;
};

// DayActivityProgressBar Component
const DayActivityProgressBar = ({ sleepPercentage, workPercentage, otherPercentage }) => (
  <div className="w-full bg-gray-200 rounded-full h-3 flex overflow-hidden">
    <div className="h-full bg-blue-500" style={{ width: `${sleepPercentage}%` }}></div>
    <div className="h-full bg-green-500" style={{ width: `${workPercentage}%` }}></div>
    <div className="h-full bg-purple-500" style={{ width: `${otherPercentage}%` }}></div>
  </div>
);

DayActivityProgressBar.propTypes = {
  sleepPercentage: PropTypes.string.isRequired,
  workPercentage: PropTypes.string.isRequired,
  otherPercentage: PropTypes.string.isRequired,
};

// MetricCard Component
const MetricCard = ({ icon: Icon, title, value, subValue, color, compact }) => (
  <div
    className={`flex flex-col justify-between items-center bg-gray-50 p-4 rounded-lg transition-shadow duration-150 ease-in-out 
    ${compact ? 'h-32 w-32' : 'h-40 w-40'}`}
  >
    <Icon className={`w-5 h-5 text-${color}-500`} />
    <div className="flex flex-col items-center justify-center">
      <p className="text-lg font-semibold text-gray-800">{value}</p>
      {subValue && <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>}
    </div>
    <p className="text-sm font-medium text-gray-700 text-center">{title}</p>
  </div>
);

MetricCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subValue: PropTypes.string,
  color: PropTypes.string,
  compact: PropTypes.bool,
};

// Main MetricsDashboard Component
const MetricsDashboard = ({ selectedGoal, currentMonthRecords, selectedDate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update currentTime every minute for real-time metrics
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayKey = selectedDate.toISOString().split('T')[0];
  const todayRecord = currentMonthRecords[todayKey] || {};

  const {
    totalEarnings,
    averageHoursWorked,
    averageEarningsPerHour,
    averageEarningsPerDay,
    averageSleep,
    remainingDays,
    dailyPace,
  } = useMemo(() => {
    const today = new Date();
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const daysPassed = today.getDate();

    const records = Object.values(currentMonthRecords);
    const totalEarnings = records.reduce((sum, rec) => sum + (rec.earnings || 0), 0);
    const totalHoursWorked = records.reduce((sum, rec) => sum + (rec.hoursWorked || 0), 0);

    const averageHoursWorked = calculateAverage(records.map((rec) => rec.hoursWorked));
    const averageEarningsPerHour = totalHoursWorked ? totalEarnings / totalHoursWorked : 0;
    const averageEarningsPerDay = daysPassed ? totalEarnings / daysPassed : 0;
    const averageSleep = calculateAverage(records.map((rec) => rec.sleepHours).filter((s) => s > 0));

    const remainingDays = daysInMonth - daysPassed;
    const remainingGoal = selectedGoal - totalEarnings;
    const dailyPace = remainingDays > 0 ? remainingGoal / remainingDays : 0;

    return {
      totalEarnings,
      averageHoursWorked,
      averageEarningsPerHour,
      averageEarningsPerDay,
      averageSleep,
      remainingDays,
      dailyPace,
    };
  }, [selectedGoal, currentMonthRecords, selectedDate]);

  const {
    timeFromWakeUpUntilWork,
    hoursWorkedSoFar,
    sleepPercentage,
    workPercentage,
    otherPercentage,
  } = useMemo(() => {
    const {
      sleepEndTime,
      sleepHours = 0,
      workStartTime,
      workEndTime,
    } = todayRecord;

    let timeFromWakeUpUntilWork = 'N/A';
    let hoursWorkedSoFar = 'N/A';

    if (sleepEndTime != null) {
      const wakeUpTime = new Date(selectedDate);
      wakeUpTime.setHours(sleepEndTime, 0, 0, 0);

      if (workStartTime != null) {
        // Work start time is available
        const workStartDateTime = new Date(selectedDate);
        workStartDateTime.setHours(workStartTime, 0, 0, 0);

        const timeToWork = (workStartDateTime - wakeUpTime) / (1000 * 60 * 60);
        timeFromWakeUpUntilWork = formatHoursAndMinutes(timeToWork);
      } else {
        // No work start time, calculate time since wake up until now
        const timeSinceWakeUp = (currentTime - wakeUpTime) / (1000 * 60 * 60);

        if (timeSinceWakeUp > 24) {
          timeFromWakeUpUntilWork = 'N/A';
        } else {
          timeFromWakeUpUntilWork = formatHoursAndMinutes(timeSinceWakeUp);
        }
      }
    }

    // Calculate hours worked so far
    if (workStartTime != null) {
      const workStartDateTime = new Date(selectedDate);
      workStartDateTime.setHours(workStartTime, 0, 0, 0);

      let workEndDateTime;
      if (workEndTime != null) {
        workEndDateTime = new Date(selectedDate);
        workEndDateTime.setHours(workEndTime, 0, 0, 0);
      } else {
        workEndDateTime = currentTime;
      }

      if (workEndDateTime < workStartDateTime) {
        // If work end time is earlier than start time, assume it ends the next day
        workEndDateTime.setDate(workEndDateTime.getDate() + 1);
      }

      const workedTime = (workEndDateTime - workStartDateTime) / (1000 * 60 * 60);
      hoursWorkedSoFar = formatHoursAndMinutes(workedTime);
    }

    const workHours =
      hoursWorkedSoFar !== 'N/A' && hoursWorkedSoFar !== 'Not started'
        ? parseFloat(hoursWorkedSoFar.split('h')[0]) +
          (parseFloat(hoursWorkedSoFar.split(' ')[1].replace('m', '')) / 60)
        : 0;

    const otherHours = Math.max(0, 24 - sleepHours - workHours);

    const total = sleepHours + workHours + otherHours;
    const sleepPercentage = total ? ((sleepHours / total) * 100).toFixed(0) : '0';
    const workPercentage = total ? ((workHours / total) * 100).toFixed(0) : '0';
    const otherPercentage = total ? ((otherHours / total) * 100).toFixed(0) : '0';

    return {
      timeFromWakeUpUntilWork,
      hoursWorkedSoFar,
      sleepPercentage,
      workPercentage,
      otherPercentage,
    };
  }, [todayRecord, selectedDate, currentTime]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Today Overview Section */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 border-b pb-2 text-gray-600">Today</h2>
      <div className="bg-white pb-6 px-0 rounded-lg md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center lg:justify-items-start">
          <MetricCard
            icon={FiClock}
            title="Time from wakeup to work"
            value={timeFromWakeUpUntilWork}
            color="blue"
          />
          <MetricCard
            icon={FiBriefcase}
            title="Hours Worked So Far"
            value={hoursWorkedSoFar}
            color="green"
          />
          <div className="flex flex-col space-y-4 bg-gray-50 p-5 rounded-lg shadow-inner col-span-2 lg:col-span-1 w-full">
            <div className="flex items-center space-x-2">
              <FiBarChart2 className="text-purple-500 w-6 h-6" />
              <p className="text-sm text-gray-500 text-center">Day Activity</p>
            </div>
            <DayActivityProgressBar
              sleepPercentage={sleepPercentage}
              workPercentage={workPercentage}
              otherPercentage={otherPercentage}
            />
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                Sleep {sleepPercentage}%
              </span>
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                Work {workPercentage}%
              </span>
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-1"></span>
                Other {otherPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Month Overview Section */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 border-b pb-2 text-gray-600">
        Overview -{' '}
        {new Date().toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        })}
      </h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <p className="text-3xl font-bold text-gray-800">{formatCurrency(totalEarnings)}</p>
            <p className="text-sm text-gray-500">Total Earnings</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">{formatCurrency(selectedGoal)}</p>
            <p className="text-sm text-gray-500">Selected Goal</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 rounded-full h-2 transition-all duration-300 ease-in-out"
            style={{ width: `${Math.min((totalEarnings / selectedGoal) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Metric Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center md:justify-items-start">
        <MetricCard
          icon={FiClock}
          title="Avg Earnings per Hour"
          value={formatCurrency(averageEarningsPerHour)}
          subValue="per hour"
          color="green"
        />
        <MetricCard
          icon={FiCreditCard}
          title="Avg Earnings per Day"
          value={formatCurrency(averageEarningsPerDay)}
          subValue="per day"
          color="indigo"
        />
        <MetricCard
          icon={FiBarChart2}
          title="Avg Hours Worked"
          value={`${averageHoursWorked.toFixed(1)} hrs`}
          subValue="per day"
          color="yellow"
        />
        <MetricCard
          icon={FiMoon}
          title="Avg Sleep"
          value={`${averageSleep.toFixed(1)} hrs`}
          subValue="per day"
          color="blue"
        />
      </div>

      {/* Next Step Section */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
        <div className="flex items-center space-x-3 mb-4">
          <FiTarget className="text-orange-500 w-5 h-5" />
          <h2 className="text-lg font-bold text-gray-800">Next Step</h2>
        </div>
        <p className="text-base text-gray-700">
          Earn{' '}
          <span className="font-bold text-orange-600">{formatCurrency(dailyPace)}</span> daily
          for the next{' '}
          <span className="font-bold text-orange-600">{remainingDays} days</span> to hit your goal.
        </p>
      </div>
    </div>
  );
};

MetricsDashboard.propTypes = {
  selectedGoal: PropTypes.number.isRequired,
  currentMonthRecords: PropTypes.object.isRequired,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
};

export default MetricsDashboard;
