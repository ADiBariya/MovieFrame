"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Share2, Camera, MessageSquare, Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { platformsApi } from "@/lib/api";
import type { Platform } from "@/types";
import { formatDate } from "@/lib/utils";

const PLATFORM_META = {
  twitter: { label: "Twitter / X", icon: Share2, color: "#1DA1F2" },
  instagram: { label: "Instagram", icon: Camera, color: "#E1306C" },
  reddit: { label: "Reddit", icon: MessageSquare, color: "#FF4500" },
};

const schema = z.object({
  platform: z.string().min(1),
  api_key: z.string().min(1, "Required"),
  api_secret: z.string().min(1, "Required"),
  access_token: z.string().optional(),
  access_secret: z.string().optional(),
  bearer_token: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectModal, setConnectModal] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { platform: "twitter" },
  });

  const loadPlatforms = async () => {
    try {
      const data = await platformsApi.list();
      setPlatforms(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadPlatforms(); }, []);

  const onConnect = async (data: FormValues) => {
    setConnecting(true);
    setError(null);
    try {
      const p = await platformsApi.connect(data);
      setPlatforms((prev) => [...prev.filter((x) => x.platform !== p.platform), p]);
      setConnectModal(false);
      reset();
    } catch {
      setError("Failed to connect platform. Check your credentials.");
    } finally {
      setConnecting(false);
    }
  };

  const onDisconnect = async (id: string) => {
    try {
      await platformsApi.disconnect(id);
      setPlatforms((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // ignore
    }
  };

  const connectedSet = new Set(platforms.map((p) => p.platform));

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F9FAFB]">Platforms</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Connect your social accounts to enable automated posting.
          </p>
        </div>
        <Button onClick={() => setConnectModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Connect platform
        </Button>
      </div>

      {/* Platform cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["twitter", "instagram", "reddit"] as const).map((key) => {
            const meta = PLATFORM_META[key];
            const connected = connectedSet.has(key);
            const platformData = platforms.find((p) => p.platform === key);

            return (
              <div
                key={key}
                className="rounded-xl bg-[#111118] border border-[#1F2937] p-5 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${meta.color}15` }}
                    >
                      <meta.icon className="h-5 w-5" style={{ color: meta.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#F9FAFB]">{meta.label}</p>
                      {platformData?.username && (
                        <p className="text-xs text-[#9CA3AF]">@{platformData.username}</p>
                      )}
                    </div>
                  </div>
                  {connected ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-[#374151]" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      connected
                        ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800"
                        : "bg-[#1A1A25] text-[#9CA3AF] border border-[#374151]"
                    }`}
                  >
                    {connected ? "Connected" : "Not connected"}
                  </span>
                  {platformData?.connected_at && (
                    <span className="text-xs text-[#6B7280]">
                      {formatDate(platformData.connected_at)}
                    </span>
                  )}
                </div>

                {connected && platformData ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2 self-start"
                    onClick={() => onDisconnect(platformData.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 self-start"
                    onClick={() => setConnectModal(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Connect
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Connect modal */}
      <Modal
        isOpen={connectModal}
        onClose={() => { setConnectModal(false); reset(); setError(null); }}
        title="Connect platform"
      >
        <form onSubmit={handleSubmit(onConnect)} className="space-y-4">
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
          <Input label="API Key" error={errors.api_key?.message} {...register("api_key")} />
          <Input label="API Secret" error={errors.api_secret?.message} {...register("api_secret")} />
          <Input label="Access Token" {...register("access_token")} />
          <Input label="Access Secret" {...register("access_secret")} />
          <Input label="Bearer Token (optional)" {...register("bearer_token")} />

          {error && (
            <div className="rounded-lg bg-red-950/50 border border-red-900 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={connecting}>
            Connect
          </Button>
        </form>
      </Modal>
    </div>
  );
}
