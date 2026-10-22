import { ManageBillingButton, UpgradeButton } from "@/components/Upgrade";
import SettingsForm from "@/components/SettingsForm";
import { PRO_PRICE_LABEL, requireUser } from "@/lib/session";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ upgraded?: string }> }) {
  const { user, profile } = await requireUser();
  const { upgraded } = await searchParams;
  if (!profile) return <p className="text-red-700">Your profile couldn&apos;t be loaded. Run the database setup in supabase/schema.sql, then sign in again.</p>;

  return (
    <>
      <h1 className="text-2xl font-bold">Settings</h1>
      {upgraded && profile.plan !== "pro" && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">Thanks! Your upgrade is being confirmed. Refresh this page in a few seconds.</p>
      )}
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="font-semibold">Your plan</h2>
        <p className="mt-1 text-sm text-zinc-700">Signed in as {user.email}. You&apos;re on <strong>{profile.plan === "pro" ? "Pro" : "Free"}</strong>.</p>
        <div className="mt-3">{profile.plan === "pro" ? <ManageBillingButton /> : <><p className="mb-2 text-sm text-zinc-600">Pro is {PRO_PRICE_LABEL}.</p><UpgradeButton /></>}</div>
      </section>
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Your goals</h2>
        <SettingsForm profile={profile} />
      </section>
    </>
  );
}
