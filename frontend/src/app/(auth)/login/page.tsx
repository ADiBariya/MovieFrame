"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch {
      setServerError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#F9FAFB]">Welcome back</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Sign in to your MovieFrame account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-[#F59E0B] hover:text-[#D97706] transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {serverError && (
            <div className="rounded-lg bg-red-950/50 border border-red-900 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="md"
            isLoading={isSubmitting}
          >
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-[#9CA3AF] mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#F59E0B] hover:text-[#D97706] font-medium transition-colors"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
