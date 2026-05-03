import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#1A1A25] to-[#111118] border border-[#F59E0B]/20 p-12 text-center relative overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#F59E0B]/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-32 bg-[#6366F1]/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black text-[#F9FAFB] mb-4">
            Start posting{" "}
            <span className="gradient-text">beautiful frames</span>
            <br />
            today
          </h2>
          <p className="text-lg text-[#9CA3AF] mb-8 max-w-xl mx-auto">
            No manual curation. No scheduling headaches. Just pure cinematic
            content, delivered automatically to your audience.
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Get started for free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-[#6B7280]">
            Free forever · No credit card needed
          </p>
        </div>
      </div>
    </section>
  );
}
