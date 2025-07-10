import { Suspense, ReactNode } from 'react';
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import HowItWorks from "@/components/HowItWorks";
import ROICalculator from "@/components/ROICalculator";
import Pricing from "@/components/Pricing";
import Testimonials3 from "@/components/Testimonials3";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { Metadata } from 'next';

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'AgenticVoice.net - AI Voice Agents for Medical and Legal Professionals',
  description: 'Transform your practice with AI voice agents that handle calls 24/7, schedule appointments, answer FAQs, and qualify leads—all while sounding remarkably human.',
  keywords: 'AI voice agents, medical practice, legal practice, virtual receptionist, appointment scheduling, practice automation, voice AI, healthcare communication, legal office technology',
};

export default function Home(): JSX.Element {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
      </Suspense>
      <main>
        {/* AgenticVoice.net - AI voice agents for medical and legal professionals */}
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <ROICalculator />
        <Pricing />
        <Testimonials3 />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
