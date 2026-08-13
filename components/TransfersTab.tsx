import { ReactNode } from "react";
import { TransferOffer } from "@/lib/types";
import TeamBadge from "./TeamBadge";
import { ArrowRightLeft, DollarSign, Calendar, ShieldAlert, TrendingUp, Repeat, HandCoins } from "lucide-react";

interface TransfersTabProps {
  offers: TransferOffer[];
  onAccept: (offer: TransferOffer) => void;
  onDecline: (offerId: string) => void;
}

const KIND_META: Record<TransferOffer["kind"], { label: string; icon: ReactNode; color: string }> = {
  signing: { label: "Primer contrato", icon: <HandCoins size={12} />, color: "text-sky-400" },
  promotion: { label: "Ascenso de tier", icon: <TrendingUp size={12} />, color: "text-emerald-400" },
  lateral: { label: "Oferta de otro club", icon: <Repeat size={12} />, color: "text-hltv-yellow" }
};

export default function TransfersTab({ offers, onAccept, onDecline }: TransfersTabProps) {
  if (offers.length === 0) {
    return (
      <div className="bg-cs-panel border border-cs-border rounded-lg p-6 text-center">
        <ArrowRightLeft size={24} className="mx-auto text-cs-muted mb-2" />
        <p className="text-sm text-cs-muted">
          No tenés ofertas de transferencia por ahora. Seguí entrenando y jugando — van a ir apareciendo acá a medida que crezca tu reputación.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {offers.map((offer) => {
        const meta = KIND_META[offer.kind];
        return (
          <div key={offer.id} className="bg-cs-panel border border-cs-border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <TeamBadge name={offer.team.name} color={offer.team.primaryColor} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-cs-text">{offer.team.name}</p>
                  <span className={`flex items-center gap-1 text-[10px] uppercase tracking-wide ${meta.color}`}>
                    {meta.icon} {meta.label}
                  </span>
                </div>
                <p className="text-xs text-cs-muted mt-1">{offer.note}</p>
                <p className="text-[11px] text-cs-orange mt-1.5">Roster: {offer.team.roster.join(", ") || "—"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2 border-t border-cs-border/60 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <DollarSign size={12} /> ${offer.contract.salaryUsd.toLocaleString()}/mes
              </span>
              <span className="flex items-center gap-1 text-cs-muted">
                <Calendar size={12} /> {offer.contract.durationMonths} meses
              </span>
              <span className="flex items-center gap-1 text-cs-muted">
                <ShieldAlert size={12} /> Rol: {offer.contract.assignedRole}
              </span>
              {offer.feeUsd > 0 && (
                <span className="flex items-center gap-1 text-hltv-yellow font-semibold">
                  <HandCoins size={12} /> Prima de fichaje: ${offer.feeUsd.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onAccept(offer)}
                className="flex-1 py-2 rounded bg-cs-orange text-black text-xs font-bold uppercase tracking-wide hover:bg-cs-orangeDark transition-colors"
              >
                Aceptar
              </button>
              <button
                onClick={() => onDecline(offer.id)}
                className="px-4 py-2 rounded border border-cs-border text-xs text-cs-muted hover:text-cs-text hover:border-cs-text transition-colors"
              >
                Rechazar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
