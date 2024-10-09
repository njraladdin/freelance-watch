// src/MetricsDashboard.jsx
import React, { useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { 
  FiDollarSign,
  FiClock,
  FiCreditCard,
  FiBarChart2,
  FiMoon,
  FiTarget,
  FiBriefcase
} from 'react-icons/fi';
import classNames from 'classnames';

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Function to convert decimal hours to "Xh Ym" format
const formatHoursAndMinutes = (decimalHours) => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
};

const calculateAverage = (numbers) => {
  const validNumbers = numbers.filter((num) => num !== null && num !== undefined);
  if (validNumbers.length === 0) return 0;
  const sum = validNumbers.reduce((acc, curr) => acc + curr, 0);
  return sum / validNumbers.length;
};

// Progress Bar Component for Day Activity with Percentages Next to Labels
const DayActivityProgressBar = ({ sleepPercentage, workPercentage, otherPercentage }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 flex overflow-hidden relative">
      {/* Sleep Segment */}
      <div
        className="h-full bg-blue-500"
        style={{ width: `${sleepPercentage}%` }}
        title={`Sleep: ${sleepPercentage}%`}
      ></div>
      {/* Work Segment */}
      <div
        className="h-full bg-green-500"
        style={{ width: `${workPercentage}%` }}
        title={`Work: ${workPercentage}%`}
      ></div>
      {/* Other Segment */}
      <div
        className="h-full bg-purple-500"
        style={{ width: `${otherPercentage}%` }}
        title={`Other: ${otherPercentage}%`}
      ></div>
    </div>
  );
};

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
    <div className="flex items-center space-x-2 mb-1">
      <Icon className={classNames(`w-5 h-5 transition-colors duration-150 ease-in-out`, {
        [`text-${color}-500`]: color,
      })} />
    </div>
    <div className="flex flex-col items-center justify-center">
      <p className={`text-lg font-semibold text-gray-800`}>{value}</p>
      {subValue && <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>}
    </div>
    <p className={`text-sm font-medium text-gray-700 text-center`}>{title}</p>
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
const MetricsDashboard = ({
  selectedGoal,
  currentMonthRecords,
  selectedDate,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update currentTime every minute for real-time metrics
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayKey = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  const todayRecord = useMemo(() => currentMonthRecords[todayKey] || {}, [currentMonthRecords, todayKey]);

  const currentMonthData = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1; // 1-12
    const today = new Date();
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysPassed = today.getDate();

    let totalEarnings = 0;
    let totalHoursWorked = 0;
    let totalSleepHours = 0;

    Object.keys(currentMonthRecords).forEach((dateKey) => {
      const record = currentMonthRecords[dateKey];
      totalEarnings += record?.earnings ?? 0;
      totalHoursWorked += record?.hoursWorked ?? 0;
      totalSleepHours += record?.sleepHours ?? 0;
    });

    const averageHoursWorked = calculateAverage(
      Object.values(currentMonthRecords).map((rec) => rec.hoursWorked)
    );
    const averageEarningsPerHour =
      averageHoursWorked > 0 ? totalEarnings / totalHoursWorked : 0;
    const averageEarningsPerDay = daysPassed > 0 ? totalEarnings / daysPassed : 0;

    // Updated averageSleep calculation
    const averageSleep = calculateAverage(
      Object.values(currentMonthRecords)
        .map((rec) => rec.sleepHours)
        .filter((sleep) => sleep > 0) // Only include positive sleep hours
    );

    // Pacing Metric
    const remainingDays = daysInMonth - daysPassed;
    const remainingGoal = selectedGoal - totalEarnings;
    const dailyPace = remainingDays > 0 ? remainingGoal / remainingDays : 0;

    return {
      totalEarnings,
      selectedGoal,
      averageHoursWorked,
      averageEarningsPerHour,
      averageEarningsPerDay,
      averageSleep,
      remainingDays,
      dailyPace,
    };
  }, [selectedGoal, currentMonthRecords, selectedDate]);

  // Today's Metrics Calculation
  const todayMetrics = useMemo(() => {
    const { selectedSleepTimes = [], selectedWorkTimes = [] } = todayRecord;

    // Get the last sleep end time
    const lastSleepEnd = selectedSleepTimes.length > 0
      ? Math.max(...selectedSleepTimes.map(time => time.end))
      : null;

    // Get the first work start time
    const firstWorkStart = selectedWorkTimes.length > 0
      ? Math.min(...selectedWorkTimes.map(time => time.start))
      : null;

    // Get the work end time (excluding nulls)
    const workEndTimes = selectedWorkTimes.map(time => time.end).filter(end => end !== null);
    const workEndTime = workEndTimes.length > 0 ? Math.max(...workEndTimes) : null;

    // Initialize variables
    let timeFromWakeUpUntilWork = 'N/A';
    let hoursWorkedSoFar = 'N/A';

    if (lastSleepEnd !== null) {
      let sleepEndDate = new Date(selectedDate);

      // Adjust sleepEndDate to the previous day if sleep ends after noon (12 PM)
      // This logic assumes that sleep end times >12 are from the previous day
      if (lastSleepEnd > 12) { 
        sleepEndDate.setDate(sleepEndDate.getDate() - 1);
      }
      sleepEndDate.setHours(lastSleepEnd, 0, 0, 0);

      // Calculate time since waking up
      const diffMs = currentTime - sleepEndDate;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (firstWorkStart !== null) {
        let workStartDate = new Date(selectedDate);
        workStartDate.setHours(firstWorkStart, 0, 0, 0);

        if (currentTime >= workStartDate) {
          // Calculate time from wake up until work starts
          const timeToWorkMs = workStartDate - sleepEndDate;
          const timeToWorkHours = timeToWorkMs / (1000 * 60 * 60);
          timeFromWakeUpUntilWork = formatHoursAndMinutes(timeToWorkHours);
        } else {
          // Time since waking up
          if (diffHours > 14) {
            timeFromWakeUpUntilWork = 'NO WORK';
          } else {
            timeFromWakeUpUntilWork = formatHoursAndMinutes(diffHours);
          }
        }
      } else {
        // No work start time set
        if (diffHours > 14) {
          timeFromWakeUpUntilWork = 'NO WORK';
        } else {
          timeFromWakeUpUntilWork = formatHoursAndMinutes(diffHours);
        }
      }
    }

    if (firstWorkStart !== null) {
      let workStartDate = new Date(selectedDate);
      workStartDate.setHours(firstWorkStart, 0, 0, 0);

      if (currentTime >= workStartDate) {
        if (workEndTime !== null) {
          // Total time worked
          let totalWorkedHours;
          if (workEndTime >= firstWorkStart) {
            totalWorkedHours = workEndTime - firstWorkStart;
          } else {
            // Overnight shift
            totalWorkedHours = 24 - firstWorkStart + workEndTime;
          }
          hoursWorkedSoFar = formatHoursAndMinutes(totalWorkedHours);
        } else {
          // Ongoing work
          const diffMs = currentTime - workStartDate;
          const diffHours = diffMs / (1000 * 60 * 60);
          hoursWorkedSoFar = formatHoursAndMinutes(diffHours);
        }
      } else {
        hoursWorkedSoFar = 'Not started';
      }
    }

    // Calculate Day Activity Percentages with Math.ceil
    const sleep = todayRecord.sleepHours || 0;
    const work = hoursWorkedSoFar !== 'N/A' && hoursWorkedSoFar !== 'Not started' && hoursWorkedSoFar !== 'NO WORK' ? 
      parseFloat(hoursWorkedSoFar.split('h')[0]) + (parseFloat(hoursWorkedSoFar.split(' ')[1].replace('m', '')) / 60) : 0;
    const other = Math.max(0, 24 - sleep - work);
    const total = sleep + work + other;

    // Round up the percentages
    const sleepPercentage = total > 0 ? Math.ceil((sleep / total) * 100).toString() : '0';
    const workPercentage = total > 0 ? Math.ceil((work / total) * 100).toString() : '0';
    const otherPercentage = total > 0 ? Math.ceil((other / total) * 100).toString() : '0';

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
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 border-b pb-2 text-gray-600">
          Today 
        </h2>
        <div className="bg-white pb-6 px-0 rounded-lg md:px-6">

        {/* Updated Grid Layout for Today Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center lg:justify-items-start">
          {/* Time from wakeup to work */}
          <div className="flex flex-col items-center bg-gray-50 p-5 rounded-lg shadow-inner h-40 w-40">
            <FiClock className="text-blue-500 w-6 h-6 mb-2" />
            <p className="text-sm text-gray-500 text-center">Time from wakeup to work</p>
            <p className="text-lg font-medium text-gray-800">{todayMetrics.timeFromWakeUpUntilWork}</p>
          </div>

          {/* Hours Worked So Far */}
          <div className="flex flex-col items-center bg-gray-50 p-5 rounded-lg shadow-inner h-40 w-40">
            <FiBriefcase className="text-green-500 w-6 h-6 mb-2" />
            <p className="text-sm text-gray-500 text-center">Hours Worked So Far</p>
            <p className="text-lg font-medium text-gray-800">{todayMetrics.hoursWorkedSoFar}</p>
          </div>

          {/* Day Activity Card */}
          <div className="flex flex-col space-y-4 bg-gray-50 p-5 rounded-lg shadow-inner col-span-2 lg:col-span-1 w-full">
            <div className="flex items-center space-x-2">
              <FiBarChart2 className="text-purple-500 w-6 h-6" />
              <p className="text-sm text-gray-500 text-center">Day Activity</p>
            </div>
            <DayActivityProgressBar 
              sleepPercentage={todayMetrics.sleepPercentage} 
              workPercentage={todayMetrics.workPercentage} 
              otherPercentage={todayMetrics.otherPercentage} 
            />
            {/* Labels for Day Activity with Percentages Next to Labels */}
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                Sleep {todayMetrics.sleepPercentage}%
              </span>
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                Work {todayMetrics.workPercentage}%
              </span>
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-1"></span>
                Other {todayMetrics.otherPercentage}%
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
            <p className="text-3xl font-bold text-gray-800">{formatCurrency(currentMonthData.totalEarnings)}</p>
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
            style={{ width: `${Math.min((currentMonthData.totalEarnings / selectedGoal) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Metric Cards Section with Grid and Centered Items */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center md:justify-items-start">
        <MetricCard
          icon={FiClock}
          title="Avg Earnings per Hour"
          value={formatCurrency(currentMonthData.averageEarningsPerHour)}
          subValue="per hour"
          color="green"
          compact={false}
        />
        <MetricCard
          icon={FiCreditCard}
          title="Avg Earnings per Day"
          value={formatCurrency(currentMonthData.averageEarningsPerDay)}
          subValue="per day"
          color="indigo"
          compact={false}
        />
        <MetricCard
          icon={FiBarChart2}
          title="Avg Hours Worked"
          value={`${currentMonthData.averageHoursWorked.toFixed(1)} hrs`}
          subValue="per day"
          color="yellow"
          compact={false}
        />
        <MetricCard
          icon={FiMoon}
          title="Avg Sleep"
          value={`${currentMonthData.averageSleep.toFixed(1)} hrs`}
          subValue="per day"
          color="blue"
          compact={false}
        />
      </div>

      {/* Next Step Section */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
        <div className="flex items-center space-x-3 mb-4">
          <FiTarget className="text-orange-500 w-5 h-5" />
          <h2 className="text-lg font-bold text-gray-800">Next Step</h2>
        </div>
        <p className="text-base text-gray-700">
          Earn <span className="font-bold text-orange-600">{formatCurrency(currentMonthData.dailyPace)}</span> daily
          for the next <span className="font-bold text-orange-600">{currentMonthData.remainingDays} days</span> to hit your goal.
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
