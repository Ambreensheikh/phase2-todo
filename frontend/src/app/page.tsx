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

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(p => [...p, { sender: "user", text: input }]);
    const currentInput = input; setInput("");
    try {
      const res = await fetch("http://127.0.0.1:8005/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });
      const d = await res.json();
      setMessages(p => [...p, { sender: "ai", text: d.response }]);
      if (d.tool_calls) {
        d.tool_calls.forEach((call: any) => {
          if (call.name === "add_task") addTask(call.arguments.task_description);
        });
      }
    } catch { setMessages(p => [...p, { sender: "ai", text: "Backend Offline. Start FastAPI!" }]); }
  };

  return (
    <div className="min-h-screen bg-[#0a050c] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      
      {/* Background Glows for Aesthetic Look */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F472B6]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />

      {/* --- Main Dashboard Content --- */}
      <div className="max-w-6xl w-full text-center z-10 space-y-12">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 shadow-xl pointer-events-auto">
          <Zap className="w-4 h-4 text-[#F472B6]" />
          <span className="text-xs font-black tracking-[0.2em] uppercase text-white/70">Phase 3: AI Backend Sync</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none">
            TaskFlow <span className="text-[#F472B6] drop-shadow-[0_0_30px_#F472B6]">AI</span>
          </h1>
          <p className="text-white/40 text-xl italic font-bold">"Accelerating your missions with AI tool calling."</p>
        </div>

        <div className="pt-4">
          <Link href="/dashboard" className="inline-block bg-[#F472B6] hover:bg-pink-400 text-white px-14 py-5 rounded-2xl text-2xl font-black transition-all hover:scale-105 shadow-[0_0_50px_rgba(244,114,182,0.4)] relative z-20 cursor-pointer">
            ENTER DASHBOARD
          </Link>
        </div>

        {/* --- 3 Square Cards (Horizontally Aligned) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 px-4">
          {[
            { icon: CheckCircle, label: "AI Ready", desc: "FastAPI Connection", color: "text-green-400", glow: "rgba(74,222,128,0.1)" },
            { icon: Zap, label: "Tool Calls", desc: "Auto Tasking", color: "text-pink-400", glow: "rgba(244,114,182,0.15)" },
            { icon: Shield, label: "Secure", desc: "Local Processing", color: "text-purple-400", glow: "rgba(168,85,247,0.1)" }
          ].map((item, i) => (
            <div key={i} 
                 className="aspect-square bg-white/5 border border-white/10 rounded-[3.5rem] flex flex-col items-center justify-center p-8 backdrop-blur-2xl hover:border-[#F472B6]/50 transition-all group shadow-2xl relative overflow-hidden"
                 style={{ boxShadow: `inset 0 0 40px ${item.glow}` }}>
              <item.icon className={`w-14 h-14 ${item.color} mb-6 group-hover:scale-110 transition-transform`} />
              <h3 className="text-2xl font-black uppercase tracking-tighter">{item.label}</h3>
              <p className="text-white/30 text-sm font-bold mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- Premium Chat Widget (Floating) --- */}
      <button onClick={() => setChatOpen(!chatOpen)} className="fixed bottom-10 right-10 w-24 h-24 bg-[#F472B6] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(244,114,182,0.6)] z-[100] hover:scale-110 active:scale-95 transition-all">
        {chatOpen ? <X size={44} /> : <MessageSquare size={44} />}
      </button>

      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.9 }} 
            className="fixed bottom-36 right-10 z-[100] bg-[#1A0B1F]/95 backdrop-blur-3xl border border-white/10 w-[420px] h-[650px] rounded-[3.5rem] overflow-hidden flex flex-col shadow-2xl shadow-pink-500/20"
          >
            <div className="bg-[#3D1425] p-7 font-black text-center border-b border-white/10 tracking-widest uppercase italic text-xl shadow-lg">Todo AI Command</div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-black/20">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-5 rounded-[2rem] text-sm font-bold shadow-xl ${m.sender === "user" ? "bg-[#F472B6] text-white" : "bg-white/10 text-white/90"}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-black/40 flex gap-3 border-t border-white/10">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Type mission..." 
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-[#F472B6]" 
              />
              <button onClick={handleSend} className="bg-[#F472B6] p-4 rounded-full shadow-[0_0_20px_#F472B6] hover:rotate-12 transition-transform"><Power size={24}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}