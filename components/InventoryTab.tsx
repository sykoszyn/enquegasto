import { Character, SkinItem } from "@/lib/types";
import { SHOP_ITEMS } from "@/lib/skins";
import { Backpack, ShoppingBag, Check } from "lucide-react";

interface InventoryTabProps {
  character: Character;
  onBuy: (item: SkinItem) => void;
}

const RARITY_COLOR: Record<SkinItem["rarity"], string> = {
  Consumer: "text-cs-muted",
  "Mil-Spec": "text-sky-400",
  Restricted: "text-violet-400",
  Classified: "text-fuchsia-400",
  Covert: "text-red-400",
  Contraband: "text-hltv-yellow"
};

export default function InventoryTab({ character, onBuy }: InventoryTabProps) {
  const owned = new Set(character.inventory.map((i) => i.id));

  return (
    <div className="space-y-4">
      <div className="bg-cs-panel border border-cs-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <Backpack size={18} className="text-cs-orange" />
          <h3 className="font-display text-lg font-bold text-cs-text uppercase tracking-wide">Tu inventario</h3>
        </div>
        {character.inventory.length === 0 ? (
          <p className="text-sm text-cs-muted">Todavía no compraste ningún skin. Andá gastando el prize money con cabeza.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {character.inventory.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="p-2.5 rounded border border-cs-border bg-cs-panel2">
                <p className={`text-sm font-semibold ${RARITY_COLOR[item.rarity]}`}>{item.name}</p>
                <p className="text-[10px] text-cs-muted">{item.rarity} · +{item.confidenceBoost} Forma</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-cs-panel border border-cs-border rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-cs-orange" />
            <h3 className="font-display text-lg font-bold text-cs-text uppercase tracking-wide">Mercado de skins</h3>
          </div>
          <p className="text-xs text-emerald-400 font-mono font-bold">${character.money.usd.toLocaleString()}</p>
        </div>

        <div className="space-y-2">
          {SHOP_ITEMS.map((item) => {
            const isOwned = owned.has(item.id);
            const canAfford = character.money.usd >= item.priceUsd;
            return (
              <div key={item.id} className="flex items-center justify-between p-3 rounded border border-cs-border bg-cs-panel2">
                <div>
                  <p className={`text-sm font-semibold ${RARITY_COLOR[item.rarity]}`}>{item.name}</p>
                  <p className="text-[11px] text-cs-muted">{item.rarity} · +{item.confidenceBoost} Forma al comprarlo</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="font-mono text-sm text-cs-text">${item.priceUsd.toLocaleString()}</p>
                  {isOwned ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs">
                      <Check size={14} /> Tuyo
                    </span>
                  ) : (
                    <button
                      onClick={() => onBuy(item)}
                      disabled={!canAfford}
                      className="px-3 py-1.5 rounded bg-cs-orange text-black text-xs font-bold uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cs-orangeDark transition-colors"
                    >
                      Comprar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
