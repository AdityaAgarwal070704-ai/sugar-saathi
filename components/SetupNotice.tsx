export default function SetupNotice() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-xl font-bold">Setup needed</h1>
      <p className="mt-2 text-zinc-700">
        This app needs a Supabase project for logins and saved data. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code> (and to Vercel&apos;s Environment Variables), then restart.
        The README has the exact steps.
      </p>
    </main>
  );
}
