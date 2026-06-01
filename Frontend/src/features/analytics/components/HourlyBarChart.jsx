import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function HourlyBarChart({ data }) {
  const hasActivity = data.some((d) => d.events > 0);

  if (!hasActivity) {
    return <p className="inline-msg inline-msg--muted">No hourly activity recorded yet.</p>;
  }

  return (
    <div className="chart-panel">
      <h3>Hour-of-day activity</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="hourLabel" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="events" name="Events" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
