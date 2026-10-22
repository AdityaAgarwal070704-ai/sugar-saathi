"use client";

export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-lg bg-emerald-700 px-4 py-2 text-white print:hidden">
      Print or save as PDF
    </button>
  );
}
