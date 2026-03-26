"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";

export default function Chart({ chart }: any) {

  if (!chart || !chart.data || chart.data.length === 0) {
    return <p style={{ color: "#888" }}>No chart data available</p>;
  }

  const { data, type } = chart;

  const COLORS = ["#4CAF50", "#FF5252", "#FFC107", "#2196F3"];

  return (
    <div
      style={{
        width: "100%",
        height: 320,
        background: "#ffffff",
        borderRadius: "12px",
        padding: "10px"
      }}
    >
      <ResponsiveContainer width="100%" height="100%">

        {/* BAR */}
        {type === "bar" && (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#4CAF50" />
          </BarChart>
        )}

        {/* PIE */}
        {type === "pie" && (
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              paddingAngle={3}
              label={({ name, percent }: any) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((_: any, index: number) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        )}

        {/* LINE */}
        {type === "line" && (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line dataKey="value" stroke="#2196F3" strokeWidth={3} />
          </LineChart>
        )}

      </ResponsiveContainer>
    </div>
  );
}