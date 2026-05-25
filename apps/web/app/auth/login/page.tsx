"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface LoginForm {
  email: string;
  password: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;
      toast.success("Bine ai revenit!");
      router.replace(next);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Email sau parolă incorecte.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="card p-8">
      <h1 className="text-h3 font-gilroy mb-2">Bine ai revenit</h1>
      <p className="text-[14px] text-ink-3 mb-7">
        Conectează-te la contul tău Convia.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="nume@firma.ro"
            autoComplete="email"
            className="input"
            {...register("email", {
              required: "Email-ul e obligatoriu",
              pattern: {
                value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                message: "Email invalid",
              },
            })}
          />
          {errors.email && (
            <p className="text-[12px] text-danger mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label !mb-0" htmlFor="password">
              Parolă
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-[12px] font-semibold text-accent hover:underline"
            >
              Ai uitat-o?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="input"
            {...register("password", {
              required: "Parola e obligatorie",
              minLength: { value: 8, message: "Minimum 8 caractere" },
            })}
          />
          {errors.password && (
            <p className="text-[12px] text-danger mt-1.5">{errors.password.message}</p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Se conectează...
            </>
          ) : (
            <>
              Conectează-te
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-7 text-center text-[13px] text-ink-3">
        Nu ai cont încă?{" "}
        <Link href="/auth/signup" className="text-accent font-bold hover:underline">
          Creează unul gratuit
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="card p-8 flex items-center justify-center h-64">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
