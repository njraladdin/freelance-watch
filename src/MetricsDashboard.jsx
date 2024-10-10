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
import {
  FaBed,
  FaLaptop,
  FaQuestion,
  FaUserClock,
} from 'react-icons/fa'; // Imported new icons


const DayActivityProgressBar = ({
  sleepPercentage,
  workPercentage,
  otherPercentage,
  availablePercentage,
  extraAvailablePercentage, // New
}) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 flex overflow-hidden relative">
      <div
        className="h-full bg-blue-500"
        style={{ width: `${sleepPercentage}%` }}
        title={`Sleep: ${roundHours((sleepPercentage / 100) * 24)}h`}
      ></div>
      <div
        className="h-full bg-green-500"
        style={{ width: `${workPercentage}%` }}
        title={`Work: ${roundHours((workPercentage / 100) * 24)}h`}
      ></div>
      <div
        className="h-full bg-yellow-500"
        style={{ width: `${otherPercentage}%` }}
        title={`Other: ${roundHours((otherPercentage / 100) * 24)}h`}
      ></div>
      <div
        className="h-full bg-gray-300"
        style={{ width: `${availablePercentage}%` }}
        title={`Available: ${roundHours((availablePercentage / 100) * 24)}h`}
      ></div>
      {extraAvailablePercentage > 0 && (
        <div
          className="h-full bg-red-500 absolute top-0 left-full"
          style={{ width: `${extraAvailablePercentage}%` }}
          title={`Extra Available: ${roundHours((extraAvailablePercentage / 100) * 24)}h`}
        ></div>
      )}
    </div>
  );
};

DayActivityProgressBar.propTypes = {
  sleepPercentage: PropTypes.number.isRequired,
  workPercentage: PropTypes.number.isRequired,
  otherPercentage: PropTypes.number.isRequired,
  availablePercentage: PropTypes.number.isRequired,
  extraAvailablePercentage: PropTypes.number, // New
};
// Helper functions
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatHoursAndMinutes = (decimalHours) => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
};

const roundHours = (decimalHours) => {
  return decimalHours > 0 ? Math.round(decimalHours) : 0;
};

const calculateAverage = (numbers) => {
  const validNumbers = numbers.filter((num) => num != null);
  return validNumbers.length
    ? validNumbers.reduce((acc, curr) => acc + curr, 0) / validNumbers.length
    : 0;
};

const mapHoursToActivities = (selectedDate, todayRecord, currentTime) => {
  const activities = Array(24).fill('Available');

  const { sleepStartTime, sleepEndTime, workStartTime, workEndTime } = todayRecord;

  const isHourInRange = (hour, start, end) => {
    if (start == null || end == null) return false;
    if (start <= end) {
      return hour >= start && hour < end;
    } else {
      return hour >= start || hour < end;
    }
  };

  const now = currentTime;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDate = now.getDate();
  const isToday = selectedDate.getDate() === currentDate;

  if (sleepStartTime != null && sleepEndTime != null) {
    for (let hour = 0; hour < 24; hour++) {
      if (isHourInRange(hour, sleepStartTime, sleepEndTime)) {
        activities[hour] = 'Sleep';
      }
    }
  }

  if (workStartTime != null && workEndTime != null) {
    for (let hour = 0; hour < 24; hour++) {
      if (isHourInRange(hour, workStartTime, workEndTime)) {
        activities[hour] = 'Work';
      }
    }
  }

  for (let hour = 0; hour < 24; hour++) {
    // For past days, no time should be available
    if (!isToday) {
      if (activities[hour] === 'Available') {
        activities[hour] = 'Other';
      }
    } else {
      // For today, mark past hours that are still "Available" as "Other"
      if (hour < currentHour || (hour === currentHour && currentMinute > 0)) {
        if (activities[hour] === 'Available') {
          activities[hour] = 'Other';
        }
      }
    }
  }

  return activities;
};


// DayActivityProgressBar Component (imported separately)

const MetricCard = ({ icon: Icon, title, value, subValue, color }) => (
  <div className="flex flex-col bg-white shadow-md p-4 rounded-lg w-full">
    <div className="flex items-center mb-2">
      <Icon className={`w-6 h-6 text-${color}-500`} />
      <h3 className="ml-2 text-lg font-semibold text-gray-700">{title}</h3>
    </div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    {subValue && <p className="text-sm text-gray-500">{subValue}</p>}
  </div>
);

MetricCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subValue: PropTypes.string,
  color: PropTypes.string,
};

