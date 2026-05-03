"use client";

import Link from "next/link";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 glass border-b border-[#1F2937]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B] flex items-center justify-center">
              <Film className="h-5 w-5 text-[#0A0A0F]" />
            </div>
            <span className="font-bold text-lg text-[#F9FAFB]">MovieFrame</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">
              Pricing
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
