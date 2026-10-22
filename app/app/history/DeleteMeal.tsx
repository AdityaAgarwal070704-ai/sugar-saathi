"use client";

import { store } from "@/lib/store";

export default function DeleteMeal({ id }: { id: string }) {
  const del = () => {
    if (window.confirm("Delete this meal?")) store.deleteMeal(id);
  };
  return (
    <button type="button" onClick={del} className="text-xs text-zinc-500 underline">
      Delete
    </button>
  );
}
