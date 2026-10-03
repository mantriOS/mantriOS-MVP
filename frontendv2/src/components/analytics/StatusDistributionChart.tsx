import { useNavigate } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Layers, ArrowRight } from "lucide-react";
import type { CountByValue } from "@/types/petition";

interface StatusDistributionChartProps {
  data: CountByValue[];
  total: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  analysed: "#6366f1",
  forwarded: "#0284c7",
  resolved: "#10b981",
  rejected: "#f43f5e",
  analysis_failed: "#94a3b8",
};

export function StatusDistributionChart({ data, total }: StatusDistributionChartProps) {
  const navigate = useNavigate();

  const chartData = data.map((item) => ({
    name: item.value.replace(/_/g, " "),
    statusKey: item.value,
    count: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));

  const handleStatusClick = (statusKey: string) => {
    if (statusKey) {
      navigate({
        to: "/inbox",
        search: { status: statusKey, priority: "all", department: "all", q: "", page: 1 },
      });
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Layers className="size-4 text-slate-600" /> Status Distribution
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Current processing stages of citizen grievances
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm text-xs space-y-1">
                      <p className="font-bold text-slate-900 capitalize">{item.name}</p>
                      <p className="text-slate-600">{item.count} petitions ({item.percentage}%)</p>
                      <p className="text-[10px] text-slate-400">Click to filter inbox</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.statusKey}
                  fill={STATUS_COLORS[entry.statusKey.toLowerCase()] ?? "#334155"}
                  className="cursor-pointer"
                  onClick={() => handleStatusClick(entry.statusKey)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible Text Legend & Clickable Category Pills */}
      <div className="border-t border-slate-100 pt-3.5 space-y-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
          Accessible Stage Breakdown
        </span>
        <div className="flex flex-wrap gap-2">
          {chartData.map((item) => (
            <button
              key={item.statusKey}
              onClick={() => handleStatusClick(item.statusKey)}
              className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs transition-colors hover:bg-slate-100 hover:border-slate-300"
            >
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_COLORS[item.statusKey.toLowerCase()] ?? "#334155" }}
              />
              <span className="font-medium text-slate-800 capitalize">{item.name}</span>
              <span className="font-bold text-slate-900">{item.count}</span>
              <span className="text-[10px] text-slate-400">({item.percentage}%)</span>
              <ArrowRight className="size-3 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
