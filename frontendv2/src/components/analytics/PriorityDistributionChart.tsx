import { useNavigate } from "@tanstack/react-router";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { CountByValue } from "@/types/petition";

interface PriorityDistributionChartProps {
  data: CountByValue[];
  total: number;
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#f43f5e",
  MEDIUM: "#f59e0b",
  LOW: "#10b981",
};

export function PriorityDistributionChart({ data, total }: PriorityDistributionChartProps) {
  const navigate = useNavigate();

  const chartData = data.map((item) => ({
    name: item.value.toUpperCase(),
    priorityKey: item.value.toUpperCase(),
    count: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));

  const handlePriorityClick = (priorityKey: string) => {
    if (priorityKey) {
      navigate({
        to: "/inbox",
        search: { priority: priorityKey, status: "all", department: "all", q: "", page: 1 },
      });
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <AlertTriangle className="size-4 text-slate-600" /> Priority Distribution
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Urgency classification levels determined by AI triage
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="name"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={4}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.priorityKey}
                  fill={PRIORITY_COLORS[entry.priorityKey] ?? "#64748b"}
                  className="cursor-pointer"
                  onClick={() => handlePriorityClick(entry.priorityKey)}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm text-xs space-y-1">
                      <p className="font-bold text-slate-900">{item.name} Priority</p>
                      <p className="text-slate-600">{item.count} petitions ({item.percentage}%)</p>
                      <p className="text-[10px] text-slate-400">Click to filter inbox</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible Text Legend */}
      <div className="border-t border-slate-100 pt-3.5 space-y-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
          Priority Level Breakdown
        </span>
        <div className="grid gap-2 sm:grid-cols-3">
          {chartData.map((item) => (
            <button
              key={item.priorityKey}
              onClick={() => handlePriorityClick(item.priorityKey)}
              className="group flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-xs transition-colors hover:bg-slate-100 hover:border-slate-300"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PRIORITY_COLORS[item.priorityKey] ?? "#64748b" }}
                />
                <span className="font-bold text-slate-900">{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="font-semibold text-slate-700">{item.count}</span>
                <span className="text-slate-400">({item.percentage}%)</span>
                <ArrowRight className="size-3 text-slate-400 group-hover:text-slate-700" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
