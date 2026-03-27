"use client";

/**
 * ChatWidget — root shell.
 *
 * - Manages light/dark theme (default: light) — persists to localStorage.
 * - Applies [data-mode] to root div so CSS vars cascade to all children.
 * - Layout: 10% sidebar | 30% chat | 60% analytics panel.
 * - Passes `isDark` to Dashboard → ChartRenderer for Recharts inline styles.
 */

import { useState, useEffect, useCallback } from "react";
import useChat    from "../hooks/useChat";
import ChatArea   from "./ChatArea";
import Dashboard  from "./Dashboard";
import Sidebar    from "./Sidebar";

// ── Icons ─────────────────────────────────────────────────────────────────────
function ChartBarIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4"  />
      <line x1="6"  y1="20" x2="6"  y2="14" />
      <line x1="2"  y1="20" x2="22" y2="20" />
    </svg>
  );
}

function PanelIcon({ open }: { open: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <line x1={open ? 15 : 9} y1="3" x2={open ? 15 : 9} y2="21" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3"  />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

// ── Top nav ───────────────────────────────────────────────────────────────────
function TopNav({
  showPanel,
  onTogglePanel,
  isDark,
  onToggleTheme,
}: {
  showPanel:     boolean;
  onTogglePanel: () => void;
  isDark:        boolean;
  onToggleTheme: () => void;
}) {
  return (
    <header
      className="flex items-center justify-between px-6 py-3 shrink-0 border-b"
      style={{ background: "var(--bg-2)", borderColor: "var(--bd-1)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="p-1.5 border"
          style={{ borderColor: "var(--bd-1)", color: "var(--ac-1)" }}
        >
          <ChartBarIcon />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] uppercase leading-none"
             style={{ color: "var(--tx-1)" }}>
            Smart Analytics
          </p>
          <p className="text-[9px] tracking-[0.18em] uppercase mt-0.5"
             style={{ color: "var(--tx-3)" }}>
            Business Intelligence Terminal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-2 px-3 py-2 border text-[10px] tracking-[0.15em] uppercase font-semibold transition-colors"
          style={{
            borderColor: "var(--bd-1)",
            color: "var(--tx-3)",
            background: "transparent",
          }}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Dashboard toggle */}
        <button
          onClick={onTogglePanel}
          className="flex items-center gap-2 px-4 py-2 border text-[10px] tracking-[0.18em] uppercase font-semibold transition-colors"
          style={{
            borderColor: showPanel ? "var(--ac-1)" : "var(--bd-1)",
            color:       showPanel ? "var(--ac-1)" : "var(--tx-3)",
            background:  showPanel ? "var(--ac-bg)" : "transparent",
          }}
        >
          <PanelIcon open={showPanel} />
          {showPanel ? "Hide Dashboard" : "Show Dashboard"}
        </button>
      </div>
    </header>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function ChatWidget() {
  // Default: light. Persisted to localStorage.
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem("bhi-theme");
    if (stored === "dark") setIsDark(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem("bhi-theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  const {
    chats, setChats,
    activeChatId, setActiveChatId,
    sendMessage,
    kpis, charts, aiInsights,
    isAnalyzing, history,
  } = useChat();

  const [showPanel, setShowPanel] = useState(true);

  const handleNewChat = () => {
    const newId = Math.max(...chats.map((c) => c.id), 0) + 1;
    setChats(prev => [...prev, { id: newId, name: `Session ${newId}`, messages: [] }]);
    setActiveChatId(newId);
  };

  const dashboardResponse =
    kpis.length > 0 || charts.length > 0
      ? { kpis, charts, ai_insights: aiInsights ?? undefined }
      : null;

  return (
    <div
      className="h-screen flex flex-col overflow-hidden font-sans"
      data-mode={isDark ? "dark" : "light"}
      style={{ background: "var(--bg-0)" }}
    >
      <TopNav
        showPanel={showPanel}
        onTogglePanel={() => setShowPanel(v => !v)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — 10% */}
        <aside
          className="flex-none overflow-hidden flex flex-col border-r"
          style={{ width: "10%", minWidth: "120px", background: "var(--bg-2)", borderColor: "var(--bd-1)" }}
        >
          <div className="px-3 pt-4 pb-2">
            <p className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: "var(--tx-4)" }}>
              Sessions
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar
              chats={chats}
              activeChatId={activeChatId}
              setActiveChatId={setActiveChatId}
              onNewChat={handleNewChat}
            />
          </div>
        </aside>

        {/* Chat — 30% (or flex-1 when panel hidden) */}
        <main
          className="flex flex-col overflow-hidden border-r"
          style={{
            width:    showPanel ? "30%" : undefined,
            flex:     showPanel ? "none" : "1",
            minWidth: "260px",
            background: "var(--bg-4)",
            borderColor: "var(--bd-1)",
          }}
        >
          <ChatArea
            chats={chats}
            activeChatId={activeChatId}
            sendMessage={sendMessage}
            isAnalyzing={isAnalyzing}
          />
        </main>

        {/* Analytics panel — 60% */}
        {showPanel && (
          <aside
            className="flex flex-col overflow-hidden"
            style={{ width: "60%", minWidth: "360px", background: "var(--bg-0)", borderLeft: `1px solid var(--bd-1)` }}
          >
            <div
              className="px-5 py-3 shrink-0 border-b"
              style={{ background: "var(--bg-2)", borderColor: "var(--bd-1)" }}
            >
              <p className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: "var(--tx-3)" }}>
                Analytical Suite
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <Dashboard
                response={dashboardResponse}
                isAnalyzing={isAnalyzing}
                history={history}
                isDark={isDark}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
