import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  return (
    <main className="mx-auto max-w-xl px-5 py-12">
      <Link href="/" className="text-sm text-moss underline">← Back to Sugar Saathi</Link>
      <h1 className="mt-4 font-display text-4xl font-semibold text-moss-deep">Contact us</h1>
      <p className="mt-2 text-muted">Questions, feedback or a dish we&apos;re missing? Send a note and we&apos;ll reply by email.</p>
      <ContactForm />
      <p className="mt-6 text-sm text-muted">Please don&apos;t send medical details here. Sugar Saathi gives food guidance only.</p>
    </main>
  );
}
