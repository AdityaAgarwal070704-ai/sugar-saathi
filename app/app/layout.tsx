import { AuthProvider } from "@/components/auth/AuthProvider";
import AuthGate from "@/components/auth/AuthGate";
import AppShell from "@/components/nav/AppShell";
import SyncManager from "@/components/auth/SyncManager";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>
        <SyncManager />
        <AppShell>{children}</AppShell>
      </AuthGate>
    </AuthProvider>
  );
}
