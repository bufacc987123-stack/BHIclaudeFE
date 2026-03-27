"use client";

/**
 * ChatArea — messages + input column.
 *
 * Theme: all structural surfaces, borders, text → CSS vars so light/dark
 * switch propagates automatically from the ChatWidget root.
 *
 * answer-prose class (globals.css) handles p/ul/li/strong/em inside
 * dangerouslySetInnerHTML — no need for Tailwind [&_p]: overrides here.
 */

import { useEffect, useRef } from "react";
import ChatInput from "./ChatInput";

// ── Analyzing indicator ───────────────────────────────────────────────────────
function AnalyzingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        className="max-w-xs border px-5 py-3"
        style={{ background: "var(--bg-1)", borderColor: "var(--bd-1)" }}
      >
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "var(--ac-1)",
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
          <span
            className="text-[10px] tracking-[0.22em] uppercase ml-1"
            style={{ color: "var(--tx-3)" }}
          >
            Analyzing
          </span>
        </div>
      </div>
    </div>
  );
}

// ── User message ───────────────────────────────────────────────────────────────
function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-md border px-5 py-3"
        style={{ background: "var(--bg-2)", borderColor: "var(--bd-1)" }}
      >
        <p className="text-sm leading-relaxed" style={{ color: "var(--tx-2)" }}>
          {text}
        </p>
      </div>
    </div>
  );
}

// ── AI message ─────────────────────────────────────────────────────────────────
function AIBubble({ text, kpis }: { text: string; kpis?: any[] }) {
  return (
    <div className="flex justify-start">
      <div
        className="max-w-lg w-full border px-5 py-4"
        style={{ background: "var(--bg-1)", borderColor: "var(--bd-1)" }}
      >
        {/* Analysis label */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-1 h-1 rounded-full"
            style={{ background: "var(--ac-1)" }}
          />
          <span
            className="text-[9px] tracking-[0.22em] uppercase font-medium"
            style={{ color: "var(--tx-3)" }}
          >
            Analysis
          </span>
        </div>

        {/* Answer text — answer-prose class applies p/ul/li styling from globals.css */}
        <div
          className="answer-prose text-sm leading-relaxed"
          style={{ color: "var(--tx-2)" }}
          dangerouslySetInnerHTML={{ __html: text }}
        />

        {/* Inline KPI mini-grid (first 4 KPIs for quick reference) */}
        {kpis && kpis.length > 0 && (
          <div
            className="mt-4 pt-4 border-t grid grid-cols-2 gap-2"
            style={{ borderColor: "var(--bd-1)" }}
          >
            {kpis.slice(0, 4).map((kpi: any, i: number) => (
              <div
                key={i}
                className="border px-3 py-2"
                style={{ borderColor: "var(--bd-1)", background: "var(--bg-3)" }}
              >
                <p
                  className="text-[9px] tracking-[0.15em] uppercase font-medium mb-1 truncate"
                  style={{ color: "var(--tx-3)" }}
                >
                  {kpi.title}
                </p>
                <p
                  className="text-sm font-bold font-mono"
                  style={{ color: "var(--ac-1)" }}
                >
                  {typeof kpi.value === "number"
                    ? kpi.value.toLocaleString()
                    : kpi.value}
                  {kpi.unit ? ` ${kpi.unit}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── System / upload confirmation ───────────────────────────────────────────────
function SystemMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-center">
      <div
        className="border px-4 py-2"
        style={{ background: "var(--bg-3)", borderColor: "var(--bd-1)" }}
      >
        <p
          className="text-[10px] tracking-[0.15em] uppercase"
          style={{ color: "var(--tx-3)" }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState() {
  const prompts = [
    "What is the total deal value by owner?",
    "Show me deals by pipeline stage",
    "Which leads have the highest conversion rate?",
    "Compare revenue trends over time",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
      <div className="text-center">
        <p
          className="text-[10px] tracking-[0.3em] uppercase mb-2"
          style={{ color: "var(--tx-3)" }}
        >
          Analytics Interface
        </p>
        <p className="text-sm" style={{ color: "var(--tx-2)" }}>
          Upload a dataset and submit a query
        </p>
      </div>
      <div className="w-full max-w-sm space-y-2">
        <p
          className="text-[9px] tracking-[0.22em] uppercase mb-2"
          style={{ color: "var(--tx-4)" }}
        >
          Example queries
        </p>
        {prompts.map((p, i) => (
          <div
            key={i}
            className="border px-4 py-2.5 text-xs cursor-default transition-colors"
            style={{
              borderColor: "var(--bd-1)",
              color:        "var(--tx-3)",
            }}
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
interface Props {
  chats:        any[];
  activeChatId: number;
  sendMessage:  (text: string) => void;
  isAnalyzing?: boolean;
}

export default function ChatArea({
  chats,
  activeChatId,
  sendMessage,
  isAnalyzing = false,
}: Props) {
  const activeChat = chats.find((c: any) => c.id === activeChatId);
  const messages   = activeChat?.messages ?? [];

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isAnalyzing]);

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && !isAnalyzing ? (
          <EmptyState />
        ) : (
          <>
            {messages.map((m: any, i: number) => {
              const isSystem =
                m.role === "ai" &&
                !m.kpis?.length &&
                (m.text.includes("uploaded") || m.text.includes("Upload"));

              if (m.role === "user") return <UserBubble key={i} text={m.text} />;
              if (isSystem) {
                const raw = m.text.replace(/<[^>]+>/g, "").trim();
                return <SystemMessage key={i} text={raw} />;
              }
              return <AIBubble key={i} text={m.text} kpis={m.kpis} />;
            })}

            {isAnalyzing && <AnalyzingIndicator />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input bar */}
      <div
        className="border-t p-4"
        style={{ borderColor: "var(--bd-1)", background: "var(--bg-1)" }}
      >
        <ChatInput sendMessage={sendMessage} isDisabled={isAnalyzing} />
      </div>
    </div>
  );
}
