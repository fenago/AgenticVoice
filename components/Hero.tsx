"use client";

import Image from "next/image";
import Link from "next/link";
import config from "@/config";
import FadeIn from "@/components/animations/FadeIn";
import FloatingAnimation from "@/components/animations/FloatingAnimation";
import GradientText from "@/components/animations/GradientText";
import { motion } from "framer-motion";
import { smoothScrollTo } from "@/utils/smoothScroll";

// Floating dialogue card component with hover effects
const FloatingCard = ({ icon, text, className, delay = 0 }: { icon: string; text: string; className: string; delay?: number }) => {
  return (
    <motion.div 
      className={`absolute bg-white p-3 md:p-4 rounded-lg shadow-lg ${className} max-w-[180px] md:max-w-none z-10`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="flex items-start gap-3">
        <motion.div 
          className="text-xl md:text-2xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: delay + 1 }}
        >
          {icon}
        </motion.div>
        <p className="text-xs md:text-sm text-gray-700">{text}</p>
      </div>
    </motion.div>
  );
};

// Stat component for the hero section with count-up animation
const HeroStat = ({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) => {
  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <h3 className="text-2xl md:text-3xl font-bold text-primary">{value}</h3>
      <p className="text-sm md:text-base text-gray-600">{label}</p>
    </motion.div>
  );
};

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto bg-base-100 px-8 py-12 lg:py-20">
      <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
        {/* Left column - Content */}
        <div className="flex flex-col gap-8">
          <FadeIn>
            <h1 className="font-extrabold text-4xl lg:text-5xl xl:text-6xl tracking-tight">
              Never Miss Another Call.{" "}
              <GradientText>Your AI Staff</GradientText>{" "}
              Is Always Available.
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <p className="text-lg text-gray-600 leading-relaxed">
              Transform your practice with AI voice agents that handle calls 24/7, schedule appointments, 
              answer FAQs, and qualify leads—all while sounding remarkably human.
            </p>
          </FadeIn>
          
          {/* CTA Buttons */}
          <FadeIn delay={0.4}>
            <div className="flex flex-wrap gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="#demo" className="btn btn-primary relative overflow-hidden group">
                  <span className="absolute inset-0 bg-gradient-to-r from-primary-pink to-primary-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative">Schedule Your Demo</span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button 
                  onClick={() => smoothScrollTo('roi-calculator')} 
                  className="btn btn-outline"
                >
                  ROI Calculator
                </button>
              </motion.div>
            </div>
          </FadeIn>
          
          {/* Stats */}
          <FadeIn delay={0.6}>
            <motion.div 
              className="grid grid-cols-3 gap-2 md:gap-4 p-3 md:p-4 bg-base-200 rounded-lg mt-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <HeroStat value="93%" label="Patient Satisfaction" delay={0.8} />
              <HeroStat value="24/7" label="Availability" delay={0.9} />
              <HeroStat value="30%" label="More Appointments" delay={1} />
            </motion.div>
          </FadeIn>
        </div>
        
        {/* Right column - Image with floating dialogue cards */}
        <FadeIn direction="left" delay={0.3}>
          <div className="relative">
            {/* Main image with floating effect */}
            <FloatingAnimation duration={4} distance={15}>
              <motion.div 
                className="rounded-lg overflow-hidden shadow-xl"
                whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop"
                  alt="AgenticVoice.net AI assistant for medical and legal practices"
                  className="w-full"
                  priority={true}
                  width={600}
                  height={400}
                />
              </motion.div>
            </FloatingAnimation>
          
            {/* Floating dialogue cards */}
            <FloatingCard 
              icon="📞" 
              text="Hello, Dr. Brenner's office. How may I help you today?" 
              className="-top-6 -left-4 md:-left-10 lg:left-5 transform -rotate-3"
              delay={1.2}
            />
            
            <FloatingCard 
              icon="📅" 
              text="I can schedule your appointment for Tuesday at 2:30 PM. Does that work for you?" 
              className="bottom-10 -right-4 md:-right-5 lg:right-10 transform rotate-2"
              delay={1.5}
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Hero;
