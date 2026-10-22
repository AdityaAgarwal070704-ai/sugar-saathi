import { brandIcon } from "@/lib/brand-icon";

export async function GET(_req: Request, ctx: { params: Promise<{ size: string }> }) {
  const { size } = await ctx.params;
  const n = size === "192" ? 192 : 512;
  return brandIcon(n);
}
