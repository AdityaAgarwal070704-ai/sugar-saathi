"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { supabaseConfigured } from "@/lib/supabase/config";
import SetupNotice from "@/components/SetupNotice";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(params.get("error") === "link" ? "That confirmation link didn't work. Try signing in." : null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Use a password with at least 8 characters.");
    setBusy(true);
    const supabase = createClient();
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) return setError(error.message);
        if (data.session) router.push("/app");
        else setInfo("Check your email for a confirmation link, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return setError(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
        router.push("/app");
        router.refresh();
      }
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full rounded border border-zinc-300 px-3 py-2";
  return (
    <main className="mx-auto max-w-sm px-4 py-12">
      <Link href="/" className="text-sm text-emerald-800">← Sugar Saathi</Link>
      <h1 className="mt-4 text-2xl font-bold">{mode === "signup" ? "Create your account" : "Sign in"}</h1>
      <form onSubmit={submit} className="mt-5 space-y-3">
        <label className="block text-sm">
          Email
          <input type="email" autoComplete="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block text-sm">
          Password
          <input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {info && <p className="text-sm text-emerald-800">{info}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50">
          {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>
      <button type="button" className="mt-4 text-sm text-zinc-600 underline" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(null); setInfo(null); }}>
        {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>
    </main>
  );
}

export default function LoginPage() {
  if (!supabaseConfigured) return <SetupNotice />;
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
