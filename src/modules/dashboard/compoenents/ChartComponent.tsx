import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  BarController,
  LineController,
  ChartData,
  ChartOptions,
} from "chart.js";
// import { Chart } from "react-chartjs-2";

// Registering all required components
ChartJS.register(
  BarController,
  LineController,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement // Register PointElement for line chart data points
);

const ChartComponent: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null); // Ref to hold the canvas element
  console.log("ChartComponent - chartRef:", chartRef);
  const chartInstanceRef = useRef<any>(null); // Ref to hold the Chart.js instance
  console.log("ChartComponent - chartInstanceRef:", chartInstanceRef);

  // Chart data
  const data: ChartData<'bar' | 'line'> = {
    labels: ["Acids", "Bases", "Solvents", "Reagents", "Salts"],
    datasets: [
      {
        type: "bar", // Bar chart dataset
        label: "Stock Levels (Liters)",
        data: [120, 80, 200, 50, 150],
        backgroundColor: "#2196f3", // Blue bars
        borderWidth: 1,
      },
      {
        type: "line", // Line chart dataset
        label: "Orders Budget ($)",
        data: [2000, 3000, 4000, 1500, 2500],
        borderColor: "#ff9800", // Orange line
        fill: false,
        borderWidth: 2,
      },
    ],
  };

  // Chart configuration
  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const, // TypeScript requires 'as const' for literal types
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            if (context.dataset.type === "line") {
              return `$${context.raw}`;
            }
            return `${context.raw} Liters`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Stock Levels / Budget",
        },
      },
      x: {
        title: {
          display: true,
          text: "Chemical Categories",
        },
      },
    },
  };

  // Create or update the chart when the component mounts or updates
  useEffect(() => {
    if (chartRef.current) {
      // Destroy the previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create a new chart instance
      chartInstanceRef.current = new ChartJS(chartRef.current, {
        type: "bar", // Default type for the chart
        data: data,
        options: options,
      });
    }

    // Cleanup the chart instance on component unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, options]); // Dependency on data and options to re-render on change

  return <canvas ref={chartRef} />;
};

export default ChartComponent;
