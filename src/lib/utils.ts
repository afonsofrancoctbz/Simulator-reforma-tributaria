import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TaxBracket } from "@/config/fiscal";
import type { FeeBracket } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrencyBRL(value: number | undefined | null): string {
  if (value === undefined || value === null) return "R$ 0,00";
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function parseBRL(value: string): number {
  if (!value) return 0;
  // Remove "R$", pontos de milhar, e substitui a vírgula do decimal por ponto.
  const numericString = value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// CORREÇÃO CRÍTICA: Lógica de busca de faixa com Infinity e limites exatos
export function findBracket<T extends TaxBracket>(brackets: T[], value: number): T {
  // Se o valor for 0 ou negativo, retorna a primeira faixa
  if (value <= 0) return brackets[0];

  const found = brackets.find((b) => value >= b.min && value <= b.max);

  // Se não encontrar (ex: valor muito alto acima da última faixa definida sem Infinity),
  // retorna a última faixa disponível como fallback seguro.
  return found || brackets[brackets.length - 1];
}

export function findFeeBracket(feeTable: FeeBracket[], revenue: number): FeeBracket {
  const found = feeTable.find(f => revenue >= f.min && revenue <= f.max);
  return found || feeTable[feeTable.length - 1];
}

export function resolvePlanFee(feeBracket: FeeBracket | undefined, selectedPlan: string, fallbackTable: FeeBracket[]): number {
  if (!feeBracket && (!fallbackTable || fallbackTable.length === 0)) {
    console.warn("[AUDIT] Missing fee plans — applying fallback of zero.");
    return 0; // Fallback safe
  }

  const validBracket = feeBracket || fallbackTable[0];
  const plans = validBracket ? validBracket.plans : null;

  if (!plans || Object.keys(plans).length === 0) {
    console.warn("[AUDIT] Missing fee plans — applying fallback of zero.");
    return 0;
  }

  if (selectedPlan && plans[selectedPlan] !== undefined) {
    return plans[selectedPlan];
  }

  // Fallback to first available plan if selected is invalid
  const firstPlanKey = Object.keys(plans)[0];
  if (firstPlanKey && plans[firstPlanKey] !== undefined) {
    return plans[firstPlanKey];
  }

  return 0;
}
