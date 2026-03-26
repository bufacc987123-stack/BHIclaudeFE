"use client";

type SidebarProps = {
  chats: any[];
  setChats: React.Dispatch<React.SetStateAction<any[]>>;
  activeChatId: number;
  setActiveChatId: React.Dispatch<React.SetStateAction<number>>;
};

export default function Sidebar({
  chats,
  setChats,
  activeChatId,
  setActiveChatId
}: SidebarProps) {

  const createNewChat = () => {

    const newChat = {
      id: Date.now(),
      name: `Chat ${chats.length + 1}`,
      messages: []
    };

    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  const deleteChat = (id:number) => {

    const updated = chats.filter(chat => chat.id !== id);

    setChats(updated);

    if(updated.length){
      setActiveChatId(updated[0].id);
    }

  };

  return (

    <div className="sidebar">

      <button className="new-chat" onClick={createNewChat}>
        + New Chat
      </button>

      {chats.map(chat => (

        <div
          key={chat.id}
          className={`chat-item ${chat.id === activeChatId ? "active" : ""}`}
          onClick={() => setActiveChatId(chat.id)}
        >

          <span>{chat.name}</span>

          <button
            className="delete-btn"
            onClick={(e)=>{
              e.stopPropagation();
              deleteChat(chat.id);
            }}
          >
            🗑
          </button>

        </div>

      ))}

    </div>

  );
}