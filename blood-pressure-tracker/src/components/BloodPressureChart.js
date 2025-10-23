import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BloodPressureChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="no-data-message">
          <h3>차트 데이터가 없습니다</h3>
          <p>혈압 기록을 추가하면 차트가 표시됩니다.</p>
        </div>
      </div>
    );
  }

  // 데이터를 날짜순으로 정렬
  const sortedData = [...data].sort((a, b) => {
    const dateA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
    const dateB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
    return dateA - dateB;
  });

  const labels = sortedData.map(item => {
    const date = item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  });

  const systolicData = sortedData.map(item => item.systolic);
  const diastolicData = sortedData.map(item => item.diastolic);
  const pulseData = sortedData.map(item => item.pulse);

  const chartData = {
    labels,
    datasets: [
      {
        label: '수축기 혈압',
        data: systolicData,
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#e74c3c',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: '이완기 혈압',
        data: diastolicData,
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3498db',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: '맥박',
        data: pulseData,
        borderColor: '#2ecc71',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2ecc71',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: '혈압 및 맥박 추이',
        font: {
          size: 18,
          weight: 'bold'
        },
        color: '#2c3e50'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label.includes('혈압')) {
              return `${label}: ${value} mmHg`;
            } else {
              return `${label}: ${value} bpm`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#666',
          font: {
            size: 12
          },
          maxRotation: 45
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#666',
          font: {
            size: 12
          },
          callback: function(value, index, ticks) {
            return value + ' mmHg';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      point: {
        hoverBackgroundColor: '#fff'
      }
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BloodPressureChart;

