"use client";

import Link from "next/link";
import { Play, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const FILM_TITLES = [
  "Blade Runner 2049",
  "The Godfather",
  "2001: A Space Odyssey",
  "Inception",
  "Parasite",
  "Mad Max: Fury Road",
  "Her",
  "Drive",
  "The Grand Budapest Hotel",
  "No Country for Old Men",
  "Mulholland Drive",
  "Apocalypse Now",
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#F59E0B]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[300px] bg-[#6366F1]/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-[#EC4899]/5 rounded-full blur-[100px]" />
      </div>

      {/* Film strip */}
      <div className="absolute top-20 inset-x-0 overflow-hidden opacity-10">
        <div className="flex gap-4 animate-filmstrip" style={{ width: "200%" }}>
          {[...FILM_TITLES, ...FILM_TITLES].map((title, i) => (
            <div
              key={i}
              className="flex-shrink-0 h-12 px-4 rounded-lg bg-[#1A1A25] border border-[#1F2937] flex items-center whitespace-nowrap text-xs text-[#9CA3AF]"
            >
              🎬 {title}
            </div>
          ))}
        </div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-medium mb-8">
          <Zap className="h-3.5 w-3.5" />
          Fully automated · Zero manual work
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
          <span className="text-[#F9FAFB]">Post cinematic</span>
          <br />
          <span className="gradient-text">frames on autopilot</span>
        </h1>

        <p className="text-lg sm:text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-10 leading-relaxed">
          MovieFrame scrapes stunning film frames from film-grab.com and posts
          them to Twitter/X automatically — while you focus on what matters.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#demo">
            <Button variant="outline" size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              See it in action
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-10 text-sm text-[#6B7280]">
          No credit card required · Free tier available · Setup in 2 minutes
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#0A0A0F] to-transparent pointer-events-none" />
    </section>
  );
}
