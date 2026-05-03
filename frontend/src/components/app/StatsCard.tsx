import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "#F59E0B",
}: StatsCardProps) {
  return (
    <div className="rounded-xl bg-[#111118] border border-[#1F2937] p-5 hover:border-[#374151] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-[#9CA3AF]">{title}</p>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-[#F9FAFB] mb-1">{value}</p>
      {subtitle && <p className="text-xs text-[#9CA3AF]">{subtitle}</p>}
      {trend && (
        <div
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium mt-2",
            trend.value >= 0 ? "text-emerald-400" : "text-red-400"
          )}
        >
          {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </div>
  );
}
