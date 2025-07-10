"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PulseButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function PulseButton({ children, className = "", onClick }: PulseButtonProps) {
  return (
    <motion.button
      className={`relative ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-25" />
      
      {/* Glow effect */}
      <span className="absolute inset-0 rounded-full bg-primary blur-md opacity-25" />
      
      {/* Button content */}
      <span className="relative">{children}</span>
    </motion.button>
  );
}
