// ActivityTracker.jsx
import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const ActivityTracker = ({ activityData, workoutData, sleepData, selectedTab, today }) => {
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

  const getHealthyColorLevel = (sleepHours, workedOut) => {
    if (sleepHours >= 8 && workedOut) {
      return 'bg-yellow-400'; // Gold color
    } else if (sleepHours >= 8 || workedOut) {
      return 'bg-green-400'; // Green color
    } else {
      return 'bg-gray-100'; // Empty
    }
  };

  const getTooltipContent = (date, ...args) => {
    let content = `<div><strong>Date:</strong> ${date.toLocaleDateString()}<br/>`;
    if (selectedTab === 'Work Activity') {
      const percentage = args[0];
      content += `<strong>Percentage:</strong> ${percentage?.toFixed(2)}%<br/></div>`;
    } else if (selectedTab === 'Health Activity') {
      const sleepHours = args[0];
      const workedOut = args[1];
      content += `<strong>Sleep Hours:</strong> ${sleepHours}h<br/>`;
      content += `<strong>Workout / Walk:</strong> ${workedOut ? 'Yes' : 'No'}</div>`;
    }
    return content;
  };

  if (selectedTab === 'Work Activity') {
    // Display earnings activity tracker
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
  } else if (selectedTab === 'Health Activity') {
    // Display healthy activity tracker
    return (
      <div>
        <h2 className="text-lg font-medium mb-4 text-gray-500">Yearly Health Activity</h2>
        <div>
          <div className="grid grid-cols-[repeat(53,_minmax(5px,_1fr))] gap-1">
            {[...Array(firstDayOfWeek)].map((_, index) => (
              <div key={`empty-healthy-${index}`} className="w-3 h-3"></div>
            ))}
            {dates.map((date, index) => {
              const sleepHours = sleepData[index];
              const workedOut = workoutData[index];
              const colorClass = getHealthyColorLevel(sleepHours, workedOut);
              return (
                <Tippy
                  key={`healthy-${date.toISOString()}`}
                  content={getTooltipContent(date, sleepHours, workedOut)}
                  allowHTML={true}
                  interactive={true}
                >
                  <div className={`w-3 h-3 rounded ${colorClass}`}></div>
                </Tippy>
              );
            })}
          </div>
        </div>
      </div>
    );
  } else if (selectedTab === 'All') {
    // Display both trackers
    return (
      <div>
        {/* Earnings Tracker */}
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
                  interactive={true}
                >
                  <div className={`w-3 h-3 rounded ${getColorLevel(percentage)}`}></div>
                </Tippy>
              );
            })}
          </div>
        </div>

        {/* Health Tracker */}
        <h2 className="text-lg font-medium mb-4 text-gray-500">Yearly Health Activity</h2>
        <div>
          <div className="grid grid-cols-[repeat(53,_minmax(5px,_1fr))] gap-1">
            {[...Array(firstDayOfWeek)].map((_, index) => (
              <div key={`empty-healthy-${index}`} className="w-3 h-3"></div>
            ))}
            {dates.map((date, index) => {
              const sleepHours = sleepData[index];
              const workedOut = workoutData[index];
              const colorClass = getHealthyColorLevel(sleepHours, workedOut);
              return (
                <Tippy
                  key={`healthy-${date.toISOString()}`}
                  content={getTooltipContent(date, sleepHours, workedOut)}
                  allowHTML={true}
                  interactive={true}
                >
                  <div className={`w-3 h-3 rounded ${colorClass}`}></div>
                </Tippy>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
};

export default ActivityTracker;
