"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8005/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          name: name,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed. Please try again.');
      }

      // On successful signup, redirect to login page
      router.push('/login');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a050c] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] left-[-20%] w-[50%] h-[50%] bg-pink-900/20 blur-[150px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10 bg-black/20 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-blue-600/20 border border-blue-700 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter">Create Account</h1>
          <p className="text-white/50 mt-1">Join the ranks of TaskFlow agents.</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-white/60" htmlFor="name">
              Agent Name
            </label>
            <input
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              type="text"
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-white/60" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              type="email"
              id="email"
              placeholder="agent@taskflow.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2 text-white/60" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          Already an agent? <a href="/login" className="font-bold text-blue-400 hover:underline">Login here</a>.
        </p>
      </motion.div>
    </div>
  );
}