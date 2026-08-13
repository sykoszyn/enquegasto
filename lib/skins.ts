import { SkinItem } from "./types";

// ============================================================
// Mercado de skins — comprables con la plata ganada en torneos.
// El "confidenceBoost" impacta directamente la Forma del jugador.
// ============================================================

export const SHOP_ITEMS: SkinItem[] = [
  { id: "p250_sand", name: "P250 | Sand Dune", priceUsd: 5, confidenceBoost: 1, rarity: "Consumer" },
  { id: "mp9_bulldozer", name: "MP9 | Bulldozer", priceUsd: 15, confidenceBoost: 1, rarity: "Mil-Spec" },
  { id: "mac10_neon", name: "MAC-10 | Neon Rider", priceUsd: 40, confidenceBoost: 2, rarity: "Restricted" },
  { id: "ak_redline", name: "AK-47 | Redline", priceUsd: 90, confidenceBoost: 3, rarity: "Classified" },
  { id: "m4a4_asiimov", name: "M4A4 | Asiimov", priceUsd: 140, confidenceBoost: 4, rarity: "Classified" },
  { id: "awp_asiimov", name: "AWP | Asiimov", priceUsd: 220, confidenceBoost: 5, rarity: "Classified" },
  { id: "ak_fire_serpent", name: "AK-47 | Fire Serpent", priceUsd: 450, confidenceBoost: 6, rarity: "Covert" },
  { id: "karambit_fade", name: "Karambit | Fade", priceUsd: 800, confidenceBoost: 8, rarity: "Covert" },
  { id: "butterfly_doppler", name: "Butterfly Knife | Doppler", priceUsd: 950, confidenceBoost: 9, rarity: "Covert" },
  { id: "howl", name: "M4A4 | Howl", priceUsd: 2200, confidenceBoost: 12, rarity: "Contraband" },
  { id: "dragon_lore", name: "AWP | Dragon Lore", priceUsd: 5500, confidenceBoost: 15, rarity: "Covert" }
];

export function affordableItems(usd: number): SkinItem[] {
  return SHOP_ITEMS.filter((i) => i.priceUsd <= usd);
}
