import { useState } from "react";
import { sendChatMessage } from "../services/api";

export default function useChat() {

  const [chats, setChats] = useState<any[]>([
    {
      id: 1,
      name: "Chat 1",
      messages: []
    }
  ]);

  const [activeChatId, setActiveChatId] = useState(1);

  // 🔥 STATES
  const [kpis, setKpis] = useState<any[]>([]);
  const [charts, setCharts] = useState<any[]>([]);

  const sendMessage = async (text: string) => {

    const userMessage = { role: "user", text };

    // ✅ Add user message
    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChatId
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );

    try {
      const data = await sendChatMessage(text);

      console.log("API DATA:", data);

      // ✅ AI message
      const aiMessage = {
        role: "ai",
        text: data.answer || "No response"
      };

      setChats(prev =>
        prev.map(chat =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, aiMessage] }
            : chat
        )
      );

      // ✅ KPI
      if (data.kpis) {
        setKpis(data.kpis);
      }

      // 🔥 LINE CHART HANDLING (MAIN CHANGE)
      if (data.charts && Array.isArray(data.charts)) {

        const lineCharts = data.charts
          .filter((chart: any) => chart.type === "line") // only line chart
          .map((chart: any) => ({
            id: Date.now(),
            type: "line",
            data: chart.data // must come from DB
          }));

        if (lineCharts.length > 0) {
          setCharts(prev => [...prev, ...lineCharts]);
        }
      }

    } catch (error) {
      console.error("Chat Error:", error);
    }

  };

  return {
    chats,
    setChats,
    activeChatId,
    setActiveChatId,
    sendMessage,
    kpis,
    charts
  };
}