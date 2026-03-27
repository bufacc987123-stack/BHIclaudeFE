"use client";

/**
 * ChatInput — text field + file attach + send.
 *
 * Theme: all structural colours → CSS vars.
 * Send button:   --ac-1 background, --ac-text-btn text (inverts correctly
 *                for light mode, where --ac-1 is dark blue and text is white).
 * Focus ring:    --ac-1 border.
 * Disabled:      --bd-1 background, --tx-5 text.
 */

import { useState, useRef } from "react";
import { useFileParser }    from "../hooks/useFileParser";
import { uploadJSON }       from "../services/api";

interface Props {
  sendMessage: (text: string) => void;
  isDisabled?: boolean;
}

function AttachIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

export default function ChatInput({ sendMessage, isDisabled = false }: Props) {
  const [text,        setText]        = useState("");
  const [fileName,    setFileName]    = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { parseFile } = useFileParser();

  const isBusy = isDisabled || isUploading;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    sendMessage(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    try {
      const jsonData = await parseFile(file);
      await uploadJSON({ file_name: file.name, data: jsonData });
      sendMessage(`File uploaded: ${file.name}`);
    } catch (err: any) {
      console.error("[ChatInput] Upload error:", err);
      sendMessage(`Upload failed: ${err?.message ?? "unknown error"}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {/* File badge */}
      {fileName && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 border"
          style={{ background: "var(--bg-3)", borderColor: "var(--bd-1)" }}
        >
          <span style={{ color: "var(--tx-3)" }}><AttachIcon /></span>
          <span
            className="text-[10px] tracking-[0.12em] truncate"
            style={{ color: "var(--tx-3)" }}
          >
            {fileName}
          </span>
          {isUploading && (
            <span
              className="text-[10px] tracking-widest uppercase ml-auto"
              style={{ color: "var(--tx-4)" }}
            >
              Processing...
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.json"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isBusy}
        />

        {/* Attach button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
          className="shrink-0 p-2.5 border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background:  "var(--bg-1)",
            borderColor: "var(--bd-1)",
            color:       "var(--tx-3)",
          }}
          title="Attach CSV / XLSX / JSON"
          aria-label="Attach file"
        >
          <AttachIcon />
        </button>

        {/* Text field */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter query..."
          disabled={isBusy}
          className="flex-1 px-4 py-2.5 border text-sm font-mono transition-colors focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background:   "var(--bg-1)",
            borderColor:  "var(--bd-1)",
            color:        "var(--tx-2)",
          }}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isBusy || !text.trim()}
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.15em] uppercase font-semibold transition-colors disabled:cursor-not-allowed"
          style={{
            background:  isBusy || !text.trim() ? "var(--bd-1)"         : "var(--ac-1)",
            color:       isBusy || !text.trim() ? "var(--tx-4)"         : "var(--ac-text-btn)",
          }}
          aria-label="Send message"
        >
          {isDisabled ? <Spinner /> : <SendIcon />}
          <span>{isDisabled ? "Analyzing" : "Send"}</span>
        </button>
      </div>
    </div>
  );
}
