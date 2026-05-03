"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Film,
  LayoutDashboard,
  Zap,
  Link2,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/automations", label: "Automations", icon: Zap },
  { href: "/platforms", label: "Platforms", icon: Link2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#111118] border-r border-[#1F2937] flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-16 px-5 border-b border-[#1F2937]">
        <div className="w-8 h-8 rounded-lg bg-[#F59E0B] flex items-center justify-center flex-shrink-0">
          <Film className="h-5 w-5 text-[#0A0A0F]" />
        </div>
        <span className="font-bold text-[#F9FAFB]">MovieFrame</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                  : "text-[#9CA3AF] hover:bg-[#1A1A25] hover:text-[#F9FAFB]"
              )}
            >
              <Icon className="h-4.5 w-4.5 flex-shrink-0" />
              {label}
              {active && (
                <div className="ml-auto w-1 h-4 rounded-full bg-[#F59E0B]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-[#1F2937]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#EC4899] flex items-center justify-center text-xs font-bold text-[#0A0A0F] flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F9FAFB] truncate">{user?.name}</p>
            <p className="text-xs text-[#9CA3AF] truncate capitalize">{user?.plan} plan</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#9CA3AF] hover:bg-[#1A1A25] hover:text-red-400 transition-colors mt-1"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
