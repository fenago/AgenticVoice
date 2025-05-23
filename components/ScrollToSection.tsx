"use client";

import { useRef, useEffect } from 'react';

// This component handles section scrolling without using hash links to avoid RSC payload errors
export default function ScrollToSection({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id: string;
  className?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register this section with a global registry to allow programmatic scrolling
    const scrollToSection = (targetId: string) => {
      if (targetId === id && sectionRef.current) {
        sectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    };

    // Add this section to the global window object for easy access
    if (typeof window !== 'undefined') {
      window.scrollSections = window.scrollSections || {};
      window.scrollSections[id] = scrollToSection;
    }

    // Check if URL has a hash that matches this section's ID and scroll if it does
    if (typeof window !== 'undefined' && window.location.hash === `#${id}`) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }

    return () => {
      // Clean up when component unmounts
      if (typeof window !== 'undefined' && window.scrollSections) {
        delete window.scrollSections[id];
      }
    };
  }, [id]);

  return (
    <div 
      ref={sectionRef} 
      id={id} 
      className={className}
      data-section-id={id}
    >
      {children}
    </div>
  );
}

// Add this type definition to avoid TypeScript errors
declare global {
  interface Window {
    scrollSections?: Record<string, (id: string) => void>;
  }
}
