import Image from "next/image";

// Stat card component for problem statistics
const StatCard = ({ value, description }: { value: string; description: string }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <h3 className="text-3xl md:text-4xl font-bold text-primary mb-2">{value}</h3>
      <p className="text-sm md:text-base text-gray-700">{description}</p>
    </div>
  );
};

// Problem section component focused on the hidden cost of missed calls
const Problem = () => {
  return (
    <section className="bg-neutral text-neutral-content py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4 text-white">
            The Hidden Cost of Missed Calls
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-white opacity-90 leading-relaxed">
            Every unanswered call is a missed opportunity—and they add up faster than you think.
          </p>
        </div>
        
        {/* Problem statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <StatCard 
            value="37%" 
            description="of callers never call back if they reach voicemail" 
          />
          <StatCard 
            value="$50,000+" 
            description="in potential annual revenue lost from missed new patient calls" 
          />
          <StatCard 
            value="67%" 
            description="of patients report frustration with practice phone accessibility" 
          />
        </div>
        
        {/* Problem scenario */}
        <div className="bg-neutral-focus rounded-xl overflow-hidden shadow-xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Local image file that was already downloaded */}
            <div className="h-64 md:h-auto overflow-hidden rounded-lg">
              <div className="relative w-full h-full">
                <Image
                  src="/images/overwhelmed-staff.jpg"
                  alt="Overwhelmed medical office staff"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                  priority={true}
                />
                
                {/* Overlay to ensure image works with dark theme */}
                <div className="absolute inset-0 bg-gradient-to-tr from-neutral-focus/50 to-transparent"></div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">
                Your staff is drowning in calls while trying to help patients in the office
              </h3>
              
              <ul className="list-disc pl-5 mb-6 space-y-2 text-white">
                <li>Constant phone interruptions prevent focus on in-person patients</li>
                <li>Repetitive questions consume valuable staff time</li>
                <li>Lunch breaks and after-hours mean missed opportunities</li>
                <li>Staff burnout leads to higher turnover and training costs</li>
              </ul>
              
              <div className="relative bg-neutral p-6 rounded-lg italic text-sm md:text-base border-l-4 border-primary text-white">
                <p>"I built this practice from nothing—sleepless nights, missed family dinners, sacrifices that my family never signed up for but endured anyway. Now it's thriving by every medical metric, yet drowning in operational chaos."</p>
                <p className="text-right mt-2 font-semibold not-italic">— Dr. Michael Brenner, Orthopedic Surgeon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
