"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ReactNode } from "react";

interface GradientRevealProps {
  children: ReactNode;
  className?: string;
  gradientColors?: string;
}

export default function GradientReveal({ 
  children, 
  className = "", 
  gradientColors = "from-primary-pink via-primary-purple to-primary-blue" 
}: GradientRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlay */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${gradientColors} opacity-0 bg-clip-text`}
        initial={{ opacity: 0, x: "-100%" }}
        animate={{ 
          opacity: isInView || isHovered ? 1 : 0,
          x: isInView || isHovered ? 0 : "-100%"
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      
      {/* Content with gradient text when active */}
      <span 
        className={`relative transition-all duration-800 ${
          isInView || isHovered 
            ? `bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent` 
            : "text-gray-900"
        }`}
      >
        {children}
      </span>
    </motion.div>
  );
}
