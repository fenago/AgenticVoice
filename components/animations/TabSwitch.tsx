"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TabSwitchProps {
  tabs: {
    id: string;
    label: string;
    content: ReactNode;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function TabSwitch({ 
  tabs, 
  activeTab, 
  onTabChange,
  className = "" 
}: TabSwitchProps) {
  return (
    <div className={className}>
      {/* Tab buttons */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg bg-base-300 p-1 shadow-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-6 py-2 rounded-md text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-black hover:text-gray-900"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-purple-800 rounded-md"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35
                  }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab content */}
      <div className="relative overflow-hidden">
        {tabs.map((tab) => (
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: activeTab === tab.id ? 1 : 0,
              x: activeTab === tab.id ? 0 : 20,
              display: activeTab === tab.id ? "block" : "none"
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {tab.content}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
