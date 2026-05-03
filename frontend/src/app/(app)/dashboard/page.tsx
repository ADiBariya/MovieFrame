"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, BarChart3, Link2, Play } from "lucide-react";
import { StatsCard } from "@/components/app/StatsCard";
import { RunHistoryTable } from "@/components/app/RunHistoryTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useAutomations } from "@/hooks/useAutomations";
import { analyticsApi, platformsApi } from "@/lib/api";
import type { AnalyticsOverview, AutomationRun } from "@/types";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { runs, isLoading: runsLoading, fetchRuns } = useAutomations();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [platformCount, setPlatformCount] = useState(0);
  const [selectedRun, setSelectedRun] = useState<AutomationRun | null>(null);

  useEffect(() => {
    analyticsApi.overview().then(setOverview).catch(() => null);
    platformsApi.list().then((p) => setPlatformCount(p.length)).catch(() => null);
  }, []);

  const recentRuns = runs.slice(0, 5);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F9FAFB]">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            Here&apos;s what&apos;s happening with your automation
          </p>
        </div>
        <Link href="/automations">
          <Button className="gap-2">
            <Play className="h-4 w-4" />
            Run automation
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {overview ? (
          <>
            <StatsCard
              title="Total Runs"
              value={overview.total_runs}
              icon={<Zap className="h-5 w-5" />}
              color="#F59E0B"
              subtitle="All time"
            />
            <StatsCard
              title="Success Rate"
              value={`${overview.success_rate}%`}
              icon={<BarChart3 className="h-5 w-5" />}
              color="#10B981"
              subtitle={`${overview.successful_runs} successful`}
            />
            <StatsCard
              title="Posts Today"
              value={overview.posts_today}
              icon={<Play className="h-5 w-5" />}
              color="#6366F1"
              subtitle="Last 24 hours"
            />
            <StatsCard
              title="Connected Platforms"
              value={platformCount}
              icon={<Link2 className="h-5 w-5" />}
              color="#EC4899"
              subtitle={platformCount === 0 ? "None connected" : "Active"}
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        )}
      </div>

      {/* Recent runs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#F9FAFB]">Recent runs</h2>
          <button
            onClick={fetchRuns}
            className="text-xs text-[#9CA3AF] hover:text-[#F59E0B] transition-colors"
          >
            Refresh ↻
          </button>
        </div>
        <RunHistoryTable
          runs={recentRuns}
          isLoading={runsLoading}
          onViewLogs={setSelectedRun}
        />
      </div>

      {/* Logs modal */}
      <Modal
        isOpen={Boolean(selectedRun)}
        onClose={() => setSelectedRun(null)}
        title={`Run logs — ${selectedRun?.movie_title ?? selectedRun?.id}`}
        className="max-w-2xl"
      >
        <div className="space-y-1 text-xs font-mono bg-[#0A0A0F] rounded-lg p-4 max-h-80 overflow-y-auto">
          {selectedRun?.logs.length === 0 && (
            <p className="text-[#9CA3AF]">No logs yet…</p>
          )}
          {selectedRun?.logs.map((log, i) => (
            <p key={i} className={log.includes("ERROR") ? "text-red-400" : "text-[#9CA3AF]"}>
              {log}
            </p>
          ))}
        </div>
        <div className="mt-4 text-xs text-[#9CA3AF]">
          {selectedRun?.started_at && (
            <span>Started: {formatDate(selectedRun.started_at)}</span>
          )}
        </div>
      </Modal>
    </div>
  );
}
