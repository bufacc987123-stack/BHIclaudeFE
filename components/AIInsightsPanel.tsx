"use client";

/**
 * AIInsightsPanel — Key Insight / Top Risk / Recommended Action.
 *
 * Theme: structural surfaces, borders, muted text → CSS vars.
 * Row accent colours:
 *   Key Insight        → --ac-1  (primary accent; periwinkle in dark, blue in light)
 *   Top Risk           → --tx-3  (muted secondary)
 *   Recommended Action → --bd-1  (subtle border tone)
 *
 * Loading skeleton uses --bd-1 for the animated bars so they match the
 * current surface regardless of mode.
 */

export interface AIInsights {
  key_insight?:        string;
  top_risk?:           string;
  recommended_action?: string;
}

interface Props {
  insights:   AIInsights | null;
  isLoading?: boolean;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
interface SkeletonRowProps {
  label:     string;
  bars:      string[];
  accentVar: string;   // CSS var string, e.g. "var(--ac-1)"
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

// ── Insight row ───────────────────────────────────────────────────────────────
interface InsightRowProps {
  label:     string;
  text:      string;
  accentVar: string;   // CSS var for left border + label colour
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

// ── Main component ────────────────────────────────────────────────────────────
const SKELETON_ROWS: SkeletonRowProps[] = [
  { label: "KEY INSIGHT",        accentVar: "var(--ac-1)",  bars: ["w-5/6", "w-4/5"] },
  { label: "TOP RISK",           accentVar: "var(--tx-3)",  bars: ["w-3/4", "w-2/3"] },
  { label: "RECOMMENDED ACTION", accentVar: "var(--bd-1)",  bars: ["w-5/6", "w-1/2"] },
];

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
    (insights.key_insight || insights.top_risk || insights.recommended_action);

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
          accentVar="var(--tx-3)"
        />
      )}
      {insights!.recommended_action && (
        <InsightRow
          label="Recommended Action"
          text={insights!.recommended_action}
          accentVar="var(--bd-1)"
        />
      )}
    </div>
  );
}
