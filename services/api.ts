const BACKEND_URL = "http://127.0.0.1:8000";

// ── Session ID ────────────────────────────────────────────────────────────────
// Generated once per browser tab, stored in sessionStorage.
// sessionStorage clears on tab close — new tab = new session = clean state.
function getSessionId(): string {
  const KEY = "x-session-id";
  let sid = sessionStorage.getItem(KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(KEY, sid);
  }
  return sid;
}

function sessionHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Session-ID": getSessionId(),
  };
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export async function sendChatMessage(
  message: string,
  history: Array<{ role: "user" | "ai"; text: string }> = []
) {
  try {
    // Map internal role names to what the backend expects
    const chatHistory = [
      ...history
        .filter((m) => !m.text.startsWith("__SYSTEM"))
        .map((m) => ({
          role:    m.role === "user" ? "human" : "ai",
          content: m.text.replace(/<[^>]+>/g, "").trim(),   // strip HTML for context
          type:    "text",
        })),
      { role: "human", content: message, type: "text" },
    ];

    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method:  "POST",
      headers: sessionHeaders(),
      body:    JSON.stringify({ chat_history: chatHistory }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[API] sendChatMessage:", err);
    return { answer: "Server error. Please retry.", kpis: [], charts: [] };
  }
}

// ── Upload ────────────────────────────────────────────────────────────────────
export interface UploadError extends Error {
  status?: number;
}

export async function uploadJSON(payload: unknown): Promise<unknown> {
  const res = await fetch(`${BACKEND_URL}/api/upload-json`, {
    method:  "POST",
    headers: sessionHeaders(),
    body:    JSON.stringify(payload),
  });

  if (res.status === 409) {
    const body = await res.json().catch(() => ({}));
    const err: UploadError = new Error(
      (body as any).detail ?? "Session already locked with a dataset. Reset the session to upload new data."
    );
    err.status = 409;
    throw err;
  }

  if (!res.ok) {
    throw new Error(`Upload failed: HTTP ${res.status}`);
  }

  return res.json();
}

// ── Reset session ─────────────────────────────────────────────────────────────
export async function resetSession(): Promise<void> {
  await fetch(`${BACKEND_URL}/api/reset-session`, {
    method:  "POST",
    headers: sessionHeaders(),
  });
}
