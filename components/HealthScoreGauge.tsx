"use client";

/**
 * HealthScoreGauge — SVG circular progress arc.
 *
 * Theme: structural surfaces, borders, primary text → CSS vars.
 * Arc/badge colours remain hardcoded semantic health indicators:
 *   HEALTHY  → #00897B  (teal)
 *   CAUTION  → #FFA726  (amber)
 *   CRITICAL → #EF5350  (red)
 * These are defined identically in both light and dark mode in globals.css.
 */

import { HealthResult } from "@/utils/healthScore";

interface Props {
  result: HealthResult | null;
}

const CX = 70;
const CY = 70;
const RADIUS       = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Semantic status colours — identical in both modes (defined as --st-* vars in globals.css)
const ARC_COLOR: Record<string, string> = {
  green: "#00897B",
  amber: "#FFA726",
  red:   "#EF5350",
};

const BADGE_COLOR: Record<string, string> = {
  green: "#00897B",
  amber: "#FFA726",
  red:   "#EF5350",
};

const BADGE_BORDER_ALPHA: Record<string, string> = {
  green: "rgba(0,137,123,0.35)",
  amber: "rgba(255,167,38,0.35)",
  red:   "rgba(239,83,80,0.35)",
};

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyGauge() {
  return (
    <div className="flex flex-col items-center py-8 gap-4">
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke="var(--bd-1)"
            strokeWidth="10"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-bold font-mono"
            style={{ color: "var(--tx-4)" }}
          >
            —
          </span>
          <span
            className="text-[9px] tracking-[0.18em] uppercase mt-0.5"
            style={{ color: "var(--tx-4)" }}
          >
            Health Score
          </span>
        </div>
      </div>

      <div
        className="border px-5 py-2 text-center"
        style={{ borderColor: "var(--bd-1)" }}
      >
        <div
          className="text-3xl font-bold font-mono"
          style={{ color: "var(--tx-4)" }}
        >
          —
        </div>
        <div
          className="text-[9px] tracking-[0.15em] uppercase mt-1"
          style={{ color: "var(--tx-4)" }}
        >
          Performance Grade
        </div>
      </div>

      <div
        className="flex items-center gap-2 px-4 py-1.5 border text-[10px] tracking-[0.18em] uppercase font-semibold"
        style={{ borderColor: "var(--bd-1)", color: "var(--tx-4)" }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--bd-1)" }}
        />
        Awaiting Data
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HealthScoreGauge({ result }: Props) {
  if (!result) return <EmptyGauge />;

  const offset   = CIRCUMFERENCE - (result.score / 100) * CIRCUMFERENCE;
  const arcColor = ARC_COLOR[result.statusColor];
  const badgeColor  = BADGE_COLOR[result.statusColor];
  const badgeBorder = BADGE_BORDER_ALPHA[result.statusColor];

  return (
    <div className="flex flex-col items-center gap-4 py-4">

      {/* Circular gauge */}
      <div className="relative">
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          aria-label={`Health score ${result.score}`}
        >
          {/* Track ring */}
          <circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke="var(--bd-1)"
            strokeWidth="10"
          />
          {/* Progress arc */}
          <circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke={arcColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}
          />
          {/* End dot */}
          <circle
            cx={CX}
            cy={CY - RADIUS}
            r="5"
            fill={arcColor}
            opacity="0.8"
            transform={`rotate(${(result.score / 100) * 360 - 90} ${CX} ${CY})`}
          />
        </svg>

        {/* Score label inside ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="text-3xl font-bold font-mono leading-none"
            style={{ color: "var(--tx-1)" }}
          >
            {result.score}
          </span>
          <span
            className="text-[9px] tracking-[0.18em] uppercase mt-1"
            style={{ color: "var(--tx-3)" }}
          >
            Health Score
          </span>
        </div>
      </div>

      {/* Grade block */}
      <div
        className="border px-6 py-2 text-center"
        style={{ borderColor: "var(--bd-1)", background: "var(--bg-3)" }}
      >
        <div
          className="text-4xl font-bold font-mono leading-none"
          style={{ color: "var(--tx-1)" }}
        >
          {result.grade}
        </div>
        <div
          className="text-[9px] tracking-[0.15em] uppercase mt-1.5"
          style={{ color: "var(--tx-3)" }}
        >
          Performance Grade
        </div>
      </div>

      {/* Status badge */}
      <div
        className="flex items-center gap-2 px-4 py-1.5 border text-[10px] tracking-[0.18em] uppercase font-semibold"
        style={{ borderColor: badgeBorder, color: badgeColor }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: badgeColor }}
        />
        {result.status}
      </div>

    </div>
  );
}
