import AppNav from "@/components/AppNav";
import Disclaimer from "@/components/Disclaimer";
import SetupNotice from "@/components/SetupNotice";
import { supabaseConfigured } from "@/lib/supabase/config";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured) return <SetupNotice />;
  await requireUser();
  return (
    <div className="min-h-screen">
      <AppNav />
      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6">{children}</div>
      <footer className="mx-auto max-w-5xl px-4 pb-10 print:hidden">
        <Disclaimer />
      </footer>
    </div>
  );
}
