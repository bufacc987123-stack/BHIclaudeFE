"use client";

/**
 * ChartRenderer — theme-aware recharts wrapper.
 *
 * ROOT CAUSE FIX FOR INVISIBLE CHARTS:
 * ResponsiveContainer reads height from its direct parent via ResizeObserver.
 * When the parent is a flex container with `align-items: center`, the child
 * gets 0 effective height. Fix: use an explicit pixel height div with
 * `display: block` (no flex/grid) as the direct parent.
 *
 * THEME AWARENESS:
 * Recharts renders inline SVG and its own DOM elements — it cannot read CSS
 * custom properties at runtime without JavaScript. We derive theme colors
 * from the `isDark` boolean prop rather than trying to resolve CSS vars.
 *
 * DATA KEY SAFETY:
 * If the LLM returns x_axis / y_axis keys that don't match the actual data
 * object keys, the chart renders axes but no series. We try the exact key
 * first; if missing, fall back to the first string key (x) or first numeric
 * key (y) found in the data rows.
 */

import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface ChartData {
  type:          "bar" | "line" | "pie";
  title:         string;
  x_axis:        string;
  y_axis:        string;
  x_axis_label?: string;
  y_axis_label?: string;
  data:          Array<Record<string, string | number>>;
}

interface Props {
  chart:  ChartData;
  isDark?: boolean;
}

// ── Color palette (semantic accent colors; same in both modes for data series) ─
const PALETTE = [
  "#89BEF6",  // primary accent — periwinkle blue (dark) / maps to --ac-1
  "#00897B",  // health teal
  "#FFA726",  // amber
  "#5A9FE8",  // primary-dark
  "#546E7A",  // secondary blue-grey
  "#BDCCD3",  // neutral slate
  "#A8D4F8",  // primary-200
  "#78909C",  // secondary-400
];

// ── Theme color resolver ──────────────────────────────────────────────────────
// Recharts uses inline SVG/styles — CSS vars are not available at that layer.
// We compute from the isDark boolean and map to the same values as globals.css.
function getTheme(isDark: boolean) {
  return {
    grid:      isDark ? "#1E3A56" : "#E0E8EE",
    axis:      isDark ? "#546E7A" : "#7A9BB5",
    cardBg:    isDark ? "#081421" : "#FFFFFF",
    cardBd:    isDark ? "#1E3A56" : "#BDCCD3",
    tooltipBg: isDark ? "#0D1F2F" : "#FFFFFF",
    tooltipBd: isDark ? "#1E3A56" : "#BDCCD3",
    tooltipTx: isDark ? "#BDCCD3" : "#263238",
    titleTx:   isDark ? "#546E7A" : "#7A9BB5",
    cursor:    isDark
      ? "rgba(137, 190, 246, 0.07)"
      : "rgba(21, 101, 192, 0.05)",
  };
}

// ── Key resolver ──────────────────────────────────────────────────────────────
function resolveKey(
  data:   Array<Record<string, string | number>>,
  hint:   string,
  prefer: "string" | "number"
): string {
  if (!data.length) return hint;
  const row = data[0];

  const exact = Object.keys(row).find(
    (k) => k.toLowerCase() === hint.toLowerCase()
  );
  if (exact) return exact;

  const fallback = Object.keys(row).find((k) =>
    prefer === "number"
      ? typeof row[k] === "number" || !isNaN(Number(row[k]))
      : typeof row[k] === "string"
  );
  return fallback ?? hint;
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
  theme,
}: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: theme.tooltipBg,
        border:          `1px solid ${theme.tooltipBd}`,
        borderRadius:    "2px",
        fontSize:        "11px",
        color:           theme.tooltipTx,
        padding:         "6px 12px",
      }}
    >
      {label !== undefined && (
        <p
          className="text-[10px] tracking-widest uppercase mb-1"
          style={{ color: theme.axis }}
        >
          {label}
        </p>
      )}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? PALETTE[0] }} className="text-xs font-mono">
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChartRenderer({ chart, isDark = true }: Props) {
  const { type, title, data, x_axis, y_axis } = chart;
  const theme = getTheme(isDark);

  if (!data || data.length === 0) {
    return (
      <div
        className="p-4 flex items-center justify-center h-[220px] border"
        style={{ background: theme.cardBg, borderColor: theme.cardBd }}
      >
        <p
          className="text-[10px] tracking-widest uppercase"
          style={{ color: theme.axis }}
        >
          No data
        </p>
      </div>
    );
  }

  const xKey      = resolveKey(data, x_axis, "string");
  const yKey      = resolveKey(data, y_axis, "number");
  const tickStyle = { fontSize: 10, fill: theme.axis };

  return (
    <div
      className="p-4 border"
      style={{ background: theme.cardBg, borderColor: theme.cardBd }}
    >
      {/* Title */}
      <p
        className="text-[10px] tracking-[0.18em] uppercase font-medium mb-4 truncate"
        style={{ color: theme.titleTx }}
      >
        {title}
      </p>

      {/* CRITICAL: explicit pixel height → ResponsiveContainer reads it correctly */}
      <div style={{ width: "100%", height: 200 }}>

        {type === "bar" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 4, right: 8, left: -16, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis
                dataKey={xKey}
                stroke={theme.axis}
                tick={tickStyle}
                angle={-35}
                textAnchor="end"
                height={50}
                interval={0}
              />
              <YAxis stroke={theme.axis} tick={tickStyle} width={40} />
              <Tooltip
                content={(props) => <CustomTooltip {...props} theme={theme} />}
                cursor={{ fill: theme.cursor }}
              />
              <Bar
                dataKey={yKey}
                fill={PALETTE[0]}
                radius={[2, 2, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {type === "line" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 4, right: 8, left: -16, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis
                dataKey={xKey}
                stroke={theme.axis}
                tick={tickStyle}
                angle={-35}
                textAnchor="end"
                height={50}
                interval={0}
              />
              <YAxis stroke={theme.axis} tick={tickStyle} width={40} />
              <Tooltip
                content={(props) => <CustomTooltip {...props} theme={theme} />}
                cursor={{ stroke: PALETTE[0], strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke={PALETTE[0]}
                strokeWidth={2}
                dot={{ fill: PALETTE[0], r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: PALETTE[0], stroke: theme.cardBg, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {type === "pie" && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey={yKey}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={72}
                innerRadius={36}
                paddingAngle={2}
                label={({ name, percent }: { name?: string | number; percent?: number }) =>
                  `${String(name ?? "").slice(0, 10)} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: theme.axis, strokeWidth: 1 }}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PALETTE[index % PALETTE.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={(props) => <CustomTooltip {...props} theme={theme} />} />
              <Legend
                wrapperStyle={{ fontSize: "10px", color: theme.axis }}
                iconType="circle"
                iconSize={6}
              />
            </PieChart>
          </ResponsiveContainer>
        )}

      </div>
    </div>
  );
}
