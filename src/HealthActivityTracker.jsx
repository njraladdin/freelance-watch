// HealthActivityTracker.jsx
import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const HealthActivityTracker = ({ sleepData, workoutData }) => {
  console.log('HealthActivityTracker rendered with sleepData:', sleepData, 'and workoutData:', workoutData);

  const getLastYearDates = () => {
    const dates = [];
    const today = new Date(2024, 9, 16); // October 16, 2024
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    console.log('Generated dates for Health:', dates);
    return dates;
  };

  const getHealthColor = (sleep, workedOut) => {
    if (sleep > 8 && workedOut) return 'bg-yellow-400'; // Gold for perfect day
    if (sleep > 8 || workedOut) return 'bg-green-500'; // Green if either condition is met
    return 'bg-gray-100'; // Empty otherwise
  };

  const getTooltipContent = (date, sleep, workedOut) => {
    return (
      `<div>
        <strong>Date:</strong> ${date.toLocaleDateString()}<br/>
        <strong>Sleep Hours:</strong> ${sleep}h<br/>
        <strong>Workout / Walk:</strong> ${workedOut ? 'Yes' : 'No'}
      </div>`
    );
  };

  const dates = getLastYearDates();
  const firstDayOfWeek = dates[0].getDay();

  console.log('First day of week for Health:', firstDayOfWeek);

  return (
    <div>
      <h3 className="text-md font-semibold mb-2 text-gray-600">Health Activity</h3>
      <div className="grid grid-cols-[repeat(53,_minmax(5px,_1fr))] gap-1">
        {[...Array(firstDayOfWeek)].map((_, index) => (
          <div key={`empty-health-${index}`} className="w-3 h-3"></div>
        ))}
        {dates.map((date, index) => {
          const sleep = sleepData[index];
          const workedOut = workoutData[index];
          console.log(`Health Square ${index}:`, date, 'Sleep:', sleep, 'Worked Out:', workedOut);
          return (
            <Tippy
              key={`health-${date.toISOString()}`}
              content={getTooltipContent(date, sleep, workedOut)}
              allowHTML={true}
            >
              <div
                className={`w-3 h-3 rounded ${getHealthColor(sleep, workedOut)}`}
              ></div>
            </Tippy>
          );
        })}
      </div>
    </div>
  );
};

export default HealthActivityTracker;
