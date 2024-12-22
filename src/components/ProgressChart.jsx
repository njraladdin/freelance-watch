import React, { useState, useEffect, useMemo } from 'react';
import { Chart } from 'react-chartjs-2';

const ProgressChart = ({ chartData, goalLineAccumulated, selectedDate }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate all days of the selected month with cumulative earnings
  const monthData = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Generate array of all dates in the month
    const dates = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return date.toLocaleDateString();
    });

    // Map existing data to the full month array and calculate cumulative earnings
    let cumulativeEarnings = 0;
    const earnings = dates.map(date => {
      const index = chartData.labels.indexOf(date);
      if (index !== -1) {
        cumulativeEarnings += chartData.earnings[index];
      }
      return cumulativeEarnings;
    });

    const projects = dates.map(date => {
      const index = chartData.labels.indexOf(date);
      return index !== -1 ? chartData.projectsCount[index] : 0;
    });

    return {
      labels: dates,
      earnings,
      projectsCount: projects
    };
  }, [chartData, selectedDate]);

  const datasets = [
    {
      type: 'line',
      label: 'Cumulative Earnings (USD)',
      yAxisID: 'y1',
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      data: monthData.earnings,
      borderWidth: 4,
      fill: true,
      tension: 0.1,
      datalabels: { display: false },
      pointRadius: isMobile ? 0 : 3,
      pointHoverRadius: isMobile ? 0 : 6,
    },
    {
      type: 'line',
      label: 'Monthly Goal',
      yAxisID: 'y1',
      borderColor: '#FF6384',
      data: goalLineAccumulated,
      borderWidth: 2,
      borderDash: [5, 5],
      fill: false,
      pointRadius: 0,
      datalabels: { display: false },
    },
    {
      type: 'bar',
      label: 'Projects Won',
      yAxisID: 'y3',
      backgroundColor: '#A855F7',
      data: monthData.projectsCount,
      borderWidth: 0,
      datalabels: {
        display: true,
        align: 'top',
        formatter: (value) => value || '',
        font: { weight: 'bold', size: isMobile ? 10 : 11 },
      },
    },
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          display: true,
          autoSkip: true,
          maxTicksLimit: isMobile ? 5 : 10,
          font: { size: isMobile ? 10 : 12 },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`,
          font: { size: isMobile ? 10 : 12 },
        },
      },
      y3: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        max: Math.max(...monthData.projectsCount, 5),
        grid: { drawOnChartArea: false },
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: isMobile ? 'bottom' : 'top',
        labels: {
          font: { size: isMobile ? 10 : 12 },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.dataset.label === 'Cumulative Earnings (USD)' || context.dataset.label === 'Monthly Goal') {
              return `${context.dataset.label}: $${Math.round(context.parsed.y).toLocaleString()}`;
            }
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
  };

  return (
    <div className="mb-8 px-4">
      <div className="w-full overflow-x-auto">
        <div className="min-w-[300px] max-w-full h-64 sm:h-80 lg:h-96">
          <Chart type="line" data={{ labels: monthData.labels, datasets }} options={options} />
        </div>
      </div>
    </div>
  );
};

export default ProgressChart; 