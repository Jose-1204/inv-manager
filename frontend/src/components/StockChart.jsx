import React from 'react';
import { Bar } from 'react-chartjs-2';

const StockChart = ({ items }) => {
  const chartData = {
    labels: items.map(item => item.name),
    datasets: [{
      label: 'Stock Actual',
      data: items.map(item => item.quantity),
      backgroundColor: items.map(item => 
        item.quantity <= 5 ? '#ff6384' : '#36a2eb'
      ),
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Distribución de Stock',
        font: { size: 18 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Cantidad' }
      }
    }
  };

  return (
    <div style={{ height: '100%', minHeight: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default StockChart;