"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Connecting... 🟡");
  const ws = useRef<WebSocket | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Get Token
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    // 2. Connect to Go WebSocket
    // Note: We send the token in the URL query params
    const socket = new WebSocket(`ws://localhost:8080/ws?token=${token}`);
    
    socket.onopen = () => {
      setStatus("Connected 🟢");
      console.log("Connected to Go Server");
    };

    socket.onmessage = (event) => {
      // Go sends back raw text, we just add it to our list
      setMessages((prev) => [...prev, event.data]);
    };

    socket.onclose = () => {
      setStatus("Disconnected 🔴");
    };

    ws.current = socket;

    // Cleanup when page closes
    return () => {
      socket.close();
    };
  }, [router]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (ws.current && input.trim()) {
      ws.current.send(input);
      setInput(""); // Clear input box
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 bg-gray-800 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Universal Chat 🚀</h1>
        <span className="text-sm font-mono">{status}</span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className="p-3 bg-gray-700 rounded-lg max-w-xs break-words">
            {msg}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-gray-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}