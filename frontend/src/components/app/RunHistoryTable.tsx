"use client";

import { Eye } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import type { AutomationRun } from "@/types";

interface RunHistoryTableProps {
  runs: AutomationRun[];
  isLoading?: boolean;
  onViewLogs?: (run: AutomationRun) => void;
}

export function RunHistoryTable({
  runs,
  isLoading,
  onViewLogs,
}: RunHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-[#111118] border border-[#1F2937] overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="rounded-xl bg-[#111118] border border-[#1F2937] p-12 text-center">
        <p className="text-[#9CA3AF] text-sm">
          No runs yet. Trigger your first automation to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#111118] border border-[#1F2937] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1F2937]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                Movie
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider hidden md:table-cell">
                Started
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider hidden lg:table-cell">
                Platform
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {runs.map((run) => (
              <tr key={run.id} className="hover:bg-[#1A1A25]/50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-[#F9FAFB]">
                  {run.movie_title ?? (
                    <span className="text-[#6B7280] italic">Pending…</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={run.status} />
                </td>
                <td className="px-5 py-3.5 text-[#9CA3AF] hidden md:table-cell">
                  {run.started_at ? formatDate(run.started_at) : "—"}
                </td>
                <td className="px-5 py-3.5 hidden lg:table-cell">
                  <span className="capitalize text-[#9CA3AF]">
                    {run.config?.platform ?? "twitter"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  {onViewLogs && (
                    <button
                      onClick={() => onViewLogs(run)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#F59E0B] transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Logs
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
