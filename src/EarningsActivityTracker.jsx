// EarningsActivityTracker.jsx
import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const EarningsActivityTracker = ({ activityData }) => {
  console.log('EarningsActivityTracker rendered with data:', activityData);

  const getLastYearDates = () => {
    const dates = [];
    const today = new Date(2024, 9, 16); // October 16, 2024
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    console.log('Generated dates:', dates);
    return dates;
  };

  const getColorLevel = (percentage) => {
    if (percentage >= 100) return 'bg-yellow-400';
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 60) return 'bg-green-500';
    if (percentage >= 40) return 'bg-green-400';
    if (percentage >= 20) return 'bg-green-300';
    if (percentage > 0) return 'bg-green-200';
    return 'bg-gray-100';
  };

  const getTooltipContent = (date, percentage) => {
    return (
      `<div>
        <strong>Date:</strong> ${date.toLocaleDateString()}<br/>
        <strong>Percentage:</strong> ${percentage?.toFixed(2)}%<br/>
      </div>`
    );
  };

  const dates = getLastYearDates();
  const firstDayOfWeek = dates[0].getDay();

  console.log('First day of week:', firstDayOfWeek);

  return (
    <div className="mb-8">
      <h3 className="text-md font-semibold mb-2 text-gray-600">Earnings Activity</h3>
      <div className="grid grid-cols-[repeat(53,_minmax(5px,_1fr))] gap-1">
        {[...Array(firstDayOfWeek)].map((_, index) => (
          <div key={`empty-earnings-${index}`} className="w-3 h-3"></div>
        ))}
        {dates.map((date, index) => {
          const percentage = activityData[index];
          console.log(`Earnings Square ${index}:`, date, 'Percentage:', percentage);
          return (
            <Tippy
              key={`earnings-${date.toISOString()}`}
              content={getTooltipContent(date, percentage)}
              allowHTML={true}
            >
              <div
                className={`w-3 h-3 rounded ${getColorLevel(percentage)}`}
              ></div>
            </Tippy>
          );
        })}
      </div>
    </div>
  );
};

export default EarningsActivityTracker;
