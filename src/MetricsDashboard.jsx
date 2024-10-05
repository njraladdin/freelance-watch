import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  FiDollarSign,
  FiClock,
  FiCreditCard,
  FiBarChart2,
  FiMoon,
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

const MetricCard = ({ icon: Icon, title, value, subValue, color, compact }) => (
  <div className={`flex flex-col justify-between items-center bg-gray-50 p-5 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out ${compact ? 'h-32 w-32' : 'h-40 w-40'}`}>
    <div className="flex items-center space-x-2 mb-2">
      <Icon className={`text-${color}-500 w-6 h-6 transition-colors duration-150 ease-in-out`} />
    </div>
    <div className="flex flex-col items-center justify-center">
      <p className={`text-xl font-semibold text-gray-800`}>{value}</p>
      {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
    <p className={`text-sm font-medium text-gray-700 text-center`}>{title}</p>
  </div>
);

const MetricsDashboard = ({
  selectedGoal,
  currentMonthRecords,
  selectedDate,
}) => {
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
    const averageSleep = calculateAverage(
      Object.values(currentMonthRecords).map((rec) => rec.sleepHours)
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

  return (
    <div className="space-y-5 max-w-7xl mx-auto px-3 sm:px-5 lg:px-7">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 border-b pb-2 text-gray-600">
        Overview -{' '}
        {new Date().toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        })}
      </h2>
      <div className="bg-white p-5 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <div className="mb-3 sm:mb-0">
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(currentMonthData.totalEarnings)}</p>
          </div>
          <div>
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

      {/* Compact Grid with centered square layout */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 justify-center">
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
        {/* Avg Hours Worked and Avg Sleep placed next to each other */}
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

      <div className="bg-gray-50 p-5 rounded-lg shadow-inner transition-shadow duration-150 ease-in-out">
        <div className="flex items-center space-x-3 mb-2">
          <FiTarget className="text-orange-500 w-5 h-5 transition-colors duration-150 ease-in-out" />
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
