"use client";

import Image from "next/image";
import { FadeIn, GradientReveal, PulseGlow, ColorTemperature } from "@/components/animations";
import { motion } from "framer-motion";

// Stat card component with gradient reveal and pulse glow
const StatCard = ({ value, description, delay = 0 }: { value: string; description: string; delay?: number }) => {
  return (
    <FadeIn delay={delay} direction="up">
      <PulseGlow pulseColor="from-red-400/10 to-pink-400/10" className="h-full">
        <motion.div 
          className="bg-white rounded-lg shadow-md p-6 text-center h-full"
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-2">
            <GradientReveal gradientColors="from-red-500 via-pink-500 to-primary-purple">
              {value}
            </GradientReveal>
          </h3>
          <p className="text-sm md:text-base text-gray-800">{description}</p>
        </motion.div>
      </PulseGlow>
    </FadeIn>
  );
};

// Problem section component focused on the hidden cost of missed calls
const Problem = () => {
  return (
    <ColorTemperature 
      className="bg-neutral text-neutral-content py-16 md:py-24"
      coolColor="rgba(59, 130, 246, 0.05)"
      warmColor="rgba(239, 68, 68, 0.08)"
    >
      <section className="w-full">
        <div className="max-w-7xl mx-auto px-8">
        {/* Section header */}
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4 text-white">
              The Hidden Cost of Missed Calls
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-white opacity-90 leading-relaxed">
              Every unanswered call is a missed opportunity—whether it’s a new patient or a potential client.
            </p>
          </div>
        </FadeIn>
        
        {/* Problem statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <StatCard 
            value="37%" 
            description="of callers never call back if they reach voicemail"
            delay={0.2} 
          />
          <StatCard 
            value="$50,000+" 
            description="in potential annual revenue lost from missed calls"
            delay={0.4} 
          />
          <StatCard 
            value="67%" 
            description="of clients report frustration with office phone accessibility"
            delay={0.6} 
          />
        </div>
        
        {/* Problem scenario */}
        <FadeIn delay={0.8} direction="up">
          <motion.div 
            className="bg-neutral-focus rounded-xl overflow-hidden shadow-xl"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
          <div className="space-y-8">
            {/* Images Section - Two side by side */}
            <div className="grid md:grid-cols-2 gap-4 p-8 pb-0">
              {/* Medical Office Image */}
              <div className="relative h-64 overflow-hidden rounded-lg">
                <div className="relative w-full h-full">
                  <Image
                    src="/images/overwhelmed-staff.jpg"
                    alt="Overwhelmed medical office staff"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                    priority={true}
                  />
                  {/* Medical Label */}
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Medical Practice
                  </div>
                  {/* Overlay to ensure image works with dark theme */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-neutral-focus/50 to-transparent"></div>
                </div>
              </div>
              
              {/* Legal Office Image */}
              <div className="relative h-64 overflow-hidden rounded-lg">
                <div className="relative w-full h-full">
                  <Image
                    src="/images/legal-office-stressed.jpg"
                    alt="Overwhelmed legal office staff"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                    priority={true}
                  />
                  {/* Legal Label */}
                  <div className="absolute top-4 left-4 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Law Office
                  </div>
                  {/* Overlay to ensure image works with dark theme */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-neutral-focus/50 to-transparent"></div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8 pt-0">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-white text-center">
                Your staff is drowning in calls while trying to serve clients in the office
              </h3>
              
              <ul className="list-disc pl-5 mb-6 space-y-2 text-white max-w-3xl mx-auto">
                <li>Constant phone interruptions prevent focus on in-person clients</li>
                <li>Repetitive questions consume valuable staff time</li>
                <li>Lunch breaks and after-hours mean missed opportunities</li>
                <li>Staff burnout leads to higher turnover and training costs</li>
              </ul>
              
              {/* Quotes Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Doctor Quote */}
                <div className="relative bg-neutral p-6 rounded-lg italic text-sm md:text-base border-l-4 border-blue-500 text-white">
                  <p>"I built this practice from nothing—sleepless nights, missed family dinners, sacrifices that my family never signed up for but endured anyway. Now it's thriving by every medical metric, yet drowning in operational chaos."</p>
                  <p className="text-right mt-2 font-semibold not-italic">— Dr. Michael Brenner, Orthopedic Surgeon</p>
                </div>
                
                {/* Lawyer Quote */}
                <div className="relative bg-neutral p-6 rounded-lg italic text-sm md:text-base border-l-4 border-amber-500 text-white">
                  <p>"Every missed call could be a client in crisis, a time-sensitive case, or a referral worth tens of thousands. We can't afford to let potential clients go to our competitors because we couldn't answer the phone."</p>
                  <p className="text-right mt-2 font-semibold not-italic">— Sarah Chen, Partner at Chen & Associates Law</p>
                </div>
              </div>
            </div>
          </div>
          </motion.div>
        </FadeIn>
      </div>
      </section>
    </ColorTemperature>
  );
};

export default Problem;
