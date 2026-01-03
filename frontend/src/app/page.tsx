"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Zap, Shield, MessageSquare, X, Power } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";

export default function Page() {
  const { addTask } = useTaskStore();
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ sender: "ai", text: "Phase 3 active. Missions ready?" }]);
  const [conversationId, setConversationId] = useState<number | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(p => [...p, { sender: "user", text: input }]);
    const currentInput = input; setInput("");
    try {
      const res = await fetch("http://localhost:8005/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          user_id: null,
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
    } catch { setMessages(p => [...p, { sender: "ai", text: "Backend Offline. Start FastAPI!" }]); }
  };

  return (
    <div className="h-screen w-full bg-[#0a050c] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#F472B6]/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-purple-900/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl w-full text-center z-10 space-y-6">
        {/* Phase Badge - Compact */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-xl">
          <Zap className="w-3 h-3 text-[#F472B6]" />
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/70">Phase 3: AI Backend Sync</span>
        </div>

        {/* Hero Section - Resized */}
        <div className="space-y-2">
          <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter leading-none">
            TaskFlow <span className="text-[#F472B6] drop-shadow-[0_0_20px_#F472B6]">AI</span>
          </h1>
          <p className="text-white/40 text-sm md:text-base italic font-bold">"Accelerating your missions with AI tool calling."</p>
        </div>

        {/* Dashboard Button - Compact */}
        <div className="pt-2">
          <Link href="/dashboard" className="inline-block bg-[#F472B6] hover:bg-pink-400 text-white px-10 py-3 rounded-xl text-lg font-black transition-all hover:scale-105 shadow-[0_0_30px_rgba(244,114,182,0.3)] relative z-20">
            ENTER DASHBOARD
          </Link>
        </div>

        {/* Cards - Fixed width instead of aspect-square to save vertical space */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 px-4">
          {[
            { icon: CheckCircle, label: "AI Ready", desc: "FastAPI Connection", color: "text-green-400", glow: "rgba(74,222,128,0.1)" },
            { icon: Zap, label: "Tool Calls", desc: "Auto Tasking", color: "text-pink-400", glow: "rgba(244,114,182,0.15)" },
            { icon: Shield, label: "Secure", desc: "Local Processing", color: "text-purple-400", glow: "rgba(168,85,247,0.1)" }
          ].map((item, i) => (
            <div key={i} 
                 className="bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-6 backdrop-blur-2xl hover:border-[#F472B6]/50 transition-all group shadow-xl relative overflow-hidden"
                 style={{ boxShadow: `inset 0 0 20px ${item.glow}` }}>
              <item.icon className={`w-10 h-10 ${item.color} mb-4 group-hover:scale-110 transition-transform`} />
              <h3 className="text-xl font-black uppercase tracking-tighter">{item.label}</h3>
              <p className="text-white/30 text-[10px] font-bold mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Chat Icon - Compact */}
      <button onClick={() => setChatOpen(!chatOpen)} className="fixed bottom-6 right-6 w-16 h-16 bg-[#F472B6] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(244,114,182,0.5)] z-[100] hover:scale-110 active:scale-95 transition-all">
        {chatOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>

      {/* Chat Window - Height Adjusted */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.9 }} 
            className="fixed bottom-28 right-6 z-[100] bg-[#1A0B1F]/95 backdrop-blur-3xl border border-white/10 w-[350px] h-[500px] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="bg-[#3D1425] p-4 font-black text-center border-b border-white/10 tracking-widest uppercase italic text-sm shadow-lg">Todo AI Command</div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-black/20">
              {messages.map((m, i) => (
                m.text && m.text.trim() && (
                  <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`p-4 rounded-[1.5rem] text-xs font-bold shadow-xl ${m.sender === "user" ? "bg-[#F472B6] text-white" : "bg-white/10 text-white/90"}`}>{m.text}</div>
                  </div>
                )
              ))}
            </div>
            <div className="p-4 bg-black/40 flex gap-2 border-t border-white/10 flex-col">
              <p className="text-white/50 text-xs text-center mb-2">Talk to the agent naturally to update your dashboard.</p>
              <div className="flex gap-2 w-full">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="What is your mission today? (e.g. Buy milk, Finish project)" 
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-[#F472B6]" 
                />
                <button onClick={handleSend} className="bg-[#F472B6] p-2 rounded-full shadow-[0_0_15px_#F472B6]"><Power size={18}/></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}