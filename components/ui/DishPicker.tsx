"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Category, Food } from "@/lib/types";
import { unitLabel, type MessageKey } from "@/lib/i18n";
import { useT } from "@/lib/useT";
import { CloseIcon, SearchIcon } from "./icons";

type Filter = Category | "all" | "tag:mine" | "tag:restaurant" | "tag:vrat" | "tag:festival";

const CATS: { key: Filter; label: MessageKey }[] = [
  { key: "all", label: "cat.all" },
  { key: "tag:mine", label: "cat.mine" },
  { key: "tag:restaurant", label: "cat.restaurant" },
  { key: "tag:vrat", label: "cat.vrat" },
  { key: "tag:festival", label: "cat.festival" },
  { key: "grain", label: "cat.grain" },
  { key: "dal", label: "cat.dal" },
  { key: "veg", label: "cat.veg" },
  { key: "protein", label: "cat.protein" },
  { key: "snack", label: "cat.snack" },
  { key: "sweet", label: "cat.sweet" },
  { key: "drink", label: "cat.drink" },
  { key: "fruit", label: "cat.fruit" },
  { key: "dairy", label: "cat.dairy" },
  { key: "nuts", label: "cat.nuts" },
  { key: "extra", label: "cat.extra" },
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
  const { t, name } = useT();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Filter>("all");
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
      .filter((f) => (cat === "all" || (cat.startsWith("tag:") ? f.tags.includes(cat.slice(4)) : f.category === cat)) && (needle === "" || f.name.toLowerCase().includes(needle) || (f.hi ?? "").includes(needle) || f.id.replace(/_/g, " ").includes(needle)))
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
        <span className={current ? "font-medium" : "text-muted"}>{current ? name(current) : placeholder}</span>
        <span className="ml-auto text-muted" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label={t("log.dishSearch")} onClick={(e) => e.stopPropagation()} className="pop-in flex max-h-[85vh] w-full flex-col rounded-t-3xl bg-paper shadow-lift sm:max-w-lg sm:rounded-3xl">
            <div className="flex items-center gap-2 border-b border-line p-3">
              <SearchIcon className="ml-1 h-5 w-5 text-muted" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("log.search")} className="min-h-11 flex-1 bg-transparent text-base outline-none" aria-label={t("log.search")} />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-2 hover:bg-sand"><CloseIcon className="h-5 w-5" /></button>
            </div>
            <div className="flex gap-2 overflow-x-auto border-b border-line px-3 py-2">
              {CATS.filter((c) => c.key !== "tag:mine" || foods.some((f) => f.tags.includes("mine"))).map((c) => (
                <button key={c.key} type="button" onClick={() => setCat(c.key)} aria-pressed={cat === c.key} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${cat === c.key ? "bg-moss text-white" : "bg-sand text-ink hover:bg-line"}`}>{t(c.label)}</button>
              ))}
            </div>
            <ul className="overflow-y-auto p-2">
              {results.length === 0 && <li className="p-6 text-center text-sm text-muted">{t("log.noDish")}</li>}
              {results.map((f) => (
                <li key={f.id}>
                  <button type="button" onClick={() => pick(f.id)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-moss-soft ${f.id === value ? "bg-moss-soft" : ""}`}>
                    <span className="text-2xl" aria-hidden="true">{f.icon}</span>
                    <span className="flex-1">
                      <span className="block font-medium">{name(f)}</span>
                      <span className="block text-xs text-muted">{t("log.perHint", { unit: unitLabel(t, f.unit, 1), c: f.carbs, p: f.protein })}</span>
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
