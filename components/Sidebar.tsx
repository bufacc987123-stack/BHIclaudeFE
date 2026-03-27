"use client";

/**
 * Sidebar — session list.
 *
 * Theme: all structural colours → CSS vars.
 * Active session: --ac-1 border/text, --ac-bg background.
 * Hover: --bg-4 background, --tx-2 text.
 */

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5"  y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6"  x2="6"  y2="18" />
      <line x1="6"  y1="6"  x2="18" y2="18" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

type SidebarProps = {
  chats:           any[];
  activeChatId:    number;
  setActiveChatId: (id: number) => void;
  onNewChat:       () => void;
};

export default function Sidebar({
  chats,
  activeChatId,
  setActiveChatId,
  onNewChat,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* New session button */}
      <div className="px-4 py-4 border-b" style={{ borderColor: "var(--bd-1)" }}>
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border text-[10px] tracking-[0.22em] uppercase font-semibold transition-colors"
          style={{
            background:  "var(--bg-1)",
            borderColor: "var(--bd-1)",
            color:       "var(--tx-3)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ac-1)";
            (e.currentTarget as HTMLButtonElement).style.color       = "var(--ac-1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--bd-1)";
            (e.currentTarget as HTMLButtonElement).style.color       = "var(--tx-3)";
          }}
        >
          <PlusIcon />
          New Session
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-3 space-y-0.5">
        {chats.length === 0 && (
          <p
            className="px-4 py-4 text-[10px] tracking-[0.18em] uppercase text-center"
            style={{ color: "var(--tx-4)" }}
          >
            No sessions
          </p>
        )}

        {chats.map((chat) => {
          const isActive = chat.id === activeChatId;
          return (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className="mx-2 flex items-center gap-3 px-3 py-2.5 cursor-pointer border transition-colors"
              style={
                isActive
                  ? {
                      borderColor: "var(--ac-1)",
                      background:  "var(--ac-bg)",
                      color:       "var(--ac-1)",
                    }
                  : {
                      borderColor: "transparent",
                      color:       "var(--tx-3)",
                    }
              }
            >
              <ChatIcon />
              <span className="flex-1 text-xs truncate leading-none">
                {chat.name}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="shrink-0 transition-colors"
                style={{ color: "var(--tx-4)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color = "#EF5350")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color = "var(--tx-4)")
                }
                aria-label={`Close ${chat.name}`}
              >
                <CloseIcon />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
