"use client";

/**
 * Dashboard — right-side analytics panel.
 *
 * Theme: all structural colors via CSS custom properties (--bg-*, --bd-*,
 * --tx-*) so light/dark toggling in ChatWidget cascades here automatically.
 * Status/health colors (#00897B, #FFA726, #EF5350) remain hardcoded — they
 * carry semantic meaning and are defined identically in both theme modes.
 *
 * Auto-pie chart:
 * For every backend bar chart with ≤ 12 data points, a companion pie chart
 * is derived purely as a rendering transform (no state mutation). The backend
 * data model is unchanged; only Dashboard's render output expands.
 */

import KPICard               from "./KPICard";
import ChartRenderer         from "./ChartRenderer";
import HealthScoreGauge      from "./HealthScoreGauge";
import AIInsightsPanel       from "./AIInsightsPanel";
import MetricsHistory        from "./MetricsHistory";
import { computeHealthFromKPIs } from "@/utils/healthScore";
import type { HistoryEntry } from "@/utils/healthScore";
import type { AIInsights }   from "./AIInsightsPanel";
import type { ChartData }    from "./ChartRenderer";

interface KPI {
  title:    string;
  value:    number | string;
  unit?:    string;
  insight?: string;
  trend?:   number;
  variant?: string;
}

interface DashboardProps {
  response: {
    answer?:      string;
    kpis?:        KPI[];
    charts?:      ChartData[];
    ai_insights?: AIInsights;
  } | null;
  isAnalyzing?: boolean;
  history?:     HistoryEntry[];
  isDark?:      boolean;
}

// ── Auto pie chart derivation ─────────────────────────────────────────────────
// For bar charts with ≤ 12 data points we append a companion pie chart.
// This is a rendering transform only — source state is not mutated.
function expandWithPieCharts(charts: ChartData[]): ChartData[] {
  return charts.flatMap((chart) => {
    if (chart.type === "bar" && chart.data.length <= 12) {
      const pie: ChartData = {
        ...chart,
        type:  "pie",
        title: `${chart.title} — Distribution`,
      };
      return [chart, pie];
    }
    return [chart];
  });
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-[10px] tracking-[0.22em] uppercase font-medium whitespace-nowrap"
          style={{ color: "var(--tx-3)" }}
        >
          {label}
        </span>
        <div className="flex-1 h-px" style={{ background: "var(--bd-1)" }} />
      </div>
      {children}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div
        className="w-10 h-10 border flex items-center justify-center"
        style={{ borderColor: "var(--bd-1)" }}
      >
        <span
          className="text-[10px] font-mono tracking-wider"
          style={{ color: "var(--tx-4)" }}
        >
          BHI
        </span>
      </div>
      <p
        className="text-[10px] tracking-[0.18em] uppercase text-center leading-relaxed"
        style={{ color: "var(--tx-4)" }}
      >
        Upload a dataset and ask a question<br />to generate the analytics report
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Dashboard({
  response,
  isAnalyzing = false,
  history = [],
  isDark = true,
}: DashboardProps) {
  const kpis     = response?.kpis    ?? [];
  const charts   = response?.charts  ?? [];
  const insights = response?.ai_insights ?? null;

  const healthResult  = computeHealthFromKPIs(kpis);
  const hasContent    = kpis.length > 0 || charts.length > 0;
  const expandedCharts = expandWithPieCharts(charts);

  if (!hasContent && !isAnalyzing) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6 pb-4">

      {/* 1 — Business Health Index */}
      <Section label="Business Health Index">
        <div
          className="border p-4"
          style={{ borderColor: "var(--bd-1)", background: "var(--bg-1)" }}
        >
          <HealthScoreGauge result={healthResult} />
        </div>
      </Section>

      {/* 2 — Key Metric Analysis */}
      {kpis.length > 0 && (
        <Section label="Key Metric Analysis">
          <div className="space-y-2">
            {kpis.map((kpi, idx) => (
              <KPICard
                key={idx}
                title={kpi.title}
                value={kpi.value}
                unit={kpi.unit}
                insight={kpi.insight}
                trend={kpi.trend}
                variant={
                  (kpi.variant as "primary" | "success" | "warning" | "info") ??
                  "primary"
                }
              />
            ))}
          </div>
        </Section>
      )}

      {/* 3 — AI Intelligence */}
      <Section label="AI Intelligence">
        <div
          className="border p-4"
          style={{ borderColor: "var(--bd-1)", background: "var(--bg-1)" }}
        >
          <p
            className="text-[9px] tracking-[0.22em] uppercase mb-3"
            style={{ color: "var(--tx-4)" }}
          >
            Analysis Engine
          </p>
          <AIInsightsPanel
            insights={insights}
            isLoading={isAnalyzing && !insights}
          />
        </div>
      </Section>

      {/* 4 — Charts (bar + companion pie for each bar chart) */}
      {expandedCharts.length > 0 && (
        <Section label={`Charts · ${expandedCharts.length}`}>
          <div className="space-y-3">
            {expandedCharts.map((chart, idx) => (
              <ChartRenderer key={idx} chart={chart} isDark={isDark} />
            ))}
          </div>
        </Section>
      )}

      {/* 5 — Session Report History */}
      <Section label="Session Report History">
        <div
          className="border p-4"
          style={{ borderColor: "var(--bd-1)", background: "var(--bg-1)" }}
        >
          <MetricsHistory history={history} />
        </div>
      </Section>

    </div>
  );
}
