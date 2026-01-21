import React, { useState } from 'react';
import { Menu, X, Sun, Moon, Layers } from 'lucide-react';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  darkMode: boolean;
  toggleTheme: () => void;
  onOpenAssistant: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleTheme, onOpenAssistant }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Courses', href: '#courses' },
    { name: 'Manifesto', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Community', href: '#community' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-black border-b-4 border-black dark:border-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
            <div className="bg-gblue p-2 border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-dark transition-transform group-hover:rotate-12">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl md:text-2xl tracking-tighter uppercase text-black dark:text-white">
              The Hidden<span className="text-gblue">_Layer</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-bold text-lg hover:underline decoration-4 decoration-gyellow underline-offset-4 text-black dark:text-white"
              >
                {link.name}
              </a>
            ))}
            
            <button
              onClick={toggleTheme}
              className="p-2 border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-dark bg-white dark:bg-black text-black dark:text-white hover:translate-y-1 hover:shadow-none transition-all"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <Button size="sm" color="gblue" onClick={onOpenAssistant}>Join Beta</Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <button
              onClick={toggleTheme}
              className="p-2 border-2 border-black dark:border-white shadow-neo-sm dark:shadow-neo-sm-dark bg-white dark:bg-black text-black dark:text-white"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none"
            >
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-gyellow border-b-4 border-black dark:border-white overflow-hidden"
          >
            <div className="px-2 pt-2 pb-8 space-y-1 sm:px-3 flex flex-col items-center">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-4 rounded-md text-2xl font-bold text-black hover:bg-black hover:text-white w-full text-center border-b-2 border-black last:border-0"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4">
                <Button onClick={() => { setIsOpen(false); onOpenAssistant(); }} color="gblue" size="lg" className="w-full">
                  Access Neural Net
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;