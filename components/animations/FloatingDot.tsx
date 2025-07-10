"use client";

import { motion } from "framer-motion";

interface FloatingDotProps {
  delay?: number;
  duration?: number;
  className?: string;
}

export default function FloatingDot({ 
  delay = 0, 
  duration = 3,
  className = ""
}: FloatingDotProps) {
  return (
    <motion.div
      className={`absolute w-2 h-2 rounded-full bg-gradient-to-r from-primary to-pink-500 ${className}`}
      initial={{ x: 0, opacity: 0 }}
      animate={{
        x: ["0%", "100%"],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        x: {
          duration,
          ease: "linear",
          repeat: Infinity,
          delay,
        },
        opacity: {
          duration,
          times: [0, 0.1, 0.9, 1],
          repeat: Infinity,
          delay,
        },
      }}
    />
  );
}
