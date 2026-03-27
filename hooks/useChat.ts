import { useState, useCallback } from "react";
import { sendChatMessage }                  from "../services/api";
import { parseApiResponse }                 from "../services/responseParser";
import { computeHealthFromKPIs, buildHistoryEntry } from "../utils/healthScore";
import type { HistoryEntry }  from "../utils/healthScore";
import type { AIInsights }    from "../components/AIInsightsPanel";

/**
 * useChat — central state hub for the chat + dashboard.
 *
 * BUGS FIXED:
 *  1. Double-format regression: parsed.answerText is ALREADY HTML from
 *     responseParser (HTML passthrough or plain-text → <p> wrapped).
 *     Calling formatAnswerText() on it again produced <p><p>...</p></p>.
 *     Fix: use parsed.answerText directly as aiMsg.text.
 *
 *  2. Chart replace instead of accumulate: setCharts(parsed.charts)
 *     wiped previous charts on each query.
 *     Fix: append → setCharts(prev => [...prev, ...parsed.charts])
 */

interface Message {
  role:   "user" | "ai";
  text:   string;
  kpis?:  any[];
  charts?: any[];
}

interface Chat {
  id:       number;
  name:     string;
  messages: Message[];
}

export default function useChat() {
  const [chats, setChats] = useState<Chat[]>([
    { id: 1, name: "Session 1", messages: [] },
  ]);
  const [activeChatId, setActiveChatId] = useState<number>(1);

  // Dashboard state
  const [kpis,        setKpis]        = useState<any[]>([]);
  const [charts,      setCharts]      = useState<any[]>([]);
  const [aiInsights,  setAiInsights]  = useState<AIInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Per-session score history (resets on page reload)
  const [history,     setHistory]     = useState<HistoryEntry[]>([]);
  const [lastScore,   setLastScore]   = useState<number | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: Message = { role: "user", text };

      // Optimistically append user message
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, userMsg] }
            : chat
        )
      );

      setIsAnalyzing(true);

      try {
        const data   = await sendChatMessage(text);
        const parsed = parseApiResponse(data);

        // parsed.answerText is already-formatted HTML — do NOT re-format.
        const aiMsg: Message = {
          role:   "ai",
          text:   parsed.answerText,
          kpis:   parsed.kpis,
          charts: parsed.charts,
        };

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChatId
              ? { ...chat, messages: [...chat.messages, aiMsg] }
              : chat
          )
        );

        // Update KPIs (latest replaces; they summarise current state)
        if (parsed.kpis.length > 0)   setKpis(parsed.kpis);

        // ACCUMULATE charts — new charts append; old ones stay accessible via scroll
        if (parsed.charts.length > 0) {
          setCharts((prev) => [...prev, ...parsed.charts]);
        }

        if (parsed.ai_insights)       setAiInsights(parsed.ai_insights);

        // Compute health score and push to history
        if (parsed.kpis.length > 0) {
          const result = computeHealthFromKPIs(parsed.kpis);
          if (result) {
            const entry = buildHistoryEntry(result, lastScore);
            setHistory((prev) => [entry, ...prev].slice(0, 30)); // keep last 30
            setLastScore(result.score);
          }
        }
      } catch (err) {
        console.error("[useChat] sendMessage error:", err);

        const errMsg: Message = {
          role: "ai",
          text: "<p>Analysis failed. Please check your connection and retry.</p>",
        };
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChatId
              ? { ...chat, messages: [...chat.messages, errMsg] }
              : chat
          )
        );
      } finally {
        setIsAnalyzing(false);
      }
    },
    [activeChatId, lastScore]
  );

  return {
    chats,
    setChats,
    activeChatId,
    setActiveChatId,
    sendMessage,
    kpis,
    charts,
    aiInsights,
    isAnalyzing,
    history,
  };
}
