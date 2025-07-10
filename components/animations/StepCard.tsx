"use client";

import { motion, useInView } from "framer-motion";
import { ReactNode, useRef } from "react";

interface StepCardProps {
  children: ReactNode;
  index: number;
  className?: string;
}

export default function StepCard({ children, index, className = "" }: StepCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.6,
        delay: index * 0.2,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover={{
        y: -5,
        transition: { duration: 0.3 }
      }}
    >
      {children}
    </motion.div>
  );
}
