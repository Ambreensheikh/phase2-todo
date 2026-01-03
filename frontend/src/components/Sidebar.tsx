import React from 'react';
import { LayoutGrid, HelpCircle, Settings, UserCircle, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar: React.FC = () => {
    const icons = [
        { icon: LayoutGrid, key: 'dashboard' },
        { icon: HelpCircle, key: 'help' },
        { icon: Settings, key: 'settings' },
        { icon: UserCircle, key: 'profile' },
    ];
    return (
        <aside className="w-64 h-screen bg-white/5 backdrop-blur-md border border-white/10 p-4 flex flex-col items-center justify-between">
            <div className="flex flex-col items-center gap-6">
                {icons.map((item, index) => (
                    <motion.button
                        key={item.key}
                        className={`p-3 rounded-full transition-colors duration-300 ${index === 0 ? 'bg-[#6D28D9]/50 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <item.icon size={24} />
                    </motion.button>
                ))}
            </div>
            <motion.button
                 className="p-3 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors duration-300"
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.9 }}
            >
                <LogOut size={24} />
            </motion.button>
        </aside>
    );
};

export default Sidebar;