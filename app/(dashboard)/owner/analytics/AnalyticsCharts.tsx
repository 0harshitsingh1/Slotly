"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
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
      <div className="rounded-xl border border-white/10 bg-[#161b22]/95 backdrop-blur-md p-4 shadow-xl text-xs space-y-2 z-50">
        <p className="font-bold text-slate-100 border-b border-white/10 pb-1 mb-2">{item.fullDate}</p>
        <div className="flex items-center justify-between gap-4">
          <p className="text-brand-300 font-semibold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-500 inline-block" /> Bookings
          </p>
          <span className="text-white font-bold">{item.bookings}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> Revenue
          </p>
          <span className="text-white font-bold">₹{item.revenue.toFixed(0)}</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[650px] sm:min-w-0 h-[380px] sm:h-[420px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#273647" opacity={0.6} vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#273647" }}
              tickMargin={10}
            />
            
            {/* Left Y-Axis for Bookings */}
            <YAxis
              yAxisId="left"
              allowDecimals={false}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            
            {/* Right Y-Axis for Revenue */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => `₹${value}`}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}
            />
            
            {/* Bookings Bar */}
            <Bar
              yAxisId="left"
              dataKey="bookings"
              name="Bookings"
              fill="#a078ff"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            
            {/* Revenue Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              name="Revenue (₹)"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#161b22', stroke: '#10b981', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
