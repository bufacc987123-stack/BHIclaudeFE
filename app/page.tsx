"use client";

import ChatWidget from "@/components/ChatWidget";
import useChat from "@/hooks/useChat";
import Chart from "@/components/Chart";
import KPICard from "@/components/KPICard";

export default function Home() {

  const chat = useChat();

  return (
    <div style={{
      padding: "20px",
      background: "#f5f7fb",
      minHeight: "100vh"
    }}>

      <h1 style={{ marginBottom: "20px" }}>
        Business Intelligence Dashboard
      </h1>

      {/* 🔥 KPI CARDS */}
      <div style={{
        display: "flex",
        gap: "20px",
        margin: "20px 0",
        flexWrap: "wrap"
      }}>

        {chat.kpis && chat.kpis.length > 0 ? (
          chat.kpis.map((kpi: any, i: number) => (
            <KPICard key={i} {...kpi} />
          ))
        ) : (
          <p style={{ color: "#888" }}>
            No KPI data yet. Ask something in chat 
          </p>
        )}

      </div>

      {/* 🔥 CHARTS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px"
      }}>

        {chat.charts && chat.charts.length > 0 ? (
          chat.charts.map((chart: any, i: number) => (

            <div key={i} style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
            }}>

              <h3 style={{ marginBottom: "10px" }}>
                {chart.type?.toUpperCase()} Chart
              </h3>

              {/* 🔥 SAFE RENDER */}
              {chart.data ? (
                <Chart
                  data={chart.data}
                  type={chart.type}
                />
              ) : (
                <p>No data available</p>
              )}

            </div>

          ))
        ) : (
          <p style={{ color: "#888" }}>
            No chart data yet. Ask something in chat
          </p>
        )}

      </div>

      {/* 🔥 CHAT */}
      <ChatWidget {...chat} />

    </div>
  );
}