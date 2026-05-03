"use client";

import { cn } from "@/lib/utils";
import type { RunStatus } from "@/types";

const STATUS_CONFIG: Record<
  RunStatus,
  { label: string; className: string; dotColor: string }
> = {
  queued: {
    label: "Queued",
    className: "bg-[#1A1A25] text-[#9CA3AF] border-[#374151]",
    dotColor: "bg-[#9CA3AF]",
  },
  running: {
    label: "Running",
    className: "bg-blue-950/50 text-blue-400 border-blue-800",
    dotColor: "bg-blue-400",
  },
  succeeded: {
    label: "Succeeded",
    className: "bg-emerald-950/50 text-emerald-400 border-emerald-800",
    dotColor: "bg-emerald-400",
  },
  failed: {
    label: "Failed",
    className: "bg-red-950/50 text-red-400 border-red-900",
    dotColor: "bg-red-400",
  },
};

interface StatusBadgeProps {
  status: RunStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.queued;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          config.dotColor,
          status === "running" && "animate-pulse"
        )}
      />
      {config.label}
    </span>
  );
}
