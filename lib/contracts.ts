import { AssignedRole, Character, Contract, Team } from "./types";

// ============================================================
// Contratos — salario, rol asignado, duración y cláusula de
// rescisión. El salario escala con el tier del equipo y tu
// reputación; el rol asignado depende de qué tan preparado
// estás para ese nivel (si tu reputación queda corta, arrancás
// en el banco de suplentes).
// ============================================================

const TIER_BASE_SALARY: Record<Team["tier"], { min: number; max: number }> = {
  local: { min: 80, max: 250 },
  tier2: { min: 400, max: 1800 },
  tier1: { min: 3000, max: 25000 }
};

const TIER_CLAUSE_MULTIPLIER: Record<Team["tier"], number> = {
  local: 8,
  tier2: 15,
  tier1: 40
};

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateContractOffer(team: Team, character: Character): Contract {
  const { min, max } = TIER_BASE_SALARY[team.tier];
  const repFactor = character.reputation / 100; // 0 a 1
  const salaryUsd = Math.round(min + (max - min) * repFactor * (0.7 + Math.random() * 0.6));

  // Si tu reputación queda relativamente floja para el tier, arrancás en el banco
  const repThreshold = team.tier === "local" ? 5 : team.tier === "tier2" ? 45 : 70;
  const startsOnBench = character.reputation < repThreshold && Math.random() < 0.5;

  let assignedRole: AssignedRole = startsOnBench ? "Suplente" : character.role === "IGL" ? "IGL" : character.role === "AWP" ? "AWP" : "Titular";

  const durationMonths = team.tier === "local" ? rand(4, 10) : team.tier === "tier2" ? rand(8, 18) : rand(12, 30);
  const rescissionClauseUsd = Math.round(salaryUsd * TIER_CLAUSE_MULTIPLIER[team.tier]);

  return {
    teamId: team.id,
    teamName: team.name,
    salaryUsd,
    assignedRole,
    durationMonths,
    monthsRemaining: durationMonths,
    rescissionClauseUsd,
    salaryCut: false
  };
}

// Se llama una vez al mes: paga el sueldo y descuenta un mes de contrato.
// Devuelve el personaje actualizado y si el contrato expiró este mes.
export function processMonthlyContract(character: Character): { character: Character; expired: boolean; log: string[] } {
  if (!character.contract) return { character, expired: false, log: [] };

  const log: string[] = [];
  const contract = { ...character.contract, monthsRemaining: character.contract.monthsRemaining - 1 };
  const money = { ...character.money, usd: character.money.usd + contract.salaryUsd };
  log.push(`Cobraste tu sueldo mensual de ${contract.teamName}: $${contract.salaryUsd.toLocaleString()}.`);

  const expired = contract.monthsRemaining <= 0;

  if (expired) {
    // 65% de chance de renovación automática si el rendimiento acompaña
    const avgRecent =
      character.recentRatings.length > 0
        ? character.recentRatings.reduce((a, b) => a + b, 0) / character.recentRatings.length
        : 1.0;
    const renews = avgRecent >= 0.95 && Math.random() < 0.65;

    if (renews && character.team) {
      const newContract = generateContractOffer(character.team, { ...character, money });
      log.push(`${character.team.name} te renovó el contrato: $${newContract.salaryUsd.toLocaleString()}/mes por ${newContract.durationMonths} meses.`);
      return {
        character: { ...character, money, contract: newContract },
        expired: false,
        log
      };
    }

    log.push(`Tu contrato con ${contract.teamName} llegó a su fin y no fue renovado. Quedaste libre.`);
    return {
      character: { ...character, money, team: null, contract: null, benched: false },
      expired: true,
      log
    };
  }

  return { character: { ...character, money, contract }, expired: false, log };
}
