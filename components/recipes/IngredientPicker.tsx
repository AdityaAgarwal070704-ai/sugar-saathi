"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import type { Ingredient } from "@/lib/recipe";

// A searchable ingredient chooser (full-width sheet on phones).
export function IngredientPicker({ ingredients, value, onChange, placeholder = "Pick an ingredient" }: { ingredients: Ingredient[]; value: string | null; onChange: (id: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const current = ingredients.find((i) => i.id === value);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const results = useMemo(() => {
    const n = q.trim().toLowerCase();
    return ingredients.filter((i) => n === "" || i.name.toLowerCase().includes(n) || i.id.replace(/_/g, " ").includes(n)).slice(0, 80);
  }, [ingredients, q]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="flex min-h-11 w-full items-center gap-2 rounded-2xl border border-line bg-paper px-3 py-2 text-left hover:bg-sand">
        <span aria-hidden="true" className="text-xl">{current?.icon ?? "🥄"}</span>
        <span className={current ? "font-medium" : "text-muted"}>{current?.name ?? placeholder}</span>
        <span className="ml-auto text-muted" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Choose an ingredient" onClick={(e) => e.stopPropagation()} className="pop-in flex max-h-[85vh] w-full flex-col rounded-t-3xl bg-paper shadow-lift sm:max-w-lg sm:rounded-3xl">
            <div className="flex items-center gap-2 border-b border-line p-3">
              <SearchIcon className="ml-1 h-5 w-5 text-muted" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, e.g. atta, toor dal, oil" className="min-h-11 flex-1 bg-transparent text-base outline-none" aria-label="Search ingredients" />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-2 hover:bg-sand"><CloseIcon className="h-5 w-5" /></button>
            </div>
            <ul className="overflow-y-auto p-2">
              {results.length === 0 && <li className="p-6 text-center text-sm text-muted">Not in the list. Try a similar ingredient.</li>}
              {results.map((i) => (
                <li key={i.id}>
                  <button type="button" onClick={() => { onChange(i.id); setOpen(false); setQ(""); }} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-moss-soft ${i.id === value ? "bg-moss-soft" : ""}`}>
                    <span className="text-2xl" aria-hidden="true">{i.icon}</span>
                    <span className="flex-1">
                      <span className="block font-medium">{i.name}</span>
                      <span className="block text-xs text-muted">per 100 g: {i.carbs} g carbs · {i.protein} g protein · {i.fat} g fat</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
