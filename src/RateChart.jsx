import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
);

const RANGES = {
  "1d": 1,
  "1w": 7,
  "1m": 30,
  "3m": 90,
  "1y": 365,
  "5y": 1825,
};

function RateChart({ base, symbol }) {
  const [range, setRange] = useState("1m");
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setError(false);
      setData(null);

      const today = new Date();
      const start = new Date();
      start.setDate(today.getDate() - RANGES[range]);

      const startStr = start.toISOString().slice(0, 10);
      const endStr = today.toISOString().slice(0, 10);

      try {
        const res = await fetch(
          `https://api.frankfurter.dev/v1/${startStr}..${endStr}?base=${base}&symbols=${symbol}`
        );
        if (!res.ok) throw new Error("API error");
        const json = await res.json();

        const dates = Object.keys(json.rates).sort();
        const values = dates.map((d) => json.rates[d][symbol]);

        setData({ dates, values });
      } catch (err) {
        setError(true);
      }
    };

    fetchHistory();
  }, [base, symbol, range]);

  if (error) {
    return (
      <div className="chart-error">
        <p>No chart data available</p>
        <p className="empty">
          We couldn't load rate history for {base}/{symbol} right now. This
          usually clears up in a minute.
        </p>
      </div>
    );
  }

  if (!data) {
    return <p>Chargement de l'historique...</p>;
  }

  const openRate = data.values[0];
  const lastRate = data.values[data.values.length - 1];
  const change = (lastRate - openRate).toFixed(4);
  const percentChange = (((lastRate - openRate) / openRate) * 100).toFixed(2);
  const isUp = lastRate >= openRate;

  const chartData = {
    labels: data.dates,
    datasets: [
      {
        data: data.values,
        borderColor: isUp ? "#4ade80" : "#f87171",
        backgroundColor: isUp
          ? "rgba(74, 222, 128, 0.1)"
          : "rgba(248, 113, 113, 0.1)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { display: false },
      y: { display: true, ticks: { color: "#888" } },
    },
  };

  return (
    <div className="rate-chart">
      <div className="chart-stats">
        <div>
          <span className="chart-label">Open</span>
          <span>{openRate.toFixed(4)}</span>
        </div>
        <div>
          <span className="chart-label">Last</span>
          <span>{lastRate.toFixed(4)}</span>
        </div>
        <div>
          <span className="chart-label">Change</span>
          <span className={isUp ? "up" : "down"}>{change}</span>
        </div>
        <div>
          <span className="chart-label">% change</span>
          <span className={isUp ? "up" : "down"}>
            {isUp ? "▲" : "▼"} {Math.abs(percentChange)}%
          </span>
        </div>
      </div>

      <div className="range-selector">
        {Object.keys(RANGES).map((r) => (
          <button
            key={r}
            className={range === r ? "active" : ""}
            onClick={() => setRange(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export default RateChart;