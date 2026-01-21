import React from 'react';
import { Github, Twitter, Linkedin, Zap } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white pt-20 pb-10 px-4 border-t-4 border-black dark:border-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <div className="bg-gblue p-1 border-2 border-white transform -rotate-3">
                <Zap className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-black uppercase tracking-tighter">EddieCool.nl</span>
          </div>
          <p className="text-xl font-medium max-w-md text-gray-400">
            De chillste plek op het internet om Vibe Coding te leren. 
            Geen saaie colleges. Alleen bouwen en vibes.
          </p>
          <div className="flex gap-4">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="p-3 bg-white text-black border-2 border-white hover:bg-gblue hover:text-white hover:border-gblue transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                <Icon size={24} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-6 text-gyellow uppercase">Leren</h4>
          <ul className="space-y-4 text-lg font-medium text-gray-300">
            <li><a href="#" className="hover:text-gblue hover:underline decoration-white">Alle Tracks</a></li>
            <li><a href="#" className="hover:text-gblue hover:underline decoration-white">Voor Beginners</a></li>
            <li><a href="#" className="hover:text-gblue hover:underline decoration-white">Geavanceerde AI</a></li>
            <li><a href="#" className="hover:text-gblue hover:underline decoration-white">Showcase</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xl font-bold mb-6 text-ggreen uppercase">Eddie's Wereld</h4>
          <ul className="space-y-4 text-lg font-medium text-gray-300">
            <li><a href="#" className="hover:text-gblue hover:underline decoration-white">Over Eddie</a></li>
            <li><a href="#" className="hover:text-gblue hover:underline decoration-white">Nieuwsbrief</a></li>
            <li><a href="#" className="hover:text-gblue hover:underline decoration-white">Merch</a></li>
            <li><a href="#" className="hover:text-gblue hover:underline decoration-white">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t-2 border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-mono text-gray-500">
          © {new Date().getFullYear()} EddieCool.nl. Alle rechten voorbehouden.
        </p>
        <div className="flex gap-6 font-mono text-sm text-gray-500">
           <a href="#" className="hover:text-white">Privacybeleid</a>
           <a href="#" className="hover:text-white">Algemene Voorwaarden</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;