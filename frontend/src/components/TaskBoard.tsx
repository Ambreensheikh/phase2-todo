'use client';

import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const TaskBoard: React.FC = () => {
  const { tasks, toggleTask } = useTaskStore();
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 mt-10">
      <h2 className="text-2xl font-bold text-white mb-6">Your Missions</h2>
      <div className="space-y-3">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <motion.div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="flex items-center justify-between bg-black/20 p-4 rounded-xl cursor-pointer hover:bg-black/40 transition-colors"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-[#F472B6] border-[#F472B6]' : 'border-white/30'}`}>
                  {task.completed && <Check size={14} />}
                </div>
                {/* FIXED: task.text -> task.title */}
                <span className={`ml-4 text-white/90 ${task.completed ? 'line-through text-white/50' : ''}`}>{task.title}</span>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-white/50 py-4">No missions yet. Use the AI to add a new one!</p>
        )}
      </div>
    </div>
  );
}

export default TaskBoard;