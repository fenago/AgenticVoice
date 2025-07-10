"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PulseGlowProps {
  children: ReactNode;
  className?: string;
  pulseColor?: string;
  pulseSize?: string;
}

export default function PulseGlow({ 
  children, 
  className = "",
  pulseColor = "from-pink-500/20 to-red-500/20",
  pulseSize = "shadow-lg"
}: PulseGlowProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Pulsing shadow effect */}
      <motion.div
        className={`absolute inset-0 rounded-lg bg-gradient-to-r ${pulseColor} blur-xl`}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
