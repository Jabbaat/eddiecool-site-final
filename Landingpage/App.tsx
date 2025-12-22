import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Courses from './components/Courses';
import Marquee from './components/Marquee';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${darkMode ? 'dark bg-cool-dark' : 'bg-cool-bg'}`}>
      <div className="relative overflow-hidden">
        {/* Decorative background elements can go here */}
        <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />
        
        <main className="flex flex-col gap-0">
          <Hero />
          <Marquee darkMode={darkMode} />
          <Features />
          <Courses />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default App;