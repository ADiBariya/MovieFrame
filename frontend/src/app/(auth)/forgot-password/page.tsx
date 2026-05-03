"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    await authApi.forgotPassword(data.email);
    setSuccess(true);
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#F9FAFB]">Reset password</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            We&apos;ll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="rounded-lg bg-emerald-950/50 border border-emerald-800 px-4 py-5 text-sm text-emerald-400 text-center">
            ✅ If that email exists, a reset link has been sent.
            <br />
            <Link href="/login" className="text-[#F59E0B] mt-3 inline-block font-medium">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Send reset link
            </Button>
            <p className="text-center text-sm text-[#9CA3AF]">
              <Link href="/login" className="text-[#F59E0B] hover:text-[#D97706] transition-colors">
                ← Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
