"use client"; // Required for client-side interactivity

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Send credentials to Django (Port 8000)
      const response = await axios.post("http://127.0.0.1:8000/api/token/", {
        username: username,
        password: password,
      });

      // 2. Save the Access Token
      const token = response.data.access;
      localStorage.setItem("accessToken", token);
      localStorage.setItem("username", username);

      // 3. Redirect to Chat Page
      alert("Login Successful! 🟢");
      router.push("/chat"); // We will create this page next
      
    } catch (err) {
      console.error("Login Failed:", err);
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center">Login</h2>
        
        {error && <p className="text-red-500 text-center bg-red-900/20 p-2 rounded">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-400">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}