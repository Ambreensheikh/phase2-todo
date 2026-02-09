"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, List, Home } from 'lucide-react';

// Define the type for a single task
interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 1. Auth Guard: Check for token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Agar token nahi hai to foran login (root) par bhej do
      router.push("/");
    } else {
      fetchTasks();
    }
  }, [router]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userEmail = localStorage.getItem("token");
      if (!userEmail) return;

      // FIXED: URL updated to match backend main.py change (/api/v1/tasks)
      const response = await fetch(`http://localhost:8005/api/v1/tasks/?user_id=${userEmail}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks.');
      }
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (task_id: number) => {
    try {
      const userEmail = localStorage.getItem("token");
      // FIXED: Added user_id param to delete request
      const response = await fetch(`http://localhost:8005/api/v1/tasks/${task_id}?user_id=${userEmail}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to delete task.`);
      }
      fetchTasks(); 
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a050c] text-white flex flex-col items-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F472B6]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-5xl z-10 flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <List className="w-8 h-8 text-[#F472B6]" />
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter">
            Mission Dashboard
          </h1>
        </div>
        <div className="flex gap-4">
            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Home className="w-4 h-4" />
            <span className="text-sm font-bold">Home</span>
            </Link>
            <button 
                onClick={() => { localStorage.removeItem("token"); router.push("/"); }}
                className="text-sm font-bold text-red-400 border border-red-400/30 px-4 py-2 rounded-lg hover:bg-red-400/10"
            >
                Logout
            </button>
        </div>
      </header>

      {/* Task List Container */}
      <main className="w-full max-w-5xl z-10 bg-black/20 border border-white/10 rounded-4xl p-6 backdrop-blur-3xl">
        {isLoading && (
          <div className="text-center text-pink-400 font-bold animate-pulse">Scanning Missions...</div>
        )}
        {error && (
          <div className="text-center text-red-500 font-bold p-4 bg-red-500/10 rounded-xl border border-red-500/20">
            <p>Connection Error: {error}</p>
            <p className="text-sm text-white/50 mt-2 italic">Tip: Ensure your FastAPI is running on port 8005</p>
          </div>
        )}
        
        {!isLoading && !error && (
          <ul className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <motion.li
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 ${task.completed ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${task.completed ? 'bg-green-500' : 'border-2 border-pink-400'}`}>
                      {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className={`font-bold ${task.completed ? 'line-through text-white/60' : 'text-white'}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-white/40">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="px-3 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 rounded-md text-sm font-bold transition-all"
                  >
                    Abort
                  </button>
                </motion.li>
              ))
            ) : (
              <div className="text-center text-white/50 py-10">No active missions. Tell the AI to add one!</div>
            )}
          </ul>
        )}

        <div className="flex justify-end mt-6">
            <button onClick={() => fetchTasks()} className="text-xs text-white/40 hover:text-white mr-4">Refresh Data</button>
        </div>
      </main>
    </div>
  );
}