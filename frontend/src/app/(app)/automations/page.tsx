"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Play, RefreshCw } from "lucide-react";
import { RunHistoryTable } from "@/components/app/RunHistoryTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useAutomations } from "@/hooks/useAutomations";
import type { AutomationRun } from "@/types";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  pages_to_scrape: z.number().min(1).max(10),
  hashtags: z.string().min(1, "Add at least one hashtag"),
  platform: z.string().default("twitter"),
});

type FormValues = z.infer<typeof schema>;

export default function AutomationsPage() {
  const { runs, isLoading, isTriggering, fetchRuns, triggerRun } = useAutomations();
  const [selectedRun, setSelectedRun] = useState<AutomationRun | null>(null);
  const [triggerSuccess, setTriggerSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as import("react-hook-form").Resolver<FormValues>,
    defaultValues: {
      pages_to_scrape: 3,
      hashtags: "#Cinema #MovieFrames #Cinemaframes",
      platform: "twitter",
    },
  });

  const onSubmit = async (data: FormValues) => {
    await triggerRun({
      pages_to_scrape: data.pages_to_scrape,
      hashtags: data.hashtags.split(/\s+/).filter(Boolean),
      platform: data.platform,
    });
    setTriggerSuccess(true);
    setTimeout(() => setTriggerSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-[#F9FAFB]">Automations</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Configure and trigger your cinema frame automation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Post Movie Frame</CardTitle>
            <CardDescription>
              Scrape a cinematic frame and post it to your connected platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Pages to scrape (1–10)"
                type="number"
                error={errors.pages_to_scrape?.message}
                {...register("pages_to_scrape")}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#F9FAFB]">Platform</label>
                <select
                  className="h-10 rounded-lg bg-[#1A1A25] border border-[#1F2937] text-[#F9FAFB] px-3 text-sm focus:outline-none focus:border-[#F59E0B]"
                  {...register("platform")}
                >
                  <option value="twitter">Twitter / X</option>
                  <option value="instagram">Instagram</option>
                  <option value="reddit">Reddit</option>
                </select>
              </div>
              <Input
                label="Hashtags (space-separated)"
                placeholder="#Cinema #MovieFrames"
                error={errors.hashtags?.message}
                {...register("hashtags")}
              />

              {triggerSuccess && (
                <div className="rounded-lg bg-emerald-950/50 border border-emerald-800 px-3 py-2 text-sm text-emerald-400">
                  ✅ Run queued successfully!
                </div>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                isLoading={isTriggering}
              >
                <Play className="h-4 w-4" />
                Run now
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Run history */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F9FAFB]">Run history</h2>
            <button
              onClick={fetchRuns}
              className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#F59E0B] transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
          <RunHistoryTable
            runs={runs}
            isLoading={isLoading}
            onViewLogs={setSelectedRun}
          />
        </div>
      </div>

      {/* Logs modal */}
      <Modal
        isOpen={Boolean(selectedRun)}
        onClose={() => setSelectedRun(null)}
        title="Run logs"
        className="max-w-2xl"
      >
        <div className="space-y-1 text-xs font-mono bg-[#0A0A0F] rounded-lg p-4 max-h-96 overflow-y-auto">
          {selectedRun?.logs.map((log, i) => (
            <p
              key={i}
              className={
                log.includes("ERROR")
                  ? "text-red-400"
                  : log.includes("completed")
                  ? "text-emerald-400"
                  : "text-[#9CA3AF]"
              }
            >
              {log}
            </p>
          ))}
        </div>
        {selectedRun?.started_at && (
          <p className="mt-3 text-xs text-[#6B7280]">
            Started: {formatDate(selectedRun.started_at)}
            {selectedRun.finished_at && ` · Finished: ${formatDate(selectedRun.finished_at)}`}
          </p>
        )}
      </Modal>
    </div>
  );
}
