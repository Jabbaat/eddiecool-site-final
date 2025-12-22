import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  color?: 'gblue' | 'gred' | 'gyellow' | 'ggreen';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  color = 'gblue', 
  className = '',
  size = 'md'
}) => {
  
  const baseStyles = "font-bold border-2 md:border-4 border-black dark:border-white transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2";
  
  const sizeStyles = {
    sm: "px-4 py-2 text-sm shadow-neo-sm dark:shadow-neo-sm-dark",
    md: "px-6 py-3 text-base shadow-neo dark:shadow-neo-dark",
    lg: "px-8 py-4 text-xl shadow-neo-lg dark:shadow-neo-lg-dark"
  };

  let colorClasses = "";

  if (variant === 'primary') {
    switch (color) {
      case 'gblue': colorClasses = "bg-gblue text-white"; break;
      case 'gred': colorClasses = "bg-gred text-white"; break;
      case 'gyellow': colorClasses = "bg-gyellow text-black"; break;
      case 'ggreen': colorClasses = "bg-ggreen text-white"; break;
    }
  } else if (variant === 'outline') {
    colorClasses = "bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black";
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${colorClasses} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default Button;