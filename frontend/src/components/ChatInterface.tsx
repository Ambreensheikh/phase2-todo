'use client';

import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Power } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

const ChatInterface: React.FC = () => {
  const { addTask, setTasks } = useTaskStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Load User Email and Conversation ID on mount
  useEffect(() => {
    const email = localStorage.getItem("token"); // Phase 2 save token as email
    setUserEmail(email);
    setConversationId(`conv_${Date.now()}_${Math.random().toString(36).substring(7)}`);
  }, []);

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input; // Copy input before clearing
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8005/api/v1/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // 'ziakhan' ko hata kar logged-in user ki email ya guest use kar rahe hain
          user_id: userEmail || 'guest@taskflow.ai',
          conversation_id: conversationId,
          message: currentInput,
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
     const data = await response.json();
const aiMessage: ChatMessage = { sender: 'ai', text: data.response };
setMessages(prev => [...prev, aiMessage]);

if (data.tool_calls && data.tool_calls.length > 0) {
  data.tool_calls.forEach((tool_call: any) => {
    // 1. Add Task Sync
    if (tool_call.name === 'create_task' || tool_call.name === 'add_task') {
      // Backend 'title' bhej raha hai, hum store ka addTask call karenge
      const taskTitle = tool_call.arguments.title || tool_call.arguments.task_description;
      if (taskTitle) addTask(taskTitle);
    } 
    
    // 2. List Tasks Sync
    else if (tool_call.name === 'list_tasks') {
      // Backend se array of objects aata hai: [{id, title, completed, ...}]
      const formattedTasks = data.response_from_tool.map((task: any) => ({
        id: task.id,
        title: task.title, // 'text' ki jagah 'title' jo humne store mein change kiya
        completed: task.completed,
      }));
      setTasks(formattedTasks);
    }
  });
}

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I couldn't connect to the server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl h-full">
      <div className="bg-[#6D28D9]/50 p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F472B6] to-[#c084fc]"></div>
          <div>
            <h3 className="font-semibold text-white">Todo AI</h3>
            <p className="text-[10px] text-white/50">{userEmail || 'Guest Mode'}</p>
          </div>
        </div>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            >
              <div className={`py-2 px-4 rounded-2xl max-w-xs text-sm ${msg.sender === 'user' ? 'bg-[#6D28D9]/80 text-white rounded-br-none' : 'bg-black/20 text-white/90 rounded-bl-none'}`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && <div className="flex justify-center p-2"><div className="w-4 h-4 border-2 border-dashed border-white rounded-full animate-spin"></div></div>}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center bg-black/20 rounded-full">
            <input 
                type="text" placeholder="Message" value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-grow bg-transparent text-white px-4 focus:outline-none placeholder:text-white/40"
            />
            <motion.button 
                onClick={handleSendMessage}
                className="m-1 p-2 bg-[#F472B6]/80 rounded-full hover:bg-[#F472B6] disabled:opacity-50 transition-colors"
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                disabled={isLoading}
            >
                <Power size={18} />
            </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;