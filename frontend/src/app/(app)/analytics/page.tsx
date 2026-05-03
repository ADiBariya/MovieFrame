"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { BarChart3, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { StatsCard } from "@/components/app/StatsCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { analyticsApi } from "@/lib/api";
import type { AnalyticsOverview, HistoryPoint } from "@/types";

const TOOLTIP_STYLE = {
  backgroundColor: "#111118",
  border: "1px solid #1F2937",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#F9FAFB",
};

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.overview(),
      analyticsApi.history(30),
    ]).then(([ov, hist]) => {
      setOverview(ov);
      setHistory(hist);
    }).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-[#F9FAFB]">Analytics</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Track your automation performance and content engagement.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading || !overview ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatsCard
              title="Total Posts"
              value={overview.successful_runs}
              icon={<CheckCircle className="h-5 w-5" />}
              color="#10B981"
              subtitle="All time"
            />
            <StatsCard
              title="Success Rate"
              value={`${overview.success_rate}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              color="#F59E0B"
              subtitle={`${overview.failed_runs} failed`}
            />
            <StatsCard
              title="Total Runs"
              value={overview.total_runs}
              icon={<BarChart3 className="h-5 w-5" />}
              color="#6366F1"
              subtitle="Automations triggered"
            />
            <StatsCard
              title="Time Saved"
              value={`${overview.time_saved_hours}h`}
              icon={<Clock className="h-5 w-5" />}
              color="#EC4899"
              subtitle="vs manual posting"
            />
          </>
        )}
      </div>

      {/* Area chart */}
      <div className="rounded-xl bg-[#111118] border border-[#1F2937] p-6">
        <h2 className="text-base font-semibold text-[#F9FAFB] mb-6">
          Posts over time (last 30 days)
        </h2>
        {history.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="postsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="posts"
                stroke="#F59E0B"
                strokeWidth={2}
                fill="url(#postsGrad)"
                name="Posts"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-sm text-[#9CA3AF]">
            No data yet — run your first automation!
          </div>
        )}
      </div>

      {/* Bar chart */}
      <div className="rounded-xl bg-[#111118] border border-[#1F2937] p-6">
        <h2 className="text-base font-semibold text-[#F9FAFB] mb-6">
          Success vs Failed runs
        </h2>
        {history.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={history.slice(-14)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#9CA3AF" }} />
              <Bar dataKey="posts" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Succeeded" />
              <Bar dataKey="failures" fill="#EF4444" radius={[4, 4, 0, 0]} name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-52 flex items-center justify-center text-sm text-[#9CA3AF]">
            No data yet.
          </div>
        )}
      </div>
    </div>
  );
}
