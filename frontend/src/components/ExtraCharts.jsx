import React from 'react';
import { ResponsiveContainer, LineChart as RLineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

// LineChart: Complaints Over Time (dummy by date)
export function LineChart({ data, width = 260, height = 260 }) {
  // Group by date
  const grouped = {};
  data.forEach(c => {
    grouped[c.date] = (grouped[c.date] || 0) + 1;
  });
  const chartData = Object.entries(grouped).map(([date, count]) => ({ date, count }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RLineChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="count" stroke="#1976d2" strokeWidth={3} dot={{ r: 4 }} />
      </RLineChart>
    </ResponsiveContainer>
  );
}

// DoughnutChart: Priority Distribution
export function DoughnutChart({ data, width = 260, height = 260 }) {
  const priorities = ['High', 'Medium', 'Low', 'Critical'];
  const colors = ['#e53935', '#ffb300', '#1e88e5', '#8e24aa'];
  const grouped = {};
  data.forEach(c => {
    grouped[c.priority] = (grouped[c.priority] || 0) + 1;
  });
  const chartData = priorities.map((p, i) => ({ name: p, value: grouped[p] || 0, fill: colors[i] }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          label
        >
          {chartData.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.fill} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
} 