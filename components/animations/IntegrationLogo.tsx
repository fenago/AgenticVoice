"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface IntegrationLogoProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function IntegrationLogo({ 
  children, 
  delay = 0,
  className = "" 
}: IntegrationLogoProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      whileHover={{
        scale: 1.1,
        transition: { duration: 0.2 }
      }}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-lg opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Subtle continuous rotation */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 rounded-lg"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 70%)"
        }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
