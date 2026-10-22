"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Category, Food } from "@/lib/types";
import { CloseIcon, SearchIcon } from "./icons";

const CATS: { key: Category | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "grain", label: "Roti & rice" },
  { key: "dal", label: "Dal" },
  { key: "veg", label: "Sabzi" },
  { key: "protein", label: "Paneer, egg, meat" },
  { key: "snack", label: "Snacks" },
  { key: "sweet", label: "Sweets" },
  { key: "drink", label: "Drinks" },
  { key: "fruit", label: "Fruit" },
  { key: "dairy", label: "Curd" },
  { key: "nuts", label: "Nuts" },
  { key: "extra", label: "Extras" },
];

type Props = {
  foods: Food[];
  value: string | null;
  onChange: (id: string) => void;
  placeholder?: string;
  triggerClassName?: string;
};

// A searchable dish chooser: a full-width sheet on phones, a centred panel on larger screens.
export function DishPicker({ foods, value, onChange, placeholder = "Pick a dish", triggerClassName = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const current = foods.find((f) => f.id === value);

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
    const needle = q.trim().toLowerCase();
    return foods
      .filter((f) => (cat === "all" || f.category === cat) && (needle === "" || f.name.toLowerCase().includes(needle) || f.id.replace(/_/g, " ").includes(needle)))
      .slice(0, 80);
  }, [foods, q, cat]);

  const pick = (id: string) => {
    onChange(id);
    setOpen(false);
    setQ("");
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className={`flex min-h-11 items-center gap-2 rounded-2xl border border-line bg-paper px-3 py-2 text-left text-base hover:bg-sand ${triggerClassName}`}>
        <span aria-hidden="true" className="text-xl">{current?.icon ?? "🍽️"}</span>
        <span className={current ? "font-medium" : "text-muted"}>{current?.name ?? placeholder}</span>
        <span className="ml-auto text-muted" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Choose a dish" onClick={(e) => e.stopPropagation()} className="pop-in flex max-h-[85vh] w-full flex-col rounded-t-3xl bg-paper shadow-lift sm:max-w-lg sm:rounded-3xl">
            <div className="flex items-center gap-2 border-b border-line p-3">
              <SearchIcon className="ml-1 h-5 w-5 text-muted" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes, e.g. dal, paneer, idli" className="min-h-11 flex-1 bg-transparent text-base outline-none" aria-label="Search dishes" />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-2 hover:bg-sand"><CloseIcon className="h-5 w-5" /></button>
            </div>
            <div className="flex gap-2 overflow-x-auto border-b border-line px-3 py-2">
              {CATS.map((c) => (
                <button key={c.key} type="button" onClick={() => setCat(c.key)} aria-pressed={cat === c.key} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${cat === c.key ? "bg-moss text-white" : "bg-sand text-ink hover:bg-line"}`}>{c.label}</button>
              ))}
            </div>
            <ul className="overflow-y-auto p-2">
              {results.length === 0 && <li className="p-6 text-center text-sm text-muted">No dish found. Try another word, or check the spelling.</li>}
              {results.map((f) => (
                <li key={f.id}>
                  <button type="button" onClick={() => pick(f.id)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-moss-soft ${f.id === value ? "bg-moss-soft" : ""}`}>
                    <span className="text-2xl" aria-hidden="true">{f.icon}</span>
                    <span className="flex-1">
                      <span className="block font-medium">{f.name}</span>
                      <span className="block text-xs text-muted">per {f.unit}: {f.carbs} g carbs · {f.protein} g protein</span>
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
