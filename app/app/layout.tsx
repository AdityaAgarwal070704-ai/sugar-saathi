import { AuthProvider } from "@/components/auth/AuthProvider";
import AuthGate from "@/components/auth/AuthGate";
import AppShell from "@/components/nav/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>
        <AppShell>{children}</AppShell>
      </AuthGate>
    </AuthProvider>
  );
}
