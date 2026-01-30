import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket";
import type { Message } from "../types";

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = localStorage.getItem("username");
    const r = localStorage.getItem("roomId");

    if (!u || !r) {
      navigate("/");
      return;
    }

    setUsername(u);
    setRoomId(r);

    socket.on("receive_message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user_joined", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          username: "System",
          message: `${data.username} joined the room`,
          timestamp: new Date().toISOString(),
          system: true,
        },
      ]);
    });

    socket.on("user_left", () => {
      setMessages((prev) => [
        ...prev,
        {
          username: "System",
          message: "A user left the room",
          timestamp: new Date().toISOString(),
          system: true,
        },
      ]);
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_joined");
      socket.off("user_left");
    };
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    socket.emit("send_message", {
      roomId,
      username,
      message: messageInput,
    });

    setMessageInput("");
  };

  const leaveRoom = () => {
    socket.disconnect();
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="h-16 flex-none border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md z-20">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Room Code</p>
              <p className="font-mono text-lg font-bold leading-none tracking-wider text-white">{roomId}</p>
            </div>
          </div>
          
          <button
            onClick={leaveRoom}
            className="group flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-400 transition hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400"
          >
            <span>Leave</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-zinc-950 scroll-smooth">
        <div className="mx-auto min-h-full max-w-4xl px-4 py-6 sm:px-6 flex flex-col justify-end">
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
              <div className="mb-4 rounded-full bg-zinc-900 p-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <p className="text-lg font-medium text-zinc-300">It's quiet here...</p>
              <p className="text-sm text-zinc-500">Send a message to start the conversation.</p>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((msg, i) => {
              const isMe = msg.username === username;
              const isSystem = msg.system;

              // Logic to check if previous message was same user (for stacking)
              const isSequence = i > 0 && messages[i - 1].username === msg.username && !messages[i-1].system && !isSystem;

              if (isSystem) {
                return (
                  <div key={i} className="flex justify-center my-4">
                    <span className="rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                      {msg.message}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex max-w-[85%] sm:max-w-[70%] flex-col ${isMe ? "items-end" : "items-start"}`}>
                    
                    {!isSequence && (
                      <span className={`mb-1 text-[11px] font-medium ${isMe ? "text-indigo-400 mr-1" : "text-zinc-500 ml-1"}`}>
                        {isMe ? "You" : msg.username}
                      </span>
                    )}

                    <div
                      className={`relative px-4 py-3 text-sm leading-relaxed shadow-sm
                        ${isMe 
                          ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm" 
                          : "bg-zinc-800 text-zinc-100 rounded-2xl rounded-tl-sm border border-zinc-700/50"
                        }
                      `}
                    >
                      {msg.message}
                    </div>
                    
                    <span className={`mt-1 text-[10px] text-zinc-600 ${isMe ? "mr-1" : "ml-1"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none bg-zinc-950 p-4 sm:p-6 pb-6 sm:pb-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative flex items-center gap-2 rounded-2xl bg-zinc-900 border border-zinc-800 p-2 shadow-lg ring-1 ring-black/5 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder={`Message ${roomId}...`}
              className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!messageInput.trim()}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;