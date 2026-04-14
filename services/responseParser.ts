/**
 * responseParser.ts
 *
 * Normalises the raw API payload into a UI-safe shape.
 *
 * KEY BUGS FIXED:
 *   1. Backend returns `answer` as pre-built HTML — must be passed through
 *      unchanged.  formatAnswerText() wrapped it in extra <p> tags, destroying
 *      the structure.
 *   2. Backend KPI objects use `name` not `title`.  All KPI card titles were
 *      rendering as undefined.
 *   3. Backend KPIs have no `variant` field.  Added heuristic assignment so
 *      the health score calculation is meaningful rather than a flat ~70.
 *
 * ADDITIONS:
 *   4. KPI.identifying_fields — passed through from backend for MAX/MIN records.
 *      Allows KPICard to render labeled tiles for the specific lead/company row.
 *   5. AIInsights.growth_pathways — array of specific, data-driven growth actions.
 *      Rendered by AIInsightsPanel as a numbered list under "AI Insights for Growth".
 *
 * Backend contract (expected):
 *   {
 *     answer:        string                    ← already valid HTML
 *     kpis:          { name, value, unit, insight, identifying_fields? }[]
 *     charts:        ChartData[]
 *     ai_insights?:  { key_insight?, top_risk?, recommended_action?, growth_pathways? }
 *   }
 */

import type { AIInsights } from "@/components/AIInsightsPanel";
import type { IdentifyingField } from "@/components/KPICard";

// ── Public types ──────────────────────────────────────────────────────────────

export interface KPI {
  title:               string;
  value:               string | number;
  unit?:               string;
  insight?:            string;
  trend?:              number;
  variant?:            "primary" | "success" | "warning" | "info";
  identifying_fields?: IdentifyingField[];  // non-empty only for MAX/MIN record KPIs
}

export interface Chart {
  type: string;
  [key: string]: unknown;
}

export interface ResponseMetadata {
  source:          "pre_computed" | "calculated" | "rag" | "cache" | "error";
  formula?:        string;
  columns_used?:   string[];
  warnings?:       string[];
  filter_applied?: string;
  [key: string]:   unknown;
}

export interface ParsedResponse {
  answerText:  string;
  kpis:        KPI[];
  charts:      Chart[];
  ai_insights: AIInsights | null;
  metadata?:   ResponseMetadata;
}

export interface ApiResponse {
  answer:       string | Record<string, unknown>;
  kpis?:        any[];
  charts?:      Chart[];
  ai_insights?: AIInsights;
  metadata?:    ResponseMetadata;
}

// ── HTML detection ────────────────────────────────────────────────────────────
const HTML_TAG_RE = /<[a-z][\s\S]*>/i;
function isHtml(s: string): boolean {
  return HTML_TAG_RE.test(s);
}

// ── Answer extraction ─────────────────────────────────────────────────────────
function extractAnswerText(raw: ApiResponse["answer"]): string {
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      const inner = typeof parsed.answer === "string" ? parsed.answer : JSON.stringify(parsed, null, 2);
      return inner;
    } catch {
      return raw;
    }
  }
  if (raw && typeof raw === "object") {
    const ans = (raw as any).answer;
    return typeof ans === "string" ? ans : JSON.stringify(raw, null, 2);
  }
  return "";
}

// ── KPI normalisation ─────────────────────────────────────────────────────────
// Backend uses `name`; frontend KPICard expects `title`.
// Assigns heuristic `variant` and passes through `identifying_fields`.

const REVENUE_KEYWORDS = /revenue|income|sales|earned|won|profit|margin/i;
const RISK_KEYWORDS    = /lost|churn|overdue|failed|risk|deficit|pending|unresolved/i;

function normaliseKpi(raw: any, index: number): KPI {
  const title   = (raw.title ?? raw.name ?? `Metric ${index + 1}`).toString();
  const value   = raw.value ?? 0;
  const unit    = raw.unit ?? raw.currency ?? undefined;
  const insight = raw.insight ?? raw.description ?? undefined;
  const trend   = typeof raw.trend === "number" ? raw.trend : undefined;

  // Pass through identifying_fields — validate it's a proper array of {label, value}
  let identifying_fields: IdentifyingField[] | undefined = undefined;
  if (Array.isArray(raw.identifying_fields) && raw.identifying_fields.length > 0) {
    identifying_fields = raw.identifying_fields
      .filter((f: any) => f && typeof f.label === "string" && typeof f.value === "string")
      .map((f: any): IdentifyingField => ({ label: f.label, value: f.value }));
    if (!identifying_fields || identifying_fields.length === 0) identifying_fields = undefined;
  }

  // Heuristic variant: if already set, trust it; else infer from keyword match
  let variant: KPI["variant"] = raw.variant ?? undefined;
  if (!variant) {
    if (REVENUE_KEYWORDS.test(title) && !RISK_KEYWORDS.test(title)) {
      variant = index === 0 ? "success" : "primary";
    } else if (RISK_KEYWORDS.test(title)) {
      variant = "warning";
    } else {
      variant = "primary";
    }
  }

  return { title, value, unit, insight, trend, variant, identifying_fields };
}

// ── AI insights derivation (fallback if backend omits field) ──────────────────
const RISK_RE   = /\b(risk|concern|challenge|limitation|issue|however|caution|low|below|failed|lost)\b/i;
const ACTION_RE = /\b(recommend|suggest|should|consider|improve|increase|focus|prioritize|action)\b/i;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function deriveFallbackInsights(html: string, kpis: KPI[]): AIInsights {
  const text      = stripHtml(html);
  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 20);

  const key_insight = sentences[0];
  const top_risk    =
    sentences.find(s => RISK_RE.test(s)) ??
    kpis.find(k => k.variant === "warning")?.insight;
  const recommended_action =
    sentences.find(s => ACTION_RE.test(s)) ??
    (kpis[0] ? `Continue analysing ${kpis[0].title} as the primary indicator.` : undefined);

  return { key_insight, top_risk, recommended_action };
}

// ── AI insights normalisation ─────────────────────────────────────────────────
// Validates and normalises the backend ai_insights object.
// Ensures growth_pathways is a clean string array.

function normaliseAiInsights(raw: any): AIInsights {
  const result: AIInsights = {};

  if (typeof raw.key_insight === "string" && raw.key_insight.trim())
    result.key_insight = raw.key_insight.trim();

  if (typeof raw.top_risk === "string" && raw.top_risk.trim())
    result.top_risk = raw.top_risk.trim();

  if (typeof raw.recommended_action === "string" && raw.recommended_action.trim())
    result.recommended_action = raw.recommended_action.trim();

  if (Array.isArray(raw.growth_pathways)) {
    const pathways = raw.growth_pathways
      .filter((p: any) => typeof p === "string" && p.trim().length > 0)
      .map((p: string) => p.trim());
    if (pathways.length > 0) result.growth_pathways = pathways;
  }

  return result;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function parseApiResponse(data: ApiResponse): ParsedResponse {
  // 1. Extract raw answer text (may already be HTML)
  const rawAnswer = extractAnswerText(data.answer).trim();

  // 2. If already HTML, use verbatim. Otherwise wrap plain text.
  const answerText = isHtml(rawAnswer)
    ? rawAnswer
    : formatAnswerText(rawAnswer);

  // 3. Normalise KPIs (name → title, add variant, pass through identifying_fields)
  const rawKpis = Array.isArray(data.kpis) ? data.kpis : [];
  const kpis: KPI[] = rawKpis.map((k, i) => normaliseKpi(k, i));

  // 4. Charts pass-through
  const charts: Chart[] = Array.isArray(data.charts) ? data.charts : [];

  // 5. AI insights: prefer backend field; fall back to derivation
  let ai_insights: AIInsights | null = null;
  if (data.ai_insights && typeof data.ai_insights === "object") {
    const normalised = normaliseAiInsights(data.ai_insights);
    const hasContent =
      normalised.key_insight ||
      normalised.top_risk ||
      normalised.recommended_action ||
      (normalised.growth_pathways && normalised.growth_pathways.length > 0);
    if (hasContent) ai_insights = normalised;
  }

  // Fallback derivation (no growth_pathways — text-based extraction only)
  if (!ai_insights && (answerText.length > 0 || kpis.length > 0)) {
    const derived = deriveFallbackInsights(answerText, kpis);
    if (derived.key_insight || derived.top_risk || derived.recommended_action) {
      ai_insights = derived;
    }
  }

  return { answerText, kpis, charts, ai_insights, metadata: data.metadata };
}

/**
 * Formats PLAIN TEXT (not HTML) into HTML paragraphs.
 * Called only when the answer is not already HTML.
 */
export function formatAnswerText(text: string): string {
  const paras = text
    .split(/\n\n+/)
    .map(p => p.replace(/\n/g, " ").trim())
    .filter(p => p.length > 0);
  return paras.map(p => `<p>${p}</p>`).join("");
}
