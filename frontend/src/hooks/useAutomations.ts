"use client";

import { useCallback, useEffect, useState } from "react";
import { automationsApi } from "@/lib/api";
import type { AutomationConfig, AutomationRun } from "@/types";

export function useAutomations() {
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await automationsApi.listRuns();
      setRuns(data);
    } catch {
      setError("Failed to load automation runs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  const triggerRun = useCallback(
    async (config: AutomationConfig) => {
      setIsTriggering(true);
      setError(null);
      try {
        const run = await automationsApi.triggerRun(config);
        setRuns((prev) => [run, ...prev]);
        return run;
      } catch {
        setError("Failed to trigger automation");
        throw new Error("Failed to trigger automation");
      } finally {
        setIsTriggering(false);
      }
    },
    []
  );

  return { runs, isLoading, isTriggering, error, fetchRuns, triggerRun };
}
