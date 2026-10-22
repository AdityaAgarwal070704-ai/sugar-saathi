import Link from "next/link";
import { LogoMark } from "@/components/ui/icons";

export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold text-moss">
        <LogoMark /> Sugar Saathi
      </Link>
      <h1 className="mt-8 font-display text-4xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-muted">Last updated {updated}</p>
      <p className="mt-4 rounded-2xl bg-saffron-soft px-4 py-3 text-sm">
        <strong>Draft.</strong> This page is written in plain language and is still waiting for a legal review. It is not legal advice.
      </p>
      <div className="mt-6 space-y-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_li]:mt-1.5 [&_p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">{children}</div>
      <p className="mt-10 text-sm"><Link href="/" className="text-moss underline">← Back to Sugar Saathi</Link></p>
    </main>
  );
}
