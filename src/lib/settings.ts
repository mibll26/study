import { prisma } from "./db";

export type Settings = {
  targetPriceMin: number;
  targetPriceMax: number;
  naverMaxPages: number;
};

const DEFAULTS: Settings = { targetPriceMin: 10000, targetPriceMax: 50000, naverMaxPages: 3 };

export async function getSettings(): Promise<Settings> {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    targetPriceMin: Number(map.targetPriceMin ?? DEFAULTS.targetPriceMin),
    targetPriceMax: Number(map.targetPriceMax ?? DEFAULTS.targetPriceMax),
    naverMaxPages: Number(map.naverMaxPages ?? DEFAULTS.naverMaxPages),
  };
}
