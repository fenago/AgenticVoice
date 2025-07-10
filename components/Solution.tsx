"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { JSX } from "react";

// List of solution features to display
const features: {
  name: string;
  description: JSX.Element;
  svg: JSX.Element;
}[] = [
  {
    name: "24/7 Call Handling",
    description: (
      <>
        <p className="mb-3 text-base-content/90">
          Our AI voice agents never sleep, ensuring your practice is always available to patients.
        </p>
        <ul className="space-y-2">
          {[
            "Answers calls day or night, weekends and holidays",
            "Eliminates missed call opportunities",
            "Maintains consistent patient experience regardless of time",
            "Scales infinitely - handles multiple calls simultaneously"
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-[18px] h-[18px] inline shrink-0 text-primary"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    name: "Automated Appointment Scheduling",
    description: (
      <>
        <p className="mb-3 text-base-content/90">
          Book and manage appointments without human intervention, directly integrated with your calendar.
        </p>
        <ul className="space-y-2">
          {[
            "Checks availability in real-time across multiple providers",
            "Sends confirmation emails and text reminders",
            "Handles rescheduling and cancellations with ease",
            "Reduces no-shows by 30% with smart reminders"
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-[18px] h-[18px] inline shrink-0 text-primary"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
    ),
  },
  {
    name: "Personalized Patient Experience",
    description: (
      <>
        <p className="mb-3 text-base-content/90">
          Your AI voice agent learns your practice's terminology and protocols to deliver consistent, personalized service.
        </p>
        <ul className="space-y-2">
          {[
            "Remembers patient preferences and history",
            "Adapts tone and communication style to each caller",
            "Handles complex medical terminology accurately",
            "Builds patient rapport through conversational interactions"
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-[18px] h-[18px] inline shrink-0 text-primary"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
  },
  {
    name: "Smart Call Triage",
    description: (
      <>
        <p className="mb-3 text-base-content/90">
          Our AI prioritizes calls based on urgency, ensuring critical situations receive immediate attention.
        </p>
        <ul className="space-y-2">
          {[
            "Identifies emergency situations and escalates immediately",
            "Directs routine inquiries to self-service options",
            "Transfers complex cases to appropriate staff members",
            "Reduces staff interruptions for non-urgent matters"
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-[18px] h-[18px] inline shrink-0 text-primary"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-8 h-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
  },
];

// Solution component that displays AI voice agent features
const Solution = () => {
  const [featureSelected, setFeatureSelected] = useState(0);
  const [callTime, setCallTime] = useState('00');
  
  // Generate random call time on client side only to avoid hydration errors
  useEffect(() => {
    setCallTime(String(Math.floor(Math.random() * 60)).padStart(2, '0'));
  }, []);

  return (
    <section className="py-16 md:py-24 bg-base-100" id="solution">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col text-center w-full mb-12">
          <h2 className="font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
            How <span className="text-primary">AI Voice Agents</span> Transform Your Practice
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-base-content/70">
            Our intelligent voice assistants handle patient calls, schedule appointments, and answer questions so your staff can focus on what matters most: in-person patient care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Feature list */}
          <div className="order-2 md:order-1 overflow-x-hidden">
            <div className="space-y-2 md:space-y-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  onClick={() => setFeatureSelected(i)}
                  className={`p-3 md:p-4 lg:p-6 rounded-xl cursor-pointer transition-all duration-200 ${i === featureSelected ? "bg-base-200" : "hover:bg-base-200/50"}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${i === featureSelected ? "text-primary bg-primary/10" : "text-base-content bg-base-300"}`}>
                      {feature.svg}
                    </div>
                    <div>
                      <h3 className={`font-bold text-base md:text-lg lg:text-xl mb-1 ${i === featureSelected ? "text-primary" : ""}`}>
                        {feature.name}
                      </h3>
                      {i === featureSelected && (
                        <div className="mt-3 text-base-content/80">
                          {feature.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature visualization */}
          <div className="order-1 md:order-2 bg-base-200 rounded-xl p-4 md:p-6 h-[300px] sm:h-[350px] md:h-[500px] flex items-center justify-center">
            <div className="relative w-full h-full max-w-md mx-auto">
              {/* Phone call visualization */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 sm:w-64 md:w-80 bg-base-100 rounded-xl shadow-xl overflow-hidden">
                {/* Phone header */}
                <div className="bg-purple-700 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      <span className="font-medium">Incoming Call</span>
                    </div>
                    <span className="text-xs md:text-sm">00:{callTime}</span>
                  </div>
                </div>
                
                {/* Conversation */}
                <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="bg-neutral text-neutral-content p-2 rounded-lg rounded-tl-none text-sm max-w-[80%]">
                      <p>Hello, thank you for calling Dr. Brenner's office. This is Amy, your AI assistant. How may I help you today?</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 justify-end">
                    <div className="bg-purple-600 text-white p-2 rounded-lg rounded-tr-none text-sm max-w-[80%]">
                      <p>Hi, I need to reschedule my appointment for tomorrow.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-neutral text-neutral-content p-2 rounded-lg rounded-tl-none text-sm max-w-[80%]">
                      <p>I'd be happy to help you reschedule. May I have your name and date of birth, please?</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full"></div>
              <div className="absolute bottom-10 left-10 w-16 h-16 bg-secondary/10 rounded-full"></div>
              <div className="absolute top-1/4 left-1/3 w-12 h-12 bg-accent/10 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
