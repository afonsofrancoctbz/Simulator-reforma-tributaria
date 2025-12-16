export function normalizeScenario<T extends Record<string, any>>(obj: T | null): T | null {
    if (!obj || Object.keys(obj).length === 0) return null;

    return {
        ...obj,
        fatorR: typeof obj.fatorR === "number" ? obj.fatorR : 0,
        effectiveDasRate: typeof obj.effectiveDasRate === "number" ? obj.effectiveDasRate : 0,
        annex: typeof obj.annex === "string" ? obj.annex : "N/A",
        ...(obj.optimizationNote ? { optimizationNote: obj.optimizationNote } : {}),
    };
}
