"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface SignupForm {
  fullName: string;
  email: string;
  password: string;
}

export default function SignupPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>();
  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.fullName },
        },
      });
      if (error) throw error;
      toast.success("Cont creat! Te conectăm acum.");
      // Auto-sign-in is handled by Supabase if email confirmation is off.
      // If on, the user will need to click the link in email first.
      router.replace("/onboarding");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nu am putut crea contul.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="card p-8">
      <h1 className="text-h3 font-gilroy mb-2">Începe gratuit</h1>
      <p className="text-[14px] text-ink-3 mb-7">
        Creează cont Convia. Fără card, fără bătăi de cap. 100 conversații pe lună
        gratuit.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="fullName">
            Nume complet
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Ion Popescu"
            autoComplete="name"
            className="input"
            {...register("fullName", {
              required: "Numele e obligatoriu",
              minLength: { value: 2, message: "Minimum 2 caractere" },
            })}
          />
          {errors.fullName && (
            <p className="text-[12px] text-danger mt-1.5">{errors.fullName.message}</p>
          )}
        </div>

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
              pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Email invalid" },
            })}
          />
          {errors.email && (
            <p className="text-[12px] text-danger mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="password">
            Parolă
          </label>
          <input
            id="password"
            type="password"
            placeholder="Minimum 8 caractere"
            autoComplete="new-password"
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
              Se creează...
            </>
          ) : (
            <>
              Creează cont
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-[12px] text-soft text-center pt-1">
          Prin crearea unui cont accepți{" "}
          <a
            href="https://convia.ro/termeni"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Termenii
          </a>{" "}
          și{" "}
          <a
            href="https://convia.ro/confidentialitate"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Politica de confidențialitate
          </a>
          .
        </p>
      </form>

      <div className="mt-7 text-center text-[13px] text-ink-3">
        Ai deja cont?{" "}
        <Link href="/auth/login" className="text-accent font-bold hover:underline">
          Conectează-te
        </Link>
      </div>
    </div>
  );
}
