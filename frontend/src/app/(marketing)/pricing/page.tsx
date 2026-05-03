import { PricingSection } from "@/components/marketing/PricingSection";
import { CTASection } from "@/components/marketing/CTASection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — MovieFrame",
};

export default function PricingPage() {
  return (
    <>
      <div className="pt-24 pb-8 text-center">
        <h1 className="text-5xl font-black text-[#F9FAFB] mb-3">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-[#9CA3AF]">
          Start free. No credit card required.
        </p>
      </div>
      <PricingSection />
      <CTASection />
    </>
  );
}
