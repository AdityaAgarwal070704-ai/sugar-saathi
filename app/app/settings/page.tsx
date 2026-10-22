import SettingsForm from "@/components/SettingsForm";
import { requireUser } from "@/lib/session";

export default async function SettingsPage() {
  const { user, profile } = await requireUser();
  if (!profile) return <p className="text-red-700">Your profile couldn&apos;t be loaded. Run the database setup in supabase/schema.sql, then sign in again.</p>;

  return (
    <>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm text-zinc-600">Signed in as {user.email}.</p>
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">Your goals</h2>
        <SettingsForm profile={profile} />
      </section>
    </>
  );
}
