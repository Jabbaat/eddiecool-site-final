import React from 'react';
import { motion } from 'framer-motion';

interface MarqueeProps {
  darkMode: boolean;
}

const Marquee: React.FC<MarqueeProps> = ({ darkMode }) => {
  const text = "CURSOR • CLAUDE 3.5 • CHATGPT • V0.DEV • REPLIT • FLOW STATE • ";
  
  return (
    <div className="w-full overflow-hidden bg-gyellow border-y-4 border-black dark:border-white py-4 transform -rotate-1 origin-left scale-105 z-20">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(6)].map((_, i) => (
          <span key={i} className="text-4xl md:text-6xl font-black text-black px-4 uppercase">
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee;