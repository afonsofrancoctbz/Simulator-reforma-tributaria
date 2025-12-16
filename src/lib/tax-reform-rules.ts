export type ReformYear = 2026 | 2027 | 2028 | 2029 | 2030 | 2031 | 2032 | 2033;

export const IBS_TRANSITION_FACTOR: Record<ReformYear, number> = {
    2026: 0.0,
    2027: 0.05,
    2028: 0.10,
    2029: 0.15,
    2030: 0.20,
    2031: 0.30,
    2032: 0.50,
    2033: 1.00,
};

export function getIbsTransitionFactor(year: number): number {
    if (year < 2026) return 0;
    if (year > 2033) return 1;
    // Safety check for years between 2026-2033 not explicitly in the type (unlikely but safe)
    return IBS_TRANSITION_FACTOR[year as ReformYear] ?? 0;
}

export function getIssReductionFactor(year: number): number {
    // ISS reduction is proportional to IBS introduction: 1 - IBS_Factor
    // Example: If IBS is 20% implemented, ISS is 80% kept.
    const ibsFactor = getIbsTransitionFactor(year);
    return Math.max(0, 1 - ibsFactor);
}
