import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string;
  glowColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, glowColor }) => {
  return (
    <div
      className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center flex flex-col justify-center items-center overflow-hidden"
      style={{ boxShadow: `0 4px 30px rgba(0, 0, 0, 0.1)` }}
    >
      <motion.div
        className="absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      />
      <p className="text-6xl font-bold z-10">{value}</p>
      <p className="text-sm text-white/60 mt-2 z-10">{title}</p>
    </div>
  );
};

export default StatsCard;