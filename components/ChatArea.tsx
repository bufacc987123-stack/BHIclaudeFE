"use client";

import ChatInput from "./ChatInput";

export default function ChatArea({ chats, activeChatId, sendMessage }: any) {

  const activeChat = chats.find((chat: any) => chat.id === activeChatId);

  const messages = activeChat?.messages || [];

  return (
    <div className="chat-area">

      <div className="messages">

        {messages.length === 0 && (
          <div className="welcome">
            Ask me anything 👋
          </div>
        )}

        {messages.map((m: any, i: number) => (
          <div key={i} className={`msg ${m.role}`}>
            <div dangerouslySetInnerHTML={{ __html: m.text }} />
          </div>
        ))}

      </div>

      <ChatInput sendMessage={sendMessage} />

    </div>
  );
}