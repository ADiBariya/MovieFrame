"use client";

import { useEffect, useState } from "react";
import { Check, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { billingApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { BillingPlan, SubscriptionStatus } from "@/types";

export default function BillingPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([billingApi.plans(), billingApi.status()])
      .then(([p, s]) => { setPlans(p); setStatus(s); })
      .finally(() => setIsLoading(false));
  }, []);

  const currentPlan = user?.plan ?? "free";

  const handleSubscribe = async (planId: string) => {
    try {
      await billingApi.subscribe(planId);
    } catch {
      alert("Stripe integration coming soon! 🚧");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[#F9FAFB]">Billing</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Current plan banner */}
      {status && (
        <div className="rounded-xl bg-[#111118] border border-[#F59E0B]/20 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#9CA3AF]">Current plan</p>
            <p className="text-xl font-bold text-[#F9FAFB] capitalize mt-0.5">{status.plan}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">
              Status:{" "}
              <span className="text-emerald-400 font-medium capitalize">{status.status}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => billingApi.portal().catch(() => alert("Coming soon! 🚧"))}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Billing portal
            </Button>
          </div>
        </div>
      )}

      {/* Plans */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const isHighlighted = plan.id === "pro";

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 flex flex-col ${
                  isHighlighted && !isCurrent
                    ? "border-[#F59E0B]/50 bg-[#111118]"
                    : isCurrent
                    ? "border-emerald-600/50 bg-[#111118]"
                    : "border-[#1F2937] bg-[#111118]"
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
                      Current plan
                    </span>
                  </div>
                )}
                {isHighlighted && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-[#F59E0B] text-[#0A0A0F] text-xs font-bold">
                      Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#F9FAFB]">{plan.name}</h3>
                  <div className="flex items-end gap-1 mt-2">
                    <span className="text-3xl font-black text-[#F9FAFB]">${plan.price}</span>
                    <span className="text-[#9CA3AF] text-sm mb-1">/{plan.interval}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
                        <Check className="h-2.5 w-2.5 text-[#F59E0B]" />
                      </div>
                      <span className="text-[#D1D5DB]">{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="outline" size="sm" disabled>
                    Current plan
                  </Button>
                ) : (
                  <Button
                    variant={isHighlighted ? "primary" : "outline"}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {plan.price === 0 ? "Downgrade" : "Upgrade"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stripe note */}
      <div className="rounded-xl bg-[#1A1A25] border border-[#1F2937] p-4 text-sm text-[#9CA3AF]">
        🚧 <strong className="text-[#F9FAFB]">Stripe integration coming soon.</strong> Payment
        processing will be enabled in the next release.
      </div>
    </div>
  );
}
