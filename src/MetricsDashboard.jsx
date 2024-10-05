import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  FiDollarSign,
  FiClock,
  FiCreditCard,
  FiBarChart2,
  FiBriefcase,
  FiMoon,
  FiActivity,
  FiTarget
} from 'react-icons/fi';

// Helper functions remain the same
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const calculateAverage = (numbers) => {
  const validNumbers = numbers.filter((num) => num !== null && num !== undefined);
  if (validNumbers.length === 0) return 0;
  const sum = validNumbers.reduce((acc, curr) => acc + curr, 0);
  return sum / validNumbers.length;
};

const getWorkLifeBalanceRating = (ratio) => {
  if (ratio < 0.8) return 'Light';
  if (ratio >= 0.8 && ratio < 1.0) return 'Balanced';
  if (ratio >= 1.0 && ratio < 1.5) return 'Heavy';
  if (ratio >= 1.5 && ratio < 2.0) return 'Very Heavy';
  return 'Extreme';
};
const MetricCard = ({ icon: Icon, title, value, subValue, color }) => (
  <div className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
    <div className="flex items-center space-x-2 mb-2">
      <Icon className={`text-${color}-500 w-5 h-5 transition-colors duration-150 ease-in-out`} />
      <p className="text-base font-medium text-gray-700">{title}</p>
    </div>
    <div className="flex flex-col items-center justify-center">
      <p className="text-xl font-semibold text-gray-800">{value}</p>
      {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
  </div>
);

const MetricsDashboard = ({
  selectedGoal,
  currentMonthRecords,
  selectedDate,
  pastYearRecords,
}) => {
  // Current Month Calculations (same as before)
  const currentMonthData = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1; // 1-12
    const today = new Date();
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysPassed = today.getDate();

    let totalEarnings = 0;
    let totalHoursWorked = 0;
    let totalSleepHours = 0;
    let totalProjects = 0;

    Object.keys(currentMonthRecords).forEach((dateKey) => {
      const record = currentMonthRecords[dateKey];
      totalEarnings += record.earnings || 0;
      totalHoursWorked += record.hoursWorked || 0;
      totalSleepHours += record.sleepHours || 0;
      totalProjects += record.projectsCount || 0;
    });

    const averageHoursWorked = calculateAverage(
      Object.values(currentMonthRecords).map((rec) => rec.hoursWorked)
    );
    const averageEarningsPerHour =
      averageHoursWorked > 0 ? totalEarnings / totalHoursWorked : 0;
    const averageEarningsPerDay = daysPassed > 0 ? totalEarnings / daysPassed : 0;
    const averageSleep = calculateAverage(
      Object.values(currentMonthRecords).map((rec) => rec.sleepHours)
    );

    // Pacing Metric
    const remainingDays = daysInMonth - daysPassed;
    const remainingGoal = selectedGoal - totalEarnings;
    const dailyPace = remainingDays > 0 ? remainingGoal / remainingDays : 0;

    // Work-Life Balance Indicator
    const workSleepRatio = averageSleep > 0 ? (averageHoursWorked / averageSleep).toFixed(2) : 'N/A';
    const balanceRating = getWorkLifeBalanceRating(parseFloat(workSleepRatio));

    return {
      totalEarnings,
      selectedGoal,
      averageHoursWorked,
      averageEarningsPerHour,
      averageEarningsPerDay,
      averageSleep,
      remainingDays,
      dailyPace,
      totalProjects,
      workSleepRatio,
      balanceRating,
    };
  }, [selectedGoal, currentMonthRecords, selectedDate]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto px-3 sm:px-5 lg:px-7">
      <div className="bg-white p-5 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-3 text-gray-800">Financial Overview</h2>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <div className="mb-3 sm:mb-0">
            <p className="text-xs text-gray-600">Earnings Progress</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(currentMonthData.totalEarnings)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Goal</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(selectedGoal)}</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-green-500 rounded-full h-1.5 transition-all duration-300 ease-in-out"
            style={{ width: `${Math.min((currentMonthData.totalEarnings / selectedGoal) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <MetricCard
          icon={FiClock}
          title="Avg Earnings per Hour"
          value={formatCurrency(currentMonthData.averageEarningsPerHour)}
          subValue="per hour"
          color="green"
        />
        <MetricCard
          icon={FiCreditCard}
          title="Avg Earnings per Day"
          value={formatCurrency(currentMonthData.averageEarningsPerDay)}
          subValue="per day"
          color="indigo"
        />
        <MetricCard
          icon={FiBarChart2}
          title="Avg Hours Worked"
          value={`${currentMonthData.averageHoursWorked.toFixed(1)} hrs`}
          subValue="per day"
          color="yellow"
        />
        <MetricCard
          icon={FiBriefcase}
          title="Projects Completed"
          value={currentMonthData.totalProjects}
          color="purple"
        />
        <MetricCard
          icon={FiMoon}
          title="Avg Sleep"
          value={`${currentMonthData.averageSleep.toFixed(1)} hrs`}
          subValue="per day"
          color="blue"
        />
        <MetricCard
          icon={FiActivity}
          title="Work-Life Balance"
          value={currentMonthData.balanceRating}
          subValue={`Work:Sleep Ratio ${currentMonthData.workSleepRatio}:1`}
          color="gray"
        />
      </div>

      <div className="bg-gray-50 p-5 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
        <div className="flex items-center space-x-3 mb-2">
          <FiTarget className="text-orange-500 w-5 h-5 transition-colors duration-150 ease-in-out" />
          <h2 className="text-lg font-bold text-gray-800">Next Step: Goal Pacing</h2>
        </div>
        <p className="text-base text-gray-700">
          To reach your goal, aim to earn <span className="font-bold text-orange-600">{formatCurrency(currentMonthData.dailyPace)}</span> daily
          for the next <span className="font-bold text-orange-600">{currentMonthData.remainingDays} days</span>.
        </p>
      </div>
    </div>
  );
};

MetricsDashboard.propTypes = {
  selectedGoal: PropTypes.number.isRequired,
  currentMonthRecords: PropTypes.object.isRequired,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  pastYearRecords: PropTypes.object.isRequired,
};

export default MetricsDashboard;