"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface ColorTemperatureProps {
  children: ReactNode;
  className?: string;
  coolColor?: string;
  warmColor?: string;
}

export default function ColorTemperature({ 
  children, 
  className = "",
  coolColor = "rgba(59, 130, 246, 0.1)", // blue
  warmColor = "rgba(239, 68, 68, 0.1)"   // red
}: ColorTemperatureProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    mouseX.set(x);
    mouseY.set(y);
  };
  
  // Transform mouse position to color intensity
  const intensity = useTransform([mouseX, mouseY], ([x, y]) => {
    // Calculate distance from center
    const centerX = 0.5;
    const centerY = 0.5;
    const distance = Math.sqrt(
      Math.pow((x as number) - centerX, 2) + 
      Math.pow((y as number) - centerY, 2)
    );
    return Math.min(distance * 2, 1);
  });
  
  const backgroundColor = useTransform(
    intensity,
    [0, 1],
    [coolColor, warmColor]
  );

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0.5);
        mouseY.set(0.5);
      }}
    >
      {/* Temperature overlay */}
      <motion.div
        className="absolute inset-0 rounded-lg transition-colors duration-300"
        style={{ backgroundColor }}
      />
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
}
