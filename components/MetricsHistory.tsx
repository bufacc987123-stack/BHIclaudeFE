"use client";

/**
 * MetricsHistory — per-session score history table.
 *
 * Theme: borders, header text, row hover, date text → CSS vars.
 * Score colour bands remain hardcoded (semantic health scale):
 *   >= 75 → #00897B (teal/healthy)
 *   >= 50 → #FFA726 (amber/caution)
 *   <  50 → #EF5350 (red/critical)
 * Change positive/negative colours also remain hardcoded for clarity.
 */

import { HistoryEntry } from "@/utils/healthScore";

interface Props {
  history: HistoryEntry[];
}

function ChangeTag({ change }: { change: number }) {
  if (change === 0)
    return (
      <span className="font-mono text-xs" style={{ color: "var(--tx-3)" }}>
        +0.0
      </span>
    );

  const positive = change > 0;
  return (
    <span
      className="font-mono text-xs font-medium"
      style={{ color: positive ? "#00897B" : "#EF5350" }}
    >
      {positive ? "+" : ""}{change.toFixed(1)}
    </span>
  );
}

function ScoreTag({ score }: { score: number }) {
  const color =
    score >= 75 ? "#00897B" :
    score >= 50 ? "#FFA726" :
                  "#EF5350";
  return (
    <span className="font-mono text-sm font-bold" style={{ color }}>
      {score}
    </span>
  );
}

const HEADERS = ["Date", "Score", "Change", "Top KPI", "Bottom KPI"];

export default function MetricsHistory({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="py-4 text-center">
        <p
          className="text-[10px] tracking-[0.18em] uppercase"
          style={{ color: "var(--tx-4)" }}
        >
          No session history
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--bd-1)" }}>
            {HEADERS.map((h) => (
              <th
                key={h}
                className="py-2 px-2 text-left text-[10px] tracking-[0.15em] uppercase font-medium first:pl-0"
                style={{ color: "var(--tx-3)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {history.map((row, i) => (
            <tr
              key={i}
              className="border-b transition-colors"
              style={{ borderColor: "var(--bd-2)" }}
            >
              <td
                className="py-2.5 px-2 font-mono first:pl-0"
                style={{ color: "var(--ac-1)" }}
              >
                {row.date}
              </td>
              <td className="py-2.5 px-2">
                <ScoreTag score={row.score} />
              </td>
              <td className="py-2.5 px-2">
                <ChangeTag change={row.change} />
              </td>
              <td
                className="py-2.5 px-2 truncate max-w-[80px]"
                style={{ color: "var(--tx-2)" }}
              >
                {row.topKpi}
              </td>
              <td
                className="py-2.5 px-2 truncate max-w-[80px]"
                style={{ color: "var(--tx-3)" }}
              >
                {row.bottomKpi}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
