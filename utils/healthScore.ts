/**
 * Health score computation from KPI data.
 * Pure utility — no I/O, fully deterministic.
 *
 * Score:  0–100
 * Grade:  A (90–100) | B (75–89) | C (60–74) | D (40–59) | F (<40)
 * Status: HEALTHY (>=75) | CAUTION (50–74) | CRITICAL (<50)
 */

export interface HealthDetail {
  label: string;
  score: number;
  status: "good" | "warning" | "critical";
  insight: string;
}

export interface HealthResult {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  status: "HEALTHY" | "CAUTION" | "CRITICAL";
  statusColor: "green" | "amber" | "red";
  details: HealthDetail[];
}

export interface HistoryEntry {
  date: string;
  score: number;
  change: number;
  topKpi: string;
  bottomKpi: string;
}

// Variant → baseline score mapping.
// Backend assigns variant per KPI based on its analysis.
const VARIANT_BASE: Record<string, number> = {
  success: 92,
  info:    65,
  primary: 70,
  warning: 42,
};

function getGrade(score: number): HealthResult["grade"] {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

function getStatus(score: number): Pick<HealthResult, "status" | "statusColor"> {
  if (score >= 75) return { status: "HEALTHY",  statusColor: "green" };
  if (score >= 50) return { status: "CAUTION",  statusColor: "amber" };
  return           { status: "CRITICAL", statusColor: "red"   };
}

/**
 * Compute health result from the KPI array returned by the backend.
 * Returns null when there are no KPIs to evaluate.
 */
export function computeHealthFromKPIs(kpis: any[]): HealthResult | null {
  if (!Array.isArray(kpis) || kpis.length === 0) return null;

  const details: HealthDetail[] = kpis.map((kpi) => {
    let base = VARIANT_BASE[kpi.variant ?? "primary"] ?? 70;

    // Trend adjustment: ±1 trend point = ±0.3 score points, capped at ±20
    if (typeof kpi.trend === "number" && isFinite(kpi.trend)) {
      const adj = Math.min(Math.max(kpi.trend * 0.3, -20), 20);
      base = Math.min(100, Math.max(0, base + adj));
    }

    const score = Math.round(base);
    const status: HealthDetail["status"] =
      score >= 75 ? "good" : score >= 50 ? "warning" : "critical";

    return {
      label:   kpi.title ?? "Metric",
      score,
      status,
      insight: kpi.insight ?? "",
    };
  });

  const avg   = details.reduce((s, d) => s + d.score, 0) / details.length;
  const score = Math.round(avg);

  return {
    score,
    grade: getGrade(score),
    ...getStatus(score),
    details,
  };
}

/**
 * Build a single history entry from a computed health result.
 * The caller is responsible for diff-ing against the previous score.
 */
export function buildHistoryEntry(
  result: HealthResult,
  prevScore: number | null
): HistoryEntry {
  const sorted = [...result.details].sort((a, b) => b.score - a.score);

  return {
    date:     new Date().toISOString().slice(0, 10),
    score:    result.score,
    change:   prevScore !== null ? result.score - prevScore : 0,
    topKpi:   sorted[0]?.label ?? "—",
    bottomKpi: sorted[sorted.length - 1]?.label ?? "—",
  };
}
