"use client";

import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-[#1F2937] bg-[#0A0A0F] flex items-center justify-between px-6">
      <div>
        {title && (
          <h1 className="text-lg font-semibold text-[#F9FAFB]">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-[#1A1A25] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F59E0B]" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#EC4899] flex items-center justify-center text-xs font-bold text-[#0A0A0F]">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <span className="text-sm font-medium text-[#F9FAFB] hidden sm:block">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}
