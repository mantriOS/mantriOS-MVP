import { useNavigate } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Building2, ArrowRight } from "lucide-react";
import type { CountByValue } from "@/types/petition";

interface DepartmentDistributionChartProps {
  data: CountByValue[];
  total: number;
}

export function DepartmentDistributionChart({ data, total }: DepartmentDistributionChartProps) {
  const navigate = useNavigate();

  const chartData = data.map((item) => ({
    name: item.value,
    count: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));

  const handleDeptClick = (deptCode: string) => {
    if (deptCode) {
      navigate({
        to: "/inbox",
        search: { department: deptCode, status: "all", priority: "all", q: "", page: 1 },
      });
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Building2 className="size-4 text-slate-600" /> Department Volume Breakdown
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Workload distribution by classified government department code
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
                      <p className="font-bold text-slate-900">Dept: {item.name}</p>
                      <p className="text-slate-600">{item.count} petitions ({item.percentage}%)</p>
                      <p className="text-[10px] text-slate-400">Click to filter inbox</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#0f172a" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={index % 2 === 0 ? "#0f172a" : "#334155"}
                  className="cursor-pointer"
                  onClick={() => handleDeptClick(entry.name)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ranked Department List */}
      <div className="border-t border-slate-100 pt-3.5 space-y-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
          Ranked Department Workload
        </span>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {chartData.map((item) => (
            <button
              key={item.name}
              onClick={() => handleDeptClick(item.name)}
              className="group flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-xs transition-colors hover:bg-slate-100 hover:border-slate-300"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-slate-900 truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] shrink-0">
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
