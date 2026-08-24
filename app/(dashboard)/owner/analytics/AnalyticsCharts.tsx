"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export interface DailyDataPoint {
  date: string;
  fullDate: string;
  bookings: number;
  revenue: number;
}

interface AnalyticsChartsProps {
  data: DailyDataPoint[];
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const item = payload[0].payload as DailyDataPoint;
    return (
      <div className="rounded-xl border border-white/10 bg-[#161b22]/95 backdrop-blur-md p-3 shadow-xl text-xs space-y-1">
        <p className="font-bold text-slate-100">{item.fullDate}</p>
        <p className="text-brand-300 font-semibold">
          🎟️ Bookings: <span className="text-white">{item.bookings}</span>
        </p>
        <p className="text-emerald-400 font-semibold">
          💳 Revenue: <span className="text-white">₹{item.revenue.toFixed(0)}</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[550px] sm:min-w-0 h-[320px] sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#273647" opacity={0.6} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#273647" }}
            />
            <YAxis
              allowDecimals={false}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#273647" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="bookings"
              name="Bookings"
              fill="#a078ff"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
