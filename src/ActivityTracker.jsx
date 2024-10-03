// ActivityTracker.jsx
import React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const ActivityTracker = ({ activityData, today }) => {
  // No need to generate dates here since activityData already contains them
  // We'll rely on activityData to have all necessary information

  // Define color levels based on percentage
  const getColorLevel = (percentage) => {
    if (percentage >= 100) return 'bg-yellow-400';
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 60) return 'bg-green-500';
    if (percentage >= 40) return 'bg-green-400';
    if (percentage >= 20) return 'bg-green-300';
    if (percentage > 0) return 'bg-green-200';
    return 'bg-gray-100';
  };

  const getTooltipContent = (date, earnings, dailyGoal) => {
    return (
      <div>
        <strong>Date:</strong> {date.toLocaleDateString()}<br />
        <strong>Earnings:</strong> ${earnings} / ${dailyGoal.toFixed(2)}
      </div>
    );
  };

  // Calculate the padding based on the first day of the year (or adjust as needed)
  const firstDayOfWeek = new Date(activityData[0]?.date).getDay() || 0;

  return (
    <div>
      <h2 className="text-lg font-medium mb-4 text-gray-500">Yearly Earnings Activity</h2>
      <div className="mb-8">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: 'repeat(53, minmax(5px, 1fr))',
          }}
        >
          {/* Fill the empty squares for the first week */}
          {[...Array(firstDayOfWeek)].map((_, index) => (
            <div key={`empty-earnings-${index}`} className="w-3 h-3"></div>
          ))}
          {/* Render the activity squares */}
          {activityData.map((data, index) => (
            <Tippy
              key={`earnings-${data.date.toISOString()}`}
              content={getTooltipContent(data.date, data.earnings, data.dailyGoal)}
              allowHTML={true}
            >
              <div
                className={`w-3 h-3 rounded ${getColorLevel(data.percentage)}`}
              ></div>
            </Tippy>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;