// Main MetricsDashboard Component
const MetricsDashboard = ({ selectedGoal, currentMonthRecords, selectedDate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayKey = selectedDate.toISOString().split('T')[0];
  const todayRecord = currentMonthRecords[todayKey] || {};

  const activities = useMemo(() => {
    return mapHoursToActivities(selectedDate, todayRecord, currentTime);
  }, [todayRecord, selectedDate, currentTime]);

  const {
    sleepHours,
    workHours,
    otherHours,
    availableHours,
    sleepPercentage,
    workPercentage,
    otherPercentage,
    availablePercentage,
    extraAvailableHours,
    extraAvailablePercentage,
  } = useMemo(() => {
    const sleepHours = activities.filter((a) => a === 'Sleep').length;
    const workHours = activities.filter((a) => a === 'Work').length;
    const otherHours = activities.filter((a) => a === 'Other').length;
    const availableHours = activities.filter((a) => a === 'Available').length;

    const sleepPercentage = (sleepHours / 24) * 100;
    const workPercentage = (workHours / 24) * 100;
    const otherPercentage = (otherHours / 24) * 100;
    const availablePercentage = (availableHours / 24) * 100;

    let extraAvailableHours = 0;
    let extraAvailablePercentage = 0;
    
    const { sleepStartTime, workStartTime, workEndTime } = todayRecord;
    
    if (sleepStartTime != null && workStartTime != null) {
      const sleepStartDateTime = new Date(selectedDate);
      sleepStartDateTime.setHours(sleepStartTime, 0, 0, 0);
    
      const dayEndDateTime = new Date(sleepStartDateTime.getTime() + 24 * 60 * 60 * 1000);
    
      if (currentTime > dayEndDateTime) {
        const extraTimeMs = currentTime - dayEndDateTime;
        extraAvailableHours = extraTimeMs / (1000 * 60 * 60);
        extraAvailableHours = Math.max(0, extraAvailableHours);
    
        // Additional checks based on work end time
        if (workEndTime != null) {
          const workEndDateTime = new Date(selectedDate);
          workEndDateTime.setHours(workEndTime, 0, 0, 0);
    
          // If workEndTime is before dayEndDateTime, we need to adjust the date
          if (workEndDateTime < sleepStartDateTime) {
            workEndDateTime.setDate(workEndDateTime.getDate() + 1);
          }
    
          if (workEndDateTime < dayEndDateTime) {
            // Work ended before the 24-hour period ended
            extraAvailableHours = (currentTime - dayEndDateTime) / (1000 * 60 * 60);
          } else {
            // Work ended after the 24-hour period
            extraAvailableHours = (currentTime - workEndDateTime) / (1000 * 60 * 60);
          }
        } else {
          // Work end time is not set
          extraAvailableHours = (currentTime - dayEndDateTime) / (1000 * 60 * 60);
        }
    
        extraAvailableHours = Math.max(0, extraAvailableHours);
        extraAvailablePercentage = (extraAvailableHours / 24) * 100;
      }
    }
    
    return {
      sleepHours,
      workHours,
      otherHours,
      availableHours,
      sleepPercentage,
      workPercentage,
      otherPercentage,
      availablePercentage,
      extraAvailableHours,
      extraAvailablePercentage,
    };
  }, [activities, todayRecord, selectedDate, currentTime]);

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

  const { timeFromWakeUpUntilWork, hoursWorkedSoFar } = useMemo(() => {
    let timeFromWakeUpUntilWorkValue = 'N/A';
    let hoursWorkedSoFarValue = 'N/A';

    const sleepEnd = todayRecord.sleepEndTime;
    const workStart = todayRecord.workStartTime;
    const workEnd = todayRecord.workEndTime;

    if (sleepEnd != null) {
      const wakeUpTime = new Date(selectedDate);
      wakeUpTime.setHours(sleepEnd, 0, 0, 0);

      if (workStart != null) {
        const workStartDateTime = new Date(selectedDate);
        workStartDateTime.setHours(workStart, 0, 0, 0);

        const timeToWork = (workStartDateTime - wakeUpTime) / (1000 * 60 * 60);
        timeFromWakeUpUntilWorkValue = formatHoursAndMinutes(timeToWork);
      } else {
        const timeSinceWakeUp = (currentTime - wakeUpTime) / (1000 * 60 * 60);

        if (timeSinceWakeUp > 24) {
          timeFromWakeUpUntilWorkValue = 'N/A';
        } else {
          timeFromWakeUpUntilWorkValue = formatHoursAndMinutes(timeSinceWakeUp);
        }
      }
    }

    if (workStart != null) {
      const workStartDateTime = new Date(selectedDate);
      workStartDateTime.setHours(workStart, 0, 0, 0);

      let workEndDateTime;
      if (workEnd != null) {
        workEndDateTime = new Date(selectedDate);
        workEndDateTime.setHours(workEnd, 0, 0, 0);
      } else {
        workEndDateTime = currentTime;
      }

      if (workEndDateTime < workStartDateTime) {
        workEndDateTime.setDate(workEndDateTime.getDate() + 1);
      }

      const workedTime = (workEndDateTime - workStartDateTime) / (1000 * 60 * 60);
      hoursWorkedSoFarValue = formatHoursAndMinutes(workedTime);
    }

    return {
      timeFromWakeUpUntilWork: timeFromWakeUpUntilWorkValue,
      hoursWorkedSoFar: hoursWorkedSoFarValue,
    };
  }, [todayRecord, selectedDate, currentTime]);

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
      {/* Today's Summary Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-600">Today's Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            icon={FiClock}
            title="Time from Wake Up to Work"
            value={timeFromWakeUpUntilWork}
            color="blue"
          />
          <MetricCard
            icon={FiBriefcase}
            title="Hours Worked So Far"
            value={hoursWorkedSoFar}
            color="green"
          />
          <div className="bg-white shadow-md p-4 rounded-lg col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <FiBarChart2 className="w-6 h-6 text-purple-500" />
              <h3 className="ml-2 text-lg font-semibold text-gray-700">Today's Activities</h3>
            </div>
            <DayActivityProgressBar
              sleepPercentage={sleepPercentage}
              workPercentage={workPercentage}
              otherPercentage={otherPercentage}
              availablePercentage={availablePercentage}
              extraAvailablePercentage={extraAvailablePercentage} // New
            />
            <div className="flex justify-between text-sm text-gray-600 mt-4">
              {/* Sleep */}
              <div className="flex flex-col items-center">
                <FaBed className="w-5 h-5 text-blue-500 mb-1" />
                <span className="font-medium">Sleep</span>
                <span className="text-xs font-semibold text-blue-500">{roundHours(sleepHours)}h</span>
              </div>
              {/* Work */}
              <div className="flex flex-col items-center">
                <FaLaptop className="w-5 h-5 text-green-500 mb-1" />
                <span className="font-medium">Work</span>
                <span className="text-xs font-semibold text-green-500">{roundHours(workHours)}h</span>
              </div>
              {/* Other */}
              <div className="flex flex-col items-center">
                <FaUserClock className="w-5 h-5 text-yellow-500 mb-1" />
                <span className="font-medium">Other</span>
                <span className="text-xs font-semibold text-yellow-500">{roundHours(otherHours)}h</span>
              </div>
              {/* Available */}
              <div className="flex flex-col items-center">
                <FaQuestion className="w-5 h-5 text-gray-500 mb-1" />
                <span className="font-medium">Available</span>
                <span className="text-xs font-semibold text-gray-500">{roundHours(availableHours)}h</span>
              </div>
              {/* Extra Available */}
              {extraAvailableHours > 0 && (
                <div className="flex flex-col items-center">
                  <FaQuestion className="w-5 h-5 text-red-500 mb-1" />
                  <span className="font-medium">Extra Available</span>
                  <span className="text-xs font-semibold text-red-500">+{roundHours(extraAvailableHours)}h</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

 {/* Month Overview Section */}
 <section>
        <h2 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-600">
          {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })} Overview
        </h2>
        <div className="bg-white shadow-md p-6 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
            <div className="mb-4 sm:mb-0">
              <p className="text-4xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
              <p className="text-sm text-gray-500">Total Earnings</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">{formatCurrency(selectedGoal)}</p>
              <p className="text-sm text-gray-500">Goal for the Month</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{ width: `${Math.min((totalEarnings / selectedGoal) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-right text-sm text-gray-600 mt-2">
            {Math.min(((totalEarnings / selectedGoal) * 100).toFixed(2), 100)}% of goal achieved
          </p>
        </div>
      </section>

      {/* Key Metrics Section */}
      <section>
        {/* <h2 className="text-2xl font-bold mb-6 text-gray-800">Key Metrics</h2> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <MetricCard
            icon={FiCreditCard}
            title="Avg Earnings / Day"
            value={formatCurrency(averageEarningsPerDay)}
            subValue="Per Day"
            color="indigo"
          />
          <MetricCard
            icon={FiClock}
            title="Avg Earnings / Hour"
            value={formatCurrency(averageEarningsPerHour)}
            subValue="Per Hour"
            color="green"
          />
          <MetricCard
            icon={FiBriefcase}
            title="Avg Hours Worked"
            value={`${averageHoursWorked.toFixed(1)} hrs`}
            subValue="Per Day"
            color="yellow"
          />
          <MetricCard
            icon={FiMoon}
            title="Avg Sleep Duration"
            value={`${averageSleep.toFixed(1)} hrs`}
            subValue="Per Day"
            color="blue"
          />
        </div>
      </section>

        {/* Updated Next Step Section */}
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
      <FiTarget className="text-orange-500 w-8 h-8 flex-shrink-0" />
      <div>
        <h2 className="text-md font-semibold text-gray-800">Your Mission</h2>
        <p className="text-sm text-gray-600">
          Earn{' '}
          <span className="font-bold text-orange-600">
            {formatCurrency(dailyPace)}
          </span>{' '}
          daily for the next{' '}
          <span className="font-bold text-orange-600">
            {remainingDays} days
          </span>{' '}
          to reach your goal.
        </p>
      </div>
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
