"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Zap, Shield, MessageSquare, X, Power } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";

export default function Page() {
  const { addTask } = useTaskStore();
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ sender: "ai", text: "Phase 3 active. Missions ready?" }]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setIsLoggedIn(true);
      setToken(storedToken);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !isLoggedIn) return;
    setMessages(p => [...p, { sender: "user", text: input }]);
    const currentInput = input; 
    setInput("");

    try {
      const res = await fetch("http://localhost:8005/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          user_id: token,
          conversation_id: conversationId,
        }),
      });
      const d = await res.json();
      setConversationId(d.conversation_id);
      setMessages(p => [...p, { sender: "ai", text: d.response }]);
      if (d.tool_calls) {
        d.tool_calls.forEach((call: any) => {
          if (call.name === "add_task") addTask(call.arguments.task_description);
        });
      }
    } catch (err: any) {
      setMessages(p => [...p, { sender: "ai", text: "Backend Offline. Start FastAPI on 8005!" }]);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0a050c] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#F472B6]/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-purple-900/20 blur-[100px] rounded-full pointer-events-none" />

      {/* 1. Status Bar (Top Right) - Sirf Token dikhega */}
      <div className="absolute top-6 right-6 z-50">
        {isLoggedIn && (
          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-white/50 truncate max-w-[150px]">{token}</span>
          </div>
        )}
      </div>

      <div className="max-w-5xl w-full text-center z-10 space-y-8">
        {/* Phase Indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-xl">
          <Zap className="w-3 h-3 text-[#F472B6]" />
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/70">Phase 3: AI Backend Sync</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none"
          >
            TaskFlow <span className="text-[#F472B6] drop-shadow-[0_0_20px_#F472B6]">AI</span>
          </motion.h1>
          <p className="text-white/40 text-sm md:text-lg italic font-bold">"Accelerating your missions with AI tool calling."</p>
        </div>

        {/* 2. Main Center Buttons - Yahan set kiye hain dono buttons */}
        <div className="flex flex-row items-center gap-6 justify-center pt-4">
          <Link 
            href={isLoggedIn ? "/dashboard" : "/login"} 
            className="bg-[#F472B6] hover:bg-pink-400 text-white px-10 py-4 rounded-xl text-lg font-black transition-all hover:scale-105 shadow-[0_0_30px_rgba(244,114,182,0.3)]"
          >
            {isLoggedIn ? "ENTER DASHBOARD" : "LOGIN AGENT"}
          </Link>
          
          <Link 
            href="/signup" 
            className="bg-white/5 hover:bg-white/10 text-white border border-white/20 px-10 py-4 rounded-xl text-lg font-black transition-all hover:scale-105 backdrop-blur-md"
          >
            GET STARTED
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 px-4">
          {[
            { icon: CheckCircle, label: "AI Ready", desc: "FastAPI Connection", color: "text-green-400" },
            { icon: Zap, label: "Tool Calls", desc: "Auto Tasking", color: "text-pink-400" },
            { icon: Shield, label: "Secure", desc: "Local Processing", color: "text-purple-400" }
          ].map((item, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-6 backdrop-blur-2xl hover:border-[#F472B6]/50 transition-all group shadow-xl">
              <item.icon className={`w-10 h-10 ${item.color} mb-4 group-hover:scale-110 transition-transform`} />
              <h3 className="text-xl font-black uppercase tracking-tighter">{item.label}</h3>
              <p className="text-white/30 text-[10px] font-bold mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Chat UI */}
      <button onClick={() => setChatOpen(!chatOpen)} className="fixed bottom-6 right-6 w-16 h-16 bg-[#F472B6] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(244,114,182,0.5)] z-[100] hover:scale-110 transition-all">
        {chatOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>

      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} 
            className="fixed bottom-28 right-6 z-[100] bg-[#1A0B1F]/95 backdrop-blur-3xl border border-white/10 w-[350px] h-[500px] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="bg-[#3D1425] p-4 font-black text-center border-b border-white/10 tracking-widest uppercase text-sm">Todo AI Command</div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-4 rounded-[1.5rem] text-xs font-bold ${m.sender === "user" ? "bg-[#F472B6]" : "bg-white/10"}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-black/40 border-t border-white/10 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} 
                placeholder={isLoggedIn ? "Talk..." : "Login first..."} disabled={!isLoggedIn}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs outline-none" 
              />
              <button onClick={handleSend} disabled={!isLoggedIn} className="bg-[#F472B6] p-2 rounded-full"><Power size={18}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}