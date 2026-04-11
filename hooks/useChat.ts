import { useState, useCallback } from "react";
import { sendChatMessage }                  from "../services/api";
import { parseApiResponse }                 from "../services/responseParser";
import { computeHealthFromKPIs, buildHistoryEntry } from "../utils/healthScore";
import type { HistoryEntry }  from "../utils/healthScore";
import type { AIInsights }    from "../components/AIInsightsPanel";

export interface Message {
  role:     "user" | "ai";
  text:     string;
  kpis?:    any[];
  charts?:  any[];
  isSystem?: boolean;   // true → rendered as SystemMessage, skipped in API history
}

interface Chat {
  id:       number;
  name:     string;
  messages: Message[];
}

// Dedup charts by (type, title) — mirrors backend _deduplicate_charts.
// Prevents the same chart appearing twice when the same query is repeated.
function dedupCharts(incoming: any[], existing: any[]): any[] {
  const seen = new Set(
    existing.map((c: any) =>
      `${String(c.type ?? "").toLowerCase()}::${String(c.title ?? "").toLowerCase()}`
    )
  );
  return incoming.filter((c: any) => {
    const key = `${String(c.type ?? "").toLowerCase()}::${String(c.title ?? "").toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function useChat() {
  const [chats, setChats] = useState<Chat[]>([
    { id: 1, name: "Session 1", messages: [] },
  ]);
  const [activeChatId, setActiveChatId] = useState<number>(1);

  const [kpis,       setKpis]       = useState<any[]>([]);
  const [charts,     setCharts]     = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);

  // Per-chat loading state — Set of chat IDs currently awaiting a response.
  // A single boolean would mark ALL chats as "analysing" when any one fires.
  const [analyzingIds, setAnalyzingIds] = useState<Set<number>>(new Set());

  const [history,   setHistory]   = useState<HistoryEntry[]>([]);
  const [lastScore, setLastScore] = useState<number | null>(null);

  // Get current chat messages (used for passing conversation context to API)
  const getActiveMessages = useCallback((): Message[] => {
    const chat = chats.find((c) => c.id === activeChatId);
    return chat?.messages ?? [];
  }, [chats, activeChatId]);

  // Inject a local system message — no API call, no AI turn
  const injectMessage = useCallback((text: string) => {
    const msg: Message = { role: "ai", text, isSystem: true };
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, messages: [...c.messages, msg] }
          : c
      )
    );
  }, [activeChatId]);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: Message = { role: "user", text };

      // Optimistically append user message
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, messages: [...c.messages, userMsg] }
            : c
        )
      );

      setAnalyzingIds(prev => new Set(prev).add(activeChatId));

      try {
        // Pass conversation history for context continuity
        const currentMessages = getActiveMessages();
        const data   = await sendChatMessage(text, currentMessages);
        const parsed = parseApiResponse(data);

        const aiMsg: Message = {
          role:   "ai",
          text:   parsed.answerText,
          kpis:   parsed.kpis,
          charts: parsed.charts,
        };

        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? { ...c, messages: [...c.messages, aiMsg] }
              : c
          )
        );

        if (parsed.kpis.length > 0) setKpis(parsed.kpis);

        // Accumulate charts — dedup by (type, title) to prevent duplicates
        if (parsed.charts.length > 0) {
          setCharts((prev) => {
            const newCharts = dedupCharts(parsed.charts, prev);
            return newCharts.length > 0 ? [...prev, ...newCharts] : prev;
          });
        }

        if (parsed.ai_insights) setAiInsights(parsed.ai_insights);

        if (parsed.kpis.length > 0) {
          const result = computeHealthFromKPIs(parsed.kpis);
          if (result) {
            const entry = buildHistoryEntry(result, lastScore);
            setHistory((prev) => [entry, ...prev].slice(0, 30));
            setLastScore(result.score);
          }
        }
      } catch (err) {
        console.error("[useChat] sendMessage error:", err);
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    { role: "ai", text: "<p>Analysis failed. Please check your connection and retry.</p>" },
                  ],
                }
              : c
          )
        );
      } finally {
        setAnalyzingIds(prev => {
          const next = new Set(prev);
          next.delete(activeChatId);
          return next;
        });
      }
    },
    [activeChatId, lastScore, getActiveMessages]
  );

  return {
    chats,
    setChats,
    activeChatId,
    setActiveChatId,
    sendMessage,
    injectMessage,
    kpis,
    charts,
    aiInsights,
    analyzingIds,   // Set<number> — consumers derive isAnalyzing per chat
    history,
  };
}
