import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const VARIANTS = {
  primary: "bg-moss text-white hover:bg-moss-deep shadow-soft",
  saffron: "bg-saffron text-ink hover:brightness-95 shadow-soft",
  soft: "bg-moss-soft text-moss hover:bg-[#d3e6da]",
  outline: "border border-line bg-paper text-ink hover:bg-sand",
  ghost: "text-moss hover:bg-moss-soft",
  danger: "border border-terracotta/50 text-terracotta hover:bg-terracotta-soft",
} as const;
const SIZES = { md: "min-h-11 px-5 text-base", sm: "min-h-9 px-3.5 text-sm", lg: "min-h-14 px-7 text-lg" } as const;

type Common = { variant?: keyof typeof VARIANTS; size?: keyof typeof SIZES; className?: string; children: ReactNode };

export function Button({ variant = "primary", size = "md", className = "", ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    />
  );
}

export function ButtonLink({ href, variant = "primary", size = "md", className = "", children }: Common & { href: string }) {
  return (
    <Link href={href} className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition ${VARIANTS[variant]} ${SIZES[size]} ${className}`}>
      {children}
    </Link>
  );
}
