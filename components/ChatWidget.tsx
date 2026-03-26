"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import WidgetIcon from "./WidgetIcon";
import "./Widget.css";

export default function ChatWidget({
  chats,
  setChats,
  activeChatId,
  setActiveChatId,
  sendMessage
}: any) {

  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      {open && (
        <div className="chat-widget">

          <div className="chat-header">

            <button
              className="hamburger"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>

            <span>Smart AI</span>

            <button onClick={() => setOpen(false)}>✕</button>

          </div>

          <div className="chat-body">

            {sidebarOpen && (
              <Sidebar
                chats={chats}
                setChats={setChats}
                activeChatId={activeChatId}
                setActiveChatId={setActiveChatId}
              />
            )}

            <ChatArea
              chats={chats}
              activeChatId={activeChatId}
              sendMessage={sendMessage}
            />

          </div>

        </div>
      )}

      <WidgetIcon toggle={() => setOpen(!open)} />
    </>
  );
}