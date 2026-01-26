"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Message {
  id?: number;
  content: string;
  username: string;
  timestamp?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Connecting... 🟡");
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    // 1. Fetch User Info
    fetch("http://localhost:8000/api/me/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCurrentUser(data.username))
      .catch((err) => console.error(err));

    // 2. Fetch History
    fetch("http://localhost:8000/api/messages/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error(err));

    // 3. Connect WebSocket
    const socket = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

    socket.onopen = () => setStatus("Online 🟢");

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newMsg: Message = {
          content: data.content,
          username: data.username,
          timestamp: data.timestamp,
        };
        setMessages((prev) => [...prev, newMsg]);
      } catch (e) {
        console.error("Error parsing JSON:", e);
      }
    };

    socket.onclose = () => setStatus("Disconnected 🔴");
    ws.current = socket;

    return () => socket.close();
  }, [router]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (ws.current && input.trim()) {
      ws.current.send(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Header */}
      <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center shadow-md z-10">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Universal Chat
          </h1>
          <p className="text-xs text-gray-400">
            Logged in as: <span className="text-white font-semibold">{currentUser}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
                {status}
            </span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('/bg-pattern.svg')] bg-gray-950">
        {messages.map((msg, index) => {
          const isMe = msg.username === currentUser;
          
          return (
            <div
              key={index}
              className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex flex-col max-w-[75%] md:max-w-[60%] ${isMe ? "items-end" : "items-start"}`}>
                
                {/* Username Label (Only for others) */}
                {!isMe && (
                  <span className="text-[11px] text-gray-400 mb-1 ml-1">
                    {msg.username}
                  </span>
                )}

                {/* Message Bubble */}
                <div
                  className={`px-4 py-2 shadow-lg relative break-words break-all ${
                    isMe
                      ? "bg-blue-600 text-white rounded-2xl rounded-br-none"
                      : "bg-gray-800 text-gray-200 rounded-2xl rounded-bl-none border border-gray-700"
                  }`}
                >
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>

                {/* Timestamp */}
                <span className={`text-[10px] mt-1 opacity-60 ${isMe ? "mr-1" : "ml-1"}`}>
                    {msg.timestamp 
                        ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                        : "Just now"
                    }
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <form onSubmit={sendMessage} className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-5 py-3 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 transition-all"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Send Icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}