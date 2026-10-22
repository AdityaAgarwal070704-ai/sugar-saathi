"use client";

import Link from "next/link";
import { Suspense } from "react";
import RecipeBuilder from "@/components/recipes/RecipeBuilder";
import { useStore } from "@/lib/store";

function Inner() {
  const { ready } = useStore();
  if (!ready) return <p className="text-muted">Loading…</p>;
  return <RecipeBuilder />;
}

export default function BuilderPage() {
  return (
    <>
      <div>
        <Link href="/app/recipes" className="inline-block py-2 text-sm font-medium text-moss underline">← My dishes</Link>
        <h1 className="mt-2 font-display text-3xl font-semibold">Recipe builder</h1>
        <p className="mt-1 text-muted">Cook by feel? Add your ingredients once and get nutrition for one serving.</p>
      </div>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <Inner />
      </Suspense>
    </>
  );
}
