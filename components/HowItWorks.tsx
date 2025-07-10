"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { FadeIn, GradientText, FloatingDot, StepCard, IntegrationLogo, TabSwitch } from "@/components/animations";

// Define the steps for how AgenticVoice.net works
const steps = [
  {
    number: "01",
    title: "Initial Consultation",
    description:
      "We start by understanding your practice's unique needs, call volume, and specific challenges. Our experts analyze your current workflows to identify opportunities for AI voice agent integration.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-10 h-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Custom Configuration",
    description:
      "We customize your AI Employee with your practice's terminology, protocols, and scheduling preferences. Your digital staff member learns your unique practice style to deliver consistent service to your patients.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-10 h-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Seamless Integration",
    description:
      "Our team connects your AI voice agent with your existing phone system, EHR/practice management software, and scheduling tools. The integration is quick and requires no downtime for your practice.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-10 h-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
        />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Ongoing Optimization",
    description:
      "Your AI voice agent continuously learns and improves from every interaction. Our team provides regular performance reviews and updates to ensure optimal results and ROI for your practice.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-10 h-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
  },
];

// Healthcare integration partners
const healthcareIntegrations = [
  { name: "Epic", logo: "/images/integrations/epic.svg" },
  { name: "Cerner", logo: "/images/integrations/cerner.svg" },
  { name: "Allscripts", logo: "/images/integrations/allscripts.svg" },
  { name: "athenahealth", logo: "/images/integrations/athenahealth.svg" },
  { name: "NextGen", logo: "/images/integrations/nextgen.svg" },
  { name: "eClinicalWorks", logo: "/images/integrations/eclinicalworks.svg" },
];

// Legal integration partners
const legalIntegrations = [
  { name: "Clio", logo: "/images/integrations/clio.svg" },
  { name: "MyCase", logo: "/images/integrations/mycase.svg" },
  { name: "PracticePanther", logo: "/images/integrations/practicepanther.svg" },
  { name: "LawPay", logo: "/images/integrations/lawpay.svg" },
  { name: "Rocket Matter", logo: "/images/integrations/rocketmatter.svg" },
  { name: "Smokeball", logo: "/images/integrations/smokeball.svg" },
];

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState("healthcare");
  
  return (
    <section className="py-16 md:py-24 bg-base-200 relative overflow-hidden" id="how-it-works">
      {/* Background gradient mesh */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="container px-4 md:px-6 relative">
        <FadeIn>
          <div className="flex flex-col text-center w-full mb-16">
            <h2 className="font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
              How <GradientText>AgenticVoice</GradientText> Works
            </h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-base-content/70">
              Our implementation process is designed to be seamless, with minimal disruption to your practice. From consultation to optimization, we handle everything so your new <span className="text-primary font-medium">AI Employee</span> can start working for you right away.
            </p>
          </div>
        </FadeIn>

        {/* Steps section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <StepCard key={index} index={index} className="flex flex-col items-start">
              {/* Step icon with hover animation */}
              <motion.div 
                className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10 text-primary"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                {step.icon}
              </motion.div>
              
              {/* Step number badge with glow */}
              <motion.div 
                className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center text-gray-900 font-extrabold shadow-xl text-lg border-2 border-purple-300"
                animate={{
                  boxShadow: [
                    "0 10px 20px -3px rgba(139, 92, 246, 0.4)",
                    "0 10px 30px -3px rgba(139, 92, 246, 0.6)",
                    "0 10px 20px -3px rgba(139, 92, 246, 0.4)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {step.number}
              </motion.div>

              {/* Line connector with floating dots */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-16 w-[calc(100%+2rem)] h-0.5 bg-base-300">
                  <FloatingDot delay={index * 0.5} />
                  <FloatingDot delay={index * 0.5 + 1.5} />
                  <div className="absolute right-0 -top-1.5 w-4 h-4 rotate-45 border-t-2 border-r-2 border-base-300"></div>
                </div>
              )}

              {/* Step content */}
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-base-content/70">{step.description}</p>
            </StepCard>
          ))}
        </div>

        {/* Integration partners section */}
        <FadeIn delay={0.8}>
          <div className="mt-16">
            <h3 className="text-xl md:text-2xl font-bold text-center mb-8">
              Seamlessly Integrates With Your Existing Systems
            </h3>
            
            <TabSwitch
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={[
                {
                  id: "healthcare",
                  label: "Healthcare",
                  content: (
                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 py-6 px-4 bg-base-300 rounded-xl shadow-lg">
                      {healthcareIntegrations.map((partner, index) => (
                        <IntegrationLogo key={index} delay={index * 0.1} className="w-24 h-16 md:w-32 md:h-20">
                          <div className="flex items-center justify-center w-full h-full opacity-80 hover:opacity-100 transition-opacity">
                            <div className="text-lg font-bold text-base-content">{partner.name}</div>
                            {/* If you have actual logo files, use this instead:
                            <Image
                              src={partner.logo}
                              alt={`${partner.name} logo`}
                              width={100}
                              height={40}
                              className="object-contain w-full h-full"
                            /> */}
                          </div>
                        </IntegrationLogo>
                      ))}
                    </div>
                  ),
                },
                {
                  id: "legal",
                  label: "Legal",
                  content: (
                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 py-6 px-4 bg-base-300 rounded-xl shadow-lg">
                      {legalIntegrations.map((partner, index) => (
                        <IntegrationLogo key={index} delay={index * 0.1} className="w-24 h-16 md:w-32 md:h-20">
                          <div className="flex items-center justify-center w-full h-full opacity-80 hover:opacity-100 transition-opacity">
                            <div className="text-lg font-bold text-base-content">{partner.name}</div>
                            {/* If you have actual logo files, use this instead:
                            <Image
                              src={partner.logo}
                              alt={`${partner.name} logo`}
                              width={100}
                              height={40}
                              className="object-contain w-full h-full"
                            /> */}
                          </div>
                        </IntegrationLogo>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default HowItWorks;
