"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Shield, List, Home } from 'lucide-react';

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

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8005/api/v1/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks from the backend.');
      }
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while fetching tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (task_id: number) => {
    try {
      const response = await fetch(`http://localhost:8005/api/v1/tasks/${task_id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to delete task ${task_id}.`);
      }
      // Refetch tasks after successful deletion to update the UI
      fetchTasks();
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during deletion.');
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
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          <Home className="w-4 h-4" />
          <span className="text-sm font-bold">Home</span>
        </Link>
      </header>

      {/* Task List Container */}
      <main className="w-full max-w-5xl z-10 bg-black/20 border border-white/10 rounded-[2rem] p-6 backdrop-blur-3xl">
        {isLoading && (
          <div className="text-center text-pink-400 font-bold">Loading Missions...</div>
        )}
        {error && (
          <div className="text-center text-red-500 font-bold">
            <p>Error loading tasks: {error}</p>
            <p className="text-sm text-white/50 mt-2">Please ensure the backend server is running on port 8005.</p>
          </div>
        )}
        {!isLoading && !error && (
          <ul className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <motion.li
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30 font-mono">
                      ID: {task.id}
                    </span>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm font-bold transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </motion.li>
              ))
            ) : (
              <div className="text-center text-white/50 font-bold">No missions found.</div>
            )}
          </ul>
        )}
        {/* Add Task Button Container */}
        <div className="flex justify-end mt-6">
            <Link href="/" className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-md text-sm font-bold transition-all shadow-lg shadow-pink-500/20">
                Add New Mission
            </Link>
        </div>
      </main>
    </div>
  );
}