import React from 'react';
import Button from './Button';
import { motion } from 'framer-motion';
import { Terminal, Zap, Star } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative w-full py-20 md:py-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
      {/* Decorative Background Shapes */}
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-10 left-[-50px] w-32 h-32 md:w-56 md:h-56 bg-white border-4 border-black dark:border-white rounded-full z-0 opacity-40"
      />
      <motion.div 
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-[-20px] w-32 h-32 md:w-48 md:h-48 bg-gyellow border-4 border-black dark:border-white transform -rotate-12 z-0 opacity-60"
      />
       <motion.div 
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 right-[15%] w-20 h-20 bg-gred border-4 border-black dark:border-white rounded-none z-0 opacity-50 rotate-45"
      />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block"
        >
          <span className="bg-white text-black px-4 py-2 border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-dark font-bold uppercase tracking-widest text-sm md:text-base transform -rotate-2 inline-block mb-4">
            <Star className="inline w-4 h-4 mr-2 mb-1 fill-black" />
            Officieel EddieCool.nl Programma
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-8xl font-black text-black dark:text-white leading-none tracking-tighter"
        >
          STOP MET TYPEN <br/>
          <span className="text-white bg-black dark:bg-gblue px-4 inline-block transform -skew-x-12 border-4 border-transparent dark:border-white">
            START MET VIBEN
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-200 max-w-2xl mx-auto mt-4"
        >
          Vergeet syntax. Negeer stack overflow. Gebruik AI om te bouwen wat je wilt, wanneer je wilt.
          Vibe Coding is de toekomst.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col md:flex-row gap-6 justify-center items-center pt-8"
        >
          <Button size="lg" color="gyellow" className="w-full md:w-auto text-black">
            <Zap className="w-6 h-6" /> Start de Vibe
          </Button>
          <Button size="lg" variant="outline" className="w-full md:w-auto bg-white text-black border-white dark:bg-black dark:text-white hover:bg-black hover:text-white">
            <Terminal className="w-6 h-6" /> Bekijk Curriculum
          </Button>
        </motion.div>
      </div>
      
      {/* Code Snippet Decoration */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-16 w-full max-w-3xl bg-black border-4 border-black dark:border-white shadow-neo-lg dark:shadow-neo-lg-dark p-6 rounded-none hidden md:block"
      >
        <div className="flex gap-2 mb-4 border-b-2 border-gray-800 pb-2 justify-between items-center">
            <div className="flex gap-2">
                <div className="w-4 h-4 rounded-full bg-gred border border-white"></div>
                <div className="w-4 h-4 rounded-full bg-gyellow border border-white"></div>
                <div className="w-4 h-4 rounded-full bg-ggreen border border-white"></div>
            </div>
            <div className="text-gray-500 font-mono text-xs">vibe_session.prompt</div>
        </div>
        <code className="font-mono text-gblue text-left block text-sm md:text-base">
          <span className="text-gray-400">// Jij bent een senior developer, maar sneller.</span><br/>
          <span className="text-gray-400">// Bouw een volledige app in 5 minuten.</span><br/><br/>
          <span className="text-gred">></span> <span className="text-white">Maak een landing page die aanvoelt als magie.</span><br/>
          <span className="text-gred">></span> <span className="text-white">Gebruik neobrutalisme en felle kleuren.</span><br/>
          <span className="text-gred">></span> <span className="text-white">Voeg animaties toe met framer-motion.</span><br/><br/>
          <span className="text-ggreen">AI:</span> <span className="text-gyellow">Bezig met genereren... </span><span className="animate-pulse">Done.</span>
        </code>
      </motion.div>

    </section>
  );
};

export default Hero;