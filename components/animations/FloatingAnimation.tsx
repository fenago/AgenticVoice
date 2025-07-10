"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FloatingAnimationProps {
  children: ReactNode;
  duration?: number;
  distance?: number;
  className?: string;
}

export default function FloatingAnimation({
  children,
  duration = 3,
  distance = 10,
  className = "",
}: FloatingAnimationProps) {
  return (
    <motion.div
      animate={{
        y: [0, -distance, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
