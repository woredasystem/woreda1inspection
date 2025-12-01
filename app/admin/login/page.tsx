"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { HiLockClosed, HiEnvelope, HiArrowRight } from "react-icons/hi2";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="flex flex-col gap-6 p-4 py-20">
        <div className="space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700">
            <HiLockClosed className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500">
              Administrator access
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Sign in to continue
            </h1>
            <p className="text-sm text-slate-600">
              Supabase protects the admin dashboard. Only authorized accounts may
              approve QR requests and manage documents.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)]"
        >
          <label className="block text-xs uppercase tracking-[0.4em] text-slate-500">
            Email
            <div className="relative mt-2">
              <HiEnvelope className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-12 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </label>
          <label className="block text-xs uppercase tracking-[0.4em] text-slate-500">
            Password
            <div className="relative mt-2">
              <HiLockClosed className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-12 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </label>
          {error && (
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-900 bg-slate-900 px-4 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isLoading ? (
              "Signing in…"
            ) : (
              <>
                Sign in
                <HiArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}


