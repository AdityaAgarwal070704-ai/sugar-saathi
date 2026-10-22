import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
// Hindi (Devanagari) text uses these; the Latin fonts above do not contain those letters.
const devaSans = Noto_Sans_Devanagari({ variable: "--font-deva-sans", subsets: ["devanagari"], display: "swap" });
const devaSerif = Noto_Serif_Devanagari({ variable: "--font-deva-serif", subsets: ["devanagari"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Sugar Saathi: your daily companion for Indian diabetes food and glucose",
    template: "%s · Sugar Saathi",
  },
  description:
    "Describe a meal in everyday words and see carbs, protein, fibre, fat and how it affects your sugar. Free, private, built for Indian food.",
  applicationName: "Sugar Saathi",
  appleWebApp: { capable: true, title: "Sugar Saathi", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#1b4d3e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${devaSans.variable} ${devaSerif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
