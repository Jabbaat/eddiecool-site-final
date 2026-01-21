import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Code, Rocket, Zap } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Brain className="w-10 h-10" />,
      title: "Flow State Eerst",
      desc: "Leer hoe je in de 'zone' komt en blijft. Laat de AI het zware denkwerk doen terwijl jij regisseert.",
      color: "bg-gred"
    },
    {
      icon: <Zap className="w-10 h-10" />,
      title: "Snelheid boven Syntax",
      desc: "Waarom code uit je hoofd leren? Wij leren je hoe je code *genereert* en valideert op lichtsnelheid.",
      color: "bg-gblue"
    },
    {
      icon: <Code className="w-10 h-10" />,
      title: "Cursor Mastery",
      desc: "Word een tovenaar met Cursor en Composer. Schrijf geen functies meer met de hand.",
      color: "bg-gyellow"
    },
    {
      icon: <Rocket className="w-10 h-10" />,
      title: "Direct Shippen",
      desc: "Van idee naar live URL in minuten, niet weken. Deployment is onderdeel van de vibe.",
      color: "bg-ggreen"
    }
  ];

  return (
    <section id="features" className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-6 uppercase">
          De <span className="inline-block bg-white dark:bg-black px-2 border-2 border-black dark:border-white transform rotate-2">EddieCool</span> Methode
        </h2>
        <p className="text-xl font-bold text-gray-800 dark:text-gray-300 max-w-2xl mx-auto">
          Traditioneel leren programmeren is traag. Vibe Coding is snel, creatief en krachtig.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`
              relative p-8 border-4 border-black dark:border-white 
              shadow-neo dark:shadow-neo-dark
              bg-white dark:bg-gray-900 
              group hover:-translate-y-2 transition-transform duration-300
            `}
          >
            <div className={`
              absolute -top-6 -right-6 w-16 h-16 ${feature.color} 
              border-4 border-black dark:border-white 
              flex items-center justify-center 
              shadow-neo-sm dark:shadow-neo-sm-dark
              group-hover:rotate-12 transition-transform
            `}>
              <div className="text-white dark:text-black">{feature.icon}</div>
            </div>
            
            <h3 className="text-2xl font-black mb-4 text-black dark:text-white uppercase">{feature.title}</h3>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;