"use client";

import { Button } from "@/components/ui/Button";

export default function PrintButton() {
  return (
    <span className="print:hidden">
      <Button onClick={() => window.print()}>Print or save as PDF</Button>
    </span>
  );
}
