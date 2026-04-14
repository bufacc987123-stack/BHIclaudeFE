"use client";

/**
 * KPICard — metric tile with status tag + optional identifying fields.
 *
 * Theme: structural surfaces, borders, muted text → CSS vars (--bg-*, --bd-*,
 * --tx-*) so light/dark switch propagates automatically.
 * Status tag colours remain hardcoded: they carry semantic meaning and are
 * intentionally identical across both theme modes.
 *
 * Variants:
 *   success  → teal  — "GOOD"
 *   primary  → accent blue — "NOMINAL"
 *   warning  → amber — "ATTENTION"
 *   info     → grey  — "TRACKED"
 *
 * identifying_fields (optional):
 *   When a MAX/MIN result returns a specific row (e.g. highest deal), the
 *   backend attaches the key fields of that row here so we can render them
 *   as labeled "data pill" tiles directly below the metric value.
 *   e.g. [ { label: "Lead Name", value: "Ananya Sharma" },
 *            { label: "Company",   value: "TechCorp Pvt Ltd" } ]
 */

export interface IdentifyingField {
  label: string;
  value: string;
}

interface KPICardProps {
  title:               string;
  value:               string | number;
  unit?:               string;
  insight?:            string;
  trend?:              number;
  variant?:            "primary" | "success" | "warning" | "info";
  identifying_fields?: IdentifyingField[];
}

// Status tag: only these colours are hardcoded (semantic health colours).
const STATUS_TAG = {
  success: {
    color:  "#00897B",
    tagBg:  "rgba(0,137,123,0.10)",
    tagBd:  "rgba(0,137,123,0.25)",
    label:  "GOOD",
  },
  primary: {
    color:  "#89BEF6",
    tagBg:  "rgba(137,190,246,0.08)",
    tagBd:  "rgba(137,190,246,0.22)",
    label:  "NOMINAL",
  },
  warning: {
    color:  "#FFA726",
    tagBg:  "rgba(255,167,38,0.10)",
    tagBd:  "rgba(255,167,38,0.25)",
    label:  "ATTENTION",
  },
  info: {
    color:  "#546E7A",
    tagBg:  "rgba(84,110,122,0.10)",
    tagBd:  "rgba(84,110,122,0.25)",
    label:  "TRACKED",
  },
} as const;

// Variants that show value in accent; info shows neutral body text.
const VALUE_COLOR: Record<string, string> = {
  success: "#00897B",
  primary: "#89BEF6",
  warning: "#FFA726",
  info:    "var(--tx-2)",
};

function TrendIndicator({ trend }: { trend: number }) {
  const positive = trend >= 0;
  return (
    <span
      className="text-[10px] font-mono font-medium"
      style={{ color: positive ? "#00897B" : "#EF5350" }}
    >
      {positive ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
    </span>
  );
}

/**
 * IdentifyingFieldTile — a small labeled rectangle for a single row field.
 * Renders the label in muted uppercase and the value in accent text.
 */
function IdentifyingFieldTile({ label, value }: IdentifyingField) {
  return (
    <div
      className="flex flex-col gap-0.5 px-2 py-1.5 border"
      style={{
        background:  "var(--bg-2)",
        borderColor: "var(--bd-1)",
        minWidth: "0",
      }}
    >
      <span
        className="text-[8px] tracking-[0.16em] uppercase font-semibold leading-none truncate"
        style={{ color: "var(--tx-4)" }}
      >
        {label}
      </span>
      <span
        className="text-[11px] font-mono font-medium leading-snug truncate"
        style={{ color: "var(--tx-1)" }}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

export default function KPICard({
  title,
  value,
  unit,
  insight,
  trend,
  variant = "primary",
  identifying_fields,
}: KPICardProps) {
  const c            = STATUS_TAG[variant] ?? STATUS_TAG.primary;
  const displayValue = typeof value === "number" ? value.toLocaleString() : value;

  const hasFields =
    Array.isArray(identifying_fields) && identifying_fields.length > 0;

  return (
    <div
      className="p-4 border transition-colors"
      style={{
        background:  "var(--bg-1)",
        borderColor: "var(--bd-1)",
      }}
    >
      {/* Header: title + status tag */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <p
          className="text-[10px] tracking-[0.18em] uppercase font-medium leading-tight flex-1"
          style={{ color: "var(--tx-3)" }}
        >
          {title}
        </p>
        <span
          className="shrink-0 flex items-center gap-1 text-[9px] tracking-[0.12em] uppercase font-semibold px-2 py-0.5 border"
          style={{
            color:           c.color,
            background:      c.tagBg,
            borderColor:     c.tagBd,
          }}
        >
          <span
            className="w-1 h-1 rounded-full"
            style={{ background: c.color }}
          />
          {c.label}
        </span>
      </div>

      {/* Value row */}
      <div className="flex items-baseline gap-2 mb-2">
        <span
          className="text-2xl font-bold font-mono"
          style={{ color: VALUE_COLOR[variant] ?? VALUE_COLOR.primary }}
        >
          {displayValue}
        </span>
        {unit && (
          <span
            className="text-sm font-mono"
            style={{ color: "var(--tx-3)" }}
          >
            {unit}
          </span>
        )}
        {typeof trend === "number" && <TrendIndicator trend={trend} />}
      </div>

      {/* Identifying fields — rendered only for MAX/MIN record rows */}
      {hasFields && (
        <div className="mt-2 mb-2">
          <p
            className="text-[8px] tracking-[0.2em] uppercase font-semibold mb-1.5"
            style={{ color: "var(--tx-4)" }}
          >
            Record
          </p>
          <div className="grid grid-cols-2 gap-1">
            {identifying_fields!.map((f, i) => (
              <IdentifyingFieldTile key={i} label={f.label} value={f.value} />
            ))}
          </div>
        </div>
      )}

      {/* Insight */}
      {insight && (
        <p
          className="text-[10px] leading-relaxed border-t pt-2 mt-1"
          style={{ color: "var(--tx-3)", borderColor: "var(--bd-1)" }}
        >
          {insight}
        </p>
      )}
    </div>
  );
}
