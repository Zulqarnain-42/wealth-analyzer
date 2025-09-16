import { Doughnut } from "react-chartjs-2";
import { ChartOptions, ChartData } from "chart.js";

interface HalfDoughnutChartProps {
  data: ChartData<"doughnut">;
  options?: ChartOptions<"doughnut">;
  width?: number;
  height?: number;
}

export default function HalfDoughnutChart({ data, options, width = 300, height = 150 }: HalfDoughnutChartProps) {
  return (
    <div style={{ width, height }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}