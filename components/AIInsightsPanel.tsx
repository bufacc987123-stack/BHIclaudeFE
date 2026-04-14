"use client";

/**
 * AIInsightsPanel — Key Insight / Top Risk / Recommended Action / Growth Pathways.
 *
 * Theme: structural surfaces, borders, muted text → CSS vars.
 * Row accent colours:
 *   Key Insight              → --ac-1  (primary accent)
 *   Top Risk                 → #EF5350 (fixed red — always semantic danger)
 *   Recommended Action       → #00897B (fixed teal — always semantic positive)
 *   AI Insights for Growth   → --tx-3  (muted secondary, list section)
 *
 * Loading skeleton uses --bd-1 for animated bars so they match the current
 * surface regardless of mode.
 */

export interface AIInsights {
  key_insight?:        string;
  top_risk?:           string;
  recommended_action?: string;
  growth_pathways?:    string[];  // array of specific, data-driven growth actions
}

interface Props {
  insights?:  AIInsights | null;
  isLoading?: boolean;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
interface SkeletonRowProps {
  label:     string;
  bars:      string[];
  accentVar: string;
}

function SkeletonRow({ label, bars, accentVar }: SkeletonRowProps) {
  return (
    <div
      className="border-l-2 pl-4 py-3"
      style={{ borderColor: accentVar }}
    >
      <p
        className="text-[10px] tracking-[0.18em] font-semibold uppercase mb-2"
        style={{ color: accentVar }}
      >
        {label}
      </p>
      {bars.map((w, i) => (
        <div
          key={i}
          className={`h-2.5 rounded animate-pulse ${w} ${i > 0 ? "mt-1.5" : ""}`}
          style={{ background: "var(--bd-1)" }}
        />
      ))}
    </div>
  );
}

// ── Insight row (single text) ─────────────────────────────────────────────────
interface InsightRowProps {
  label:     string;
  text:      string;
  accentVar: string;
}

function InsightRow({ label, text, accentVar }: InsightRowProps) {
  return (
    <div
      className="border-l-2 pl-4 py-3"
      style={{
        borderColor: accentVar,
        background:  "var(--bg-3)",
      }}
    >
      <p
        className="text-[10px] tracking-[0.18em] font-semibold uppercase mb-2"
        style={{ color: accentVar }}
      >
        {label}
      </p>
      <p
        className="text-xs leading-relaxed"
        style={{ color: "var(--tx-2)" }}
      >
        {text}
      </p>
    </div>
  );
}

// ── Growth pathways row (numbered list) ───────────────────────────────────────
interface GrowthPathwaysRowProps {
  pathways: string[];
}

function GrowthPathwaysRow({ pathways }: GrowthPathwaysRowProps) {
  if (!pathways || pathways.length === 0) return null;

  return (
    <div
      className="border-l-2 pl-4 py-3"
      style={{
        borderColor: "var(--ac-1)",
        background:  "var(--bg-2)",
      }}
    >
      {/* Section header */}
      <p
        className="text-[10px] tracking-[0.18em] font-semibold uppercase mb-3"
        style={{ color: "var(--ac-1)" }}
      >
        AI Insights for Further Growth
      </p>

      {/* Numbered pathway list */}
      <ol className="space-y-2">
        {pathways.map((pathway, index) => (
          <li key={index} className="flex gap-2.5 items-start">
            {/* Index badge */}
            <span
              className="shrink-0 w-4 h-4 flex items-center justify-center text-[9px] font-bold font-mono border mt-0.5"
              style={{
                color:           "var(--ac-1)",
                borderColor:     "var(--ac-1)",
                background:      "var(--ac-bg)",
                lineHeight: "1",
              }}
            >
              {index + 1}
            </span>
            <p
              className="text-xs leading-relaxed flex-1"
              style={{ color: "var(--tx-2)" }}
            >
              {pathway}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Skeleton rows config ──────────────────────────────────────────────────────
const SKELETON_ROWS: SkeletonRowProps[] = [
  { label: "KEY INSIGHT",               accentVar: "var(--ac-1)",  bars: ["w-5/6", "w-4/5"] },
  { label: "TOP RISK",                  accentVar: "#EF5350",      bars: ["w-3/4", "w-2/3"] },
  { label: "RECOMMENDED ACTION",        accentVar: "#00897B",      bars: ["w-5/6", "w-1/2"] },
  { label: "AI INSIGHTS FOR GROWTH",    accentVar: "var(--ac-1)",  bars: ["w-full", "w-5/6", "w-4/5"] },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function AIInsightsPanel({ insights, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {SKELETON_ROWS.map((row) => (
          <SkeletonRow key={row.label} {...row} />
        ))}
      </div>
    );
  }

  const hasAny =
    insights &&
    (
      insights.key_insight ||
      insights.top_risk ||
      insights.recommended_action ||
      (insights.growth_pathways && insights.growth_pathways.length > 0)
    );

  if (!hasAny) {
    return (
      <div className="py-6 text-center">
        <p
          className="text-[10px] tracking-[0.18em] uppercase"
          style={{ color: "var(--tx-4)" }}
        >
          No analysis available
        </p>
        <p
          className="text-[10px] mt-1"
          style={{ color: "var(--tx-5)" }}
        >
          Submit a query to generate insights
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights!.key_insight && (
        <InsightRow
          label="Key Insight"
          text={insights!.key_insight}
          accentVar="var(--ac-1)"
        />
      )}
      {insights!.top_risk && (
        <InsightRow
          label="Top Risk"
          text={insights!.top_risk}
          accentVar="#EF5350"
        />
      )}
      {insights!.recommended_action && (
        <InsightRow
          label="Recommended Action"
          text={insights!.recommended_action}
          accentVar="#00897B"
        />
      )}
      {insights!.growth_pathways && insights!.growth_pathways.length > 0 && (
        <GrowthPathwaysRow pathways={insights!.growth_pathways} />
      )}
    </div>
  );
}
