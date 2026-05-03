"use client";

export function SkeletonCard() {
  return (
    <div className="rounded-xl bg-[#111118] border border-[#1F2937] p-6 animate-pulse">
      <div className="h-4 bg-[#1A1A25] rounded w-1/3 mb-3" />
      <div className="h-8 bg-[#1A1A25] rounded w-1/2 mb-2" />
      <div className="h-3 bg-[#1A1A25] rounded w-2/3" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-[#1F2937] animate-pulse">
      <div className="h-4 bg-[#1A1A25] rounded w-1/4" />
      <div className="h-4 bg-[#1A1A25] rounded w-1/6" />
      <div className="h-4 bg-[#1A1A25] rounded w-1/4" />
      <div className="h-4 bg-[#1A1A25] rounded w-1/6" />
    </div>
  );
}

export function SkeletonText({ className }: { className?: string }) {
  return <div className={`h-4 bg-[#1A1A25] rounded animate-pulse ${className ?? "w-full"}`} />;
}
