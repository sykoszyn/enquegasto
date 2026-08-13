import { Character } from "@/lib/types";
import TeamBadge from "./TeamBadge";
import { FileText, AlertTriangle, Armchair } from "lucide-react";

interface ContractCardProps {
  character: Character;
}

export default function ContractCard({ character }: ContractCardProps) {
  if (!character.team) {
    return (
      <div className="bg-cs-panel border border-cs-border rounded-lg p-5 text-center space-y-2">
        <FileText size={24} className="mx-auto text-cs-muted" />
        <p className="text-sm text-cs-text font-semibold">Agente libre</p>
        <p className="text-xs text-cs-muted">
          Todavía no firmaste con ningún equipo. Subí tu reputación para que empiecen a llegar ofertas.
        </p>
      </div>
    );
  }

  const contract = character.contract;

  return (
    <div className="bg-cs-panel border border-cs-border rounded-lg p-5 space-y-4">
      <div className="flex items-center gap-2">
        <FileText size={18} className="text-cs-orange" />
        <h3 className="font-display text-lg font-bold text-cs-text uppercase tracking-wide">Equipo & Contrato</h3>
      </div>

      <div className="flex items-start gap-3">
        <TeamBadge name={character.team.name} color={character.team.primaryColor} size={40} />
        <div>
          <p className="text-cs-text font-bold text-base">{character.team.name}</p>
          <p className="text-xs text-cs-muted mt-1">{character.team.description}</p>
          <p className="text-[11px] text-cs-orange mt-2">Roster: {character.team.roster.join(", ")}</p>
        </div>
      </div>

      {character.benched && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
          <Armchair size={16} className="text-red-400" />
          <p className="text-xs text-red-300">Estás en el banco de suplentes. No jugás hasta que remontés el nivel.</p>
        </div>
      )}

      {contract ? (
        <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-cs-border">
          <div>
            <p className="text-cs-muted uppercase tracking-wide text-[10px]">Rol asignado</p>
            <p className="text-cs-text font-semibold">{contract.assignedRole}</p>
          </div>
          <div>
            <p className="text-cs-muted uppercase tracking-wide text-[10px]">Salario mensual</p>
            <p className="text-cs-text font-semibold">
              ${contract.salaryUsd.toLocaleString()}
              {contract.salaryCut && <span className="text-red-400 text-[10px] ml-1">(recortado)</span>}
            </p>
          </div>
          <div>
            <p className="text-cs-muted uppercase tracking-wide text-[10px]">Contrato restante</p>
            <p className="text-cs-text font-semibold">{contract.monthsRemaining} / {contract.durationMonths} meses</p>
          </div>
          <div>
            <p className="text-cs-muted uppercase tracking-wide text-[10px]">Cláusula de rescisión</p>
            <p className="text-cs-text font-semibold">${contract.rescissionClauseUsd.toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-hltv-yellow/10 border border-hltv-yellow/30 rounded px-3 py-2">
          <AlertTriangle size={16} className="text-hltv-yellow" />
          <p className="text-xs text-hltv-yellow">Sin contrato formal todavía.</p>
        </div>
      )}
    </div>
  );
}
