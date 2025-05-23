import Image from "next/image";
import Link from "next/link";
import config from "@/config";

// Floating dialogue card component
const FloatingCard = ({ icon, text, className }: { icon: string; text: string; className: string }) => {
  return (
    <div className={`absolute bg-white p-3 md:p-4 rounded-lg shadow-lg ${className} max-w-[180px] md:max-w-none z-10`}>
      <div className="flex items-start gap-3">
        <div className="text-xl md:text-2xl">{icon}</div>
        <p className="text-xs md:text-sm text-gray-700">{text}</p>
      </div>
    </div>
  );
};

// Stat component for the hero section
const HeroStat = ({ value, label }: { value: string; label: string }) => {
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-2xl md:text-3xl font-bold text-primary">{value}</h3>
      <p className="text-sm md:text-base text-gray-600">{label}</p>
    </div>
  );
};

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto bg-base-100 px-8 py-12 lg:py-20">
      <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
        {/* Left column - Content */}
        <div className="flex flex-col gap-8">
          <h1 className="font-extrabold text-4xl lg:text-5xl xl:text-6xl tracking-tight">
            Never Miss Another Call. <span className="text-primary">Your AI Staff</span> Is Always Available.
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            Transform your practice with AI voice agents that handle calls 24/7, schedule appointments, 
            answer FAQs, and qualify leads—all while sounding remarkably human.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link href="#demo" className="btn btn-primary">
              Schedule Your Demo
            </Link>
            <Link href="#calculator" className="btn btn-outline">
              ROI Calculator
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 p-3 md:p-4 bg-base-200 rounded-lg mt-4">
            <HeroStat value="93%" label="Patient Satisfaction" />
            <HeroStat value="24/7" label="Availability" />
            <HeroStat value="30%" label="More Appointments" />
          </div>
        </div>
        
        {/* Right column - Image with floating dialogue cards */}
        <div className="relative">
          {/* Main image */}
          <div className="rounded-lg overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop"
              alt="AgenticVoice.net AI assistant for medical and legal practices"
              className="w-full"
              priority={true}
              width={600}
              height={400}
            />
          </div>
          
          {/* Floating dialogue cards */}
          <FloatingCard 
            icon="📞" 
            text="Hello, Dr. Brenner's office. How may I help you today?" 
            className="-top-6 -left-4 md:-left-10 lg:left-5 transform -rotate-3"
          />
          
          <FloatingCard 
            icon="📅" 
            text="I can schedule your appointment for Tuesday at 2:30 PM. Does that work for you?" 
            className="bottom-10 -right-4 md:-right-5 lg:right-10 transform rotate-2"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
