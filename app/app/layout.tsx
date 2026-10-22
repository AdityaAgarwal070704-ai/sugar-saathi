import AppNav from "@/components/AppNav";
import Disclaimer from "@/components/Disclaimer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
