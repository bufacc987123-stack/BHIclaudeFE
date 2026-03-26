"use client";

import { useState, useRef } from "react";
import { useFileParser } from "../hooks/useFileParser"; // 👈 your hook
import { uploadJSON } from "../services/api"; // 👈 API

export default function ChatInput({ sendMessage }: any) {

  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { parseFile } = useFileParser(); // 👈 use hook

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // 🔥 CLEAN FILE UPLOAD (only calling functions)
  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    try {
      setLoading(true);

      // ✅ parse from hook
      const jsonData = await parseFile(file);

      // ✅ API call from service
      await uploadJSON({
        file_name: file.name,
        data: jsonData
      });

      sendMessage(`File uploaded: ${file.name} ✅`);

    } catch (err: any) {
      console.error(err);
      sendMessage(err.message || "Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", padding: "10px", borderTop: "1px solid #ddd" }}>

      {fileName && (
        <span style={{ fontSize: "12px", color: "#555" }}>
          📁 {fileName}
        </span>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

        <div style={{ position: "relative", flex: 1 }}>

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            📎
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xlsx"
            hidden
            onChange={handleFileUpload}
          />

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            style={{
              width: "100%",
              padding: "10px 10px 10px 35px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            background: "black",
            color: "white",
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? "Uploading..." : "Send"}
        </button>

      </div>

    </div>
  );
}