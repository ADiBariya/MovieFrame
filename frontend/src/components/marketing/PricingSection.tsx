"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    description: "Perfect for getting started",
    features: [
      "1 post per day",
      "Twitter/X only",
      "Basic analytics (7 days)",
      "Community support",
      "Duplicate prevention",
    ],
    cta: "Get started free",
    href: "/register",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    interval: "month",
    description: "For serious content creators",
    features: [
      "Unlimited posts",
      "Twitter/X + Instagram",
      "Advanced analytics (90 days)",
      "Priority email support",
      "Custom hashtags & captions",
      "Scheduling & intervals",
    ],
    cta: "Start Pro trial",
    href: "/register?plan=pro",
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    price: 49,
    interval: "month",
    description: "For agencies & power users",
    features: [
      "Everything in Pro",
      "All platforms (+ Reddit)",
      "Unlimited analytics history",
      "Team accounts (5 seats)",
      "API access",
      "Dedicated account manager",
      "White-label reports",
    ],
    cta: "Contact us",
    href: "/register?plan=business",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-[#F9FAFB] mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-lg text-[#9CA3AF]">
          Start free. Upgrade when you grow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-8 flex flex-col transition-all duration-300 ${
              plan.highlighted
                ? "bg-[#111118] border-[#F59E0B] animate-glow"
                : "bg-[#111118] border-[#1F2937] hover:border-[#374151]"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-[#F59E0B] text-[#0A0A0F] text-xs font-bold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#F9FAFB] mb-1">{plan.name}</h3>
              <p className="text-sm text-[#9CA3AF]">{plan.description}</p>
            </div>

            <div className="mb-8">
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-[#F9FAFB]">
                  ${plan.price}
                </span>
                <span className="text-[#9CA3AF] text-sm mb-1.5">
                  /{plan.interval}
                </span>
              </div>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
                    <Check className="h-3 w-3 text-[#F59E0B]" />
                  </div>
                  <span className="text-[#D1D5DB]">{f}</span>
                </li>
              ))}
            </ul>

            <Link href={plan.href}>
              <Button
                variant={plan.highlighted ? "primary" : "outline"}
                className="w-full"
                size="md"
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
