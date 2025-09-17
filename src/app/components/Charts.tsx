// components/Charts.tsx
"use client";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

type Props = {
  accountSums: Record<string, number>;
};

const getColor = (index: number) => {
  const hue = (index * 137.5) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const Charts = ({ accountSums }: Props) => {
  const labels = Object.keys(accountSums);
  const values = Object.values(accountSums);
  const colors = labels.map((_, i) => getColor(i));

  const pieData = {
    labels,
    datasets: [
      {
        label: "Account Totals",
        data: values,
        backgroundColor: colors,
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels,
    datasets: [
      {
        label: "Account Totals Over Accounts",
        data: values,
        fill: false,
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "Chart Representation",
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
      <div className="bg-white p-4 rounded shadow">
        <h4 className="text-lg font-semibold mb-2">Pie Chart</h4>
        <Pie data={pieData} options={options} />
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h4 className="text-lg font-semibold mb-2">Line Chart</h4>
        <Line data={lineData} options={options} />
      </div>
    </div>
  );
};

export default Charts;
