"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function DeleteMeal({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const del = async () => {
    if (!window.confirm("Delete this meal?")) return;
    setBusy(true);
    const { error: err } = await createClient().from("meals").delete().eq("id", id);
    setBusy(false);
    if (err) return setError(true);
    router.refresh();
  };
  return (
    <span className="text-xs">
      <button type="button" disabled={busy} onClick={del} className="text-zinc-500 underline">Delete</button>
      {error && <span className="ml-2 text-red-700">Couldn&apos;t delete</span>}
    </span>
  );
}
