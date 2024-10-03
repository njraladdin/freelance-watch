// ActivityTracker.jsx
import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const ActivityTracker = ({ activityData, today }) => {
  const getLastYearDates = (today) => {
    const dates = [];
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  const dates = getLastYearDates(today);
  const firstDayOfWeek = dates[0].getDay();

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
      <div>
        <strong>Date:</strong> {date.toLocaleDateString()}<br/>
        <strong>Percentage:</strong> {percentage?.toFixed(2)}%<br/>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-4 text-gray-500">Yearly Earnings Activity</h2>
      <div className="mb-8">
        <div className="grid grid-cols-[repeat(53,_minmax(5px,_1fr))] gap-1">
          {[...Array(firstDayOfWeek)].map((_, index) => (
            <div key={`empty-earnings-${index}`} className="w-3 h-3"></div>
          ))}
          {dates.map((date, index) => {
            const percentage = activityData[index];
            return (
              <Tippy
                key={`earnings-${date.toISOString()}`}
                content={getTooltipContent(date, percentage)}
                allowHTML={true}
              >
                <div className={`w-3 h-3 rounded ${getColorLevel(percentage)}`}></div>
              </Tippy>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;
