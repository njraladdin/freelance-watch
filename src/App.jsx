import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import './App.css';


Chart.register(...registerables);

const App = () => {
  const [dailyData, setDailyData] = useState([]);
  const [accumulatedData, setAccumulatedData] = useState([]);
  const [goalLineDaily, setGoalLineDaily] = useState([]);
  const [goalLineAccumulated, setGoalLineAccumulated] = useState([]);
  const [isAccumulatedView, setIsAccumulatedView] = useState(true);
  const [labels, setLabels] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState(0);
  const [activityData, setActivityData] = useState(new Array(365).fill(0));
  const [moneyInput, setMoneyInput] = useState('');
  const [buttonState, setButtonState] = useState('default');
  const [buttonAmount, setButtonAmount] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState(10000);

  useEffect(() => {
    updateGoalLines(selectedGoal);
  }, [selectedGoal]);

  
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const { labels: newLabels, daysInMonth: newDaysInMonth } = generateChartData();
    setLabels(newLabels);
    setDaysInMonth(newDaysInMonth);
    createActivityTracker();
    updateGoalLines(5000); // Default goal
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, getChartConfig());
    }
  }, [dailyData, accumulatedData, goalLineDaily, goalLineAccumulated, isAccumulatedView]);

  useEffect(() => {
    initTooltips();
  }, [activityData]);

  const generateChartData = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const newLabels = [];
    const newDailyData = [];
    const newAccumulatedData = [];
    let accumulated = 0;

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      newLabels.push(d.getDate().toString());
      if (d <= today) {
        const dailyEarning = Math.floor(Math.random() * 300) + 50; // Remove this line in production
        newDailyData.push(dailyEarning);
        accumulated += dailyEarning;
        newAccumulatedData.push(accumulated);
      } else {
        newDailyData.push(null);
        newAccumulatedData.push(null);
      }
    }

    setDailyData(newDailyData);
    setAccumulatedData(newAccumulatedData);

    return { labels: newLabels, daysInMonth };
  };

  const getChartConfig = () => ({
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Earnings (USD)',
          data: isAccumulatedView ? accumulatedData : dailyData,
          borderColor: '#58CC02',
          backgroundColor: 'rgba(88, 204, 2, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.1
        },
        {
          label: 'Goal',
          data: isAccumulatedView ? goalLineAccumulated : goalLineDaily,
          borderColor: '#FF6384',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `$${value}`
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              const date = new Date();
              date.setDate(parseInt(tooltipItems[0].label));
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
          }
        }
      }
    }
  });




  const updateGoalLines = (goal) => {
    const dailyGoal = goal / daysInMonth;
    setGoalLineDaily(new Array(daysInMonth).fill(dailyGoal));
    setGoalLineAccumulated(labels.map((_, index) => dailyGoal * (index + 1)));
  };

  const handleGoalChange = (e) => {
    const goal = parseInt(e.target.value);
    setSelectedGoal(goal);
    updateGoalLines(goal);
    console.log(goal)
  };

  
  const toggleChartView = () => {
    setIsAccumulatedView(!isAccumulatedView);
  };

  const getColorLevel = (percentage) => {
    if (percentage >= 100) return 'level-gold';
    if (percentage >= 80) return 'level-5';
    if (percentage >= 60) return 'level-4';
    if (percentage >= 40) return 'level-3';
    if (percentage >= 20) return 'level-2';
    if (percentage > 0) return 'level-1';
    return 'level-0';
  };

  const createActivityTracker = () => {
    const dates = getLastYearDates();
    const newActivityData = [...activityData];
    
    for (let i = 0; i < dates.length; i++) {
      const percentage = Math.random() * 100; // Simulated data, replace with actual data in production
      newActivityData[i] = percentage;
    }
    
    setActivityData(newActivityData);
  };

  const getLastYearDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.unshift(date);
    }
    return dates;
  };

  const initTooltips = () => {
    const gridItems = document.querySelectorAll('.grid-item[data-date]');
    gridItems.forEach(item => {
      tippy(item, {
        content: getTooltipContent(item),
        allowHTML: true,
        theme: 'custom',
      });
    });
  };

  const getTooltipContent = (element) => {
    const date = new Date(element.dataset.date);
    const percentage = parseFloat(element.dataset.percentage);
    const monthlyGoal = parseInt(document.getElementById('goalSelect').value);
    const daysInMonth = getDaysInMonth(date.getFullYear(), date.getMonth());
    const dailyGoal = monthlyGoal / daysInMonth;
    const earnedAmount = (percentage / 100) * dailyGoal;
    
    return `Date: ${date.toLocaleDateString()}<br>
            Earned: $${earnedAmount.toFixed(2)}<br>
            Daily Goal: $${dailyGoal.toFixed(2)}`;
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const animateValue = (start, end, duration, callback) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      callback((progress * (end - start) + start).toFixed(2));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  const handleAddEarnings = () => {
    const amount = parseFloat(moneyInput);
    if (!isNaN(amount)) {
      setButtonState('animating');
      animateValue(0, amount, 2000, (value) => setButtonAmount(value));

      setTimeout(() => setButtonState('checkmark'), 2800);
      setTimeout(() => setButtonState('default'), 4100);

      const today = new Date();
      const todayIndex = today.getDate() - 1;

      const newDailyData = [...dailyData];
      const newAccumulatedData = [...accumulatedData];

      newDailyData[todayIndex] = (newDailyData[todayIndex] || 0) + amount;
      newAccumulatedData[todayIndex] = (newAccumulatedData[todayIndex] || 0) + amount;

      for (let i = todayIndex + 1; i < newAccumulatedData.length; i++) {
        if (newAccumulatedData[i] !== null) {
          newAccumulatedData[i] += amount;
        }
      }

      setDailyData(newDailyData);
      setAccumulatedData(newAccumulatedData);

      const monthlyGoal = parseInt(document.getElementById('goalSelect').value);
      const dailyGoal = monthlyGoal / getDaysInMonth(today.getFullYear(), today.getMonth());
      const todayTotal = newDailyData[todayIndex] || 0;
      const percentage = (todayTotal / dailyGoal) * 100;

      updateActivityTracker(today, percentage);
      setMoneyInput('');
    }
  };

  const updateActivityTracker = (date, percentage) => {
    const dateString = date.toISOString().split('T')[0];
    const newActivityData = [...activityData];
    const index = getLastYearDates().findIndex(d => d.toISOString().split('T')[0] === dateString);
    if (index !== -1) {
      newActivityData[index] = percentage;
      setActivityData(newActivityData);
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8 relative">
        <div className="absolute top-8 right-4">
          <select id="goalSelect" className="goal-select" onChange={handleGoalChange} value={selectedGoal}>
            <option value={5000}>Goal: $5,000</option>
            <option value={10000}>Goal: $10,000</option>
            <option value={20000}>Goal: $20,000</option>
            <option value={30000}>Goal: $30,000</option>
          </select>
        </div>
        <h1 className="text-3xl font-semibold text-center mb-8">Progress Tracker</h1>

        {/* Input Section */}
        <div className="mb-12">
          <h2 className="text-lg font-medium mb-4 text-center text-gray-500">Add Today's Earnings</h2>
          <div className="flex justify-center items-center space-x-4">
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-lg">$</span>
              <input
                type="number"
                value={moneyInput}
                onChange={(e) => setMoneyInput(e.target.value)}
                className="w-48 pl-8 pr-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <button onClick={handleAddEarnings} className="modern-button">
              <span id="buttonText" className={`button-content ${buttonState !== 'default' ? 'opacity-0' : ''}`}>
                Add Earnings
              </span>
              <span id="buttonAmount" className={`button-content ${buttonState !== 'animating' ? 'opacity-0' : ''}`}>
                ${buttonAmount}
              </span>
              <span id="checkmark" className={`button-content ${buttonState !== 'checkmark' ? 'opacity-0' : ''}`}>
                <svg className="checkmark-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="11" fill="#58CC02" stroke="white" strokeWidth="2"/>
                  <path d="M7 13l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 id="earningsOverviewTitle" className="text-lg font-medium text-gray-500">
              Earnings Overview - {new Date().toLocaleString('default', { month: 'long' })}
            </h2>
            <button onClick={toggleChartView} className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors">
              Switch to {isAccumulatedView ? 'Daily' : 'Accumulated'} View
            </button>
          </div>
          <canvas ref={chartRef} className="w-full h-64"></canvas>
        </div>

        {/* Activity Tracker Section */}
        <div>
          <h2 className="text-lg font-medium mb-4 text-gray-500">Yearly Activity</h2>
          <div className="grid-container">
            {[...Array(getLastYearDates()[0].getDay())].map((_, index) => (
              <div key={`empty-${index}`} className="grid-item"></div>
            ))}
            {getLastYearDates().map((date, index) => (
              <div
                key={date.toISOString()}
                className={`grid-item ${getColorLevel(activityData[index])}`}
                data-date={date.toISOString().split('T')[0]}
                data-percentage={activityData[index].toFixed(2)}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;