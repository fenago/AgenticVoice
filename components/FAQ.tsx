"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";

// <FAQ> component is a lsit of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList arrayy below.

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

// Group FAQs by category
interface FAQCategory {
  name: string;
  items: FAQItemProps[];
}

const faqCategories: FAQCategory[] = [
  {
    name: "Implementation",
    items: [
      {
        question: "How long does it take to implement an AI Employee?",
        answer: (
          <div className="space-y-2 leading-relaxed">
            <p>
              Most practices are up and running with their AI Employee within 3-5 business days. The process includes:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Initial consultation and needs assessment (1 day)</li>
              <li>Custom configuration and voice/personality setup (1-2 days)</li>
              <li>Integration with your existing systems (1-2 days)</li>
              <li>Testing and quality assurance (1 day)</li>
            </ul>
            <p>
              Our team handles all the technical aspects, requiring minimal time commitment from your staff.
            </p>
          </div>
        ),
      },
      {
        question: "Will my AI Employee integrate with my existing practice management software?",
        answer: (
          <div className="space-y-2 leading-relaxed">
            <p>
              Yes, AgenticVoice.net integrates with most popular EHR, EMR, and practice management systems, including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Epic, Cerner, Allscripts, and athenahealth for medical practices</li>
              <li>Clio, MyCase, and PracticePanther for legal practices</li>
              <li>General scheduling systems like Calendly, Acuity, and Microsoft Booking</li>
            </ul>
            <p>
              If you use a different system, our team will work with you to establish the necessary integrations.
            </p>
          </div>
        ),
      },
      {
        question: "What happens to my existing phone system?",
        answer: (
          <div className="space-y-2 leading-relaxed">
            <p>
              Your AI Employee works with your existing phone system, no replacement required. We offer two implementation options:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Call forwarding:</strong> Your current phone system forwards calls to your AI Employee when appropriate (after hours, when lines are busy, etc.)</li>
              <li><strong>Direct integration:</strong> Your AI Employee is integrated directly into your phone system as an extension or virtual receptionist</li>
            </ul>
            <p>
              We'll help you determine the best setup based on your existing infrastructure and preferences.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    name: "Technology",
    items: [
      {
        question: "How realistic does the AI Employee sound?",
        answer: (
          <div className="space-y-2 leading-relaxed">
            <p>
              Our AI Employees use the latest in neural voice technology to sound remarkably human. Most callers can't tell they're speaking with an AI.
            </p>
            <p>
              Each AI Employee features:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Natural speech patterns with appropriate pauses and intonation</li>
              <li>Customizable voice characteristics to match your practice's brand</li>
              <li>Ability to understand and respond to context in conversations</li>
              <li>Emotional intelligence to adapt tone based on caller needs</li>
            </ul>
            <p>
              You can request a demo to hear the quality of our AI voices firsthand.
            </p>
          </div>
        ),
      },
      {
        question: "What happens if my AI Employee can't answer a question?",
        answer: (
          <div className="space-y-2 leading-relaxed">
            <p>
              Your AI Employee is designed to gracefully handle situations when it doesn't have an answer:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>For complex or sensitive questions, it will offer to transfer the call to appropriate staff</li>
              <li>For urgent medical or legal matters, it follows your custom escalation protocols</li>
              <li>It can take detailed messages and schedule callbacks from your team</li>
              <li>It continually learns from interactions to improve future responses</li>
            </ul>
            <p>
              You maintain full control over how calls are triaged and when human intervention is needed.
            </p>
          </div>
        ),
      },
      {
        question: "Can my AI Employee handle outbound calls?",
        answer: (
          <div className="space-y-2 leading-relaxed">
            <p>
              Yes, our Professional and Enterprise plans include outbound calling capabilities for:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Appointment reminders and confirmations</li>
              <li>Follow-up calls for missed appointments</li>
              <li>Routine check-ins with patients/clients</li>
              <li>Payment reminders and billing updates</li>
            </ul>
            <p>
              All outbound calls are clearly identified as coming from your practice, and patients/clients can be seamlessly transferred to your staff if they have questions or concerns.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    name: "Security & Compliance",
    items: [
      {
        question: "Is AgenticVoice.net HIPAA compliant?",
        answer: (
          <div className="space-y-2 leading-relaxed">
            <p>
              Yes, AgenticVoice.net is fully HIPAA compliant. We maintain rigorous security standards to protect patient health information:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>End-to-end encryption for all voice and text data</li>
              <li>Regular security audits and penetration testing</li>
              <li>SOC 2 Type II certification</li>
              <li>Business Associate Agreements (BAAs) provided as standard</li>
              <li>Data retention policies that comply with healthcare regulations</li>
            </ul>
            <p>
              Our Enterprise plan includes advanced compliance features for multi-location practices and those with specialized regulatory needs.
            </p>
          </div>
        ),
      },
      {
        question: "Who owns the data collected by my AI Employee?",
        answer: (
          <div className="space-y-2 leading-relaxed">
            <p>
              Your practice maintains full ownership of all data collected by your AI Employee. AgenticVoice.net:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Never sells or shares your data with third parties</li>
              <li>Provides tools for you to export your data at any time</li>
              <li>Offers detailed audit logs of all AI interactions</li>
              <li>Allows you to set custom data retention policies</li>
            </ul>
            <p>
              We use anonymized, aggregated data only to improve the performance and accuracy of our AI systems, with strict privacy controls in place.
            </p>
          </div>
        ),
      },
      {
        question: "How do you maintain client-attorney privilege for legal practices?",
        answer: (
          <div className="space-y-2 leading-relaxed">
            <p>
              We take attorney-client privilege very seriously and have designed our system to maintain confidentiality:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>All conversations are treated as privileged communications</li>
              <li>AI Employees are programmed to provide appropriate disclaimers</li>
              <li>Initial screening questions protect against conflicts of interest</li>
              <li>Secure data handling complies with bar association guidelines</li>
            </ul>
            <p>
              Our legal practice specialists can work with you to ensure your AI Employee setup aligns with your ethical obligations and practice requirements.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    name: "Pricing & Support",
    items: [
      {
        question: "Is there a setup fee?",
        answer: (
          <div className="space-y-2 leading-relaxed">
            <p>
              No, there are no setup fees. Your monthly subscription includes:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Complete implementation and configuration</li>
              <li>Custom voice and personality development</li>
              <li>Integration with your existing systems</li>
              <li>Staff training and onboarding support</li>
            </ul>
            <p>
              We believe in transparent pricing with no hidden costs. The only additional charges would be for exceeding your plan's monthly minute allocation, which is clearly billed at a competitive per-minute rate.
            </p>
          </div>
        ),
      },
      {
        question: "Can I change plans or cancel my service?",
        answer: (
          <div className="space-y-2 leading-relaxed">
            <p>
              Yes, we offer flexible terms to accommodate your practice's needs:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Upgrade, downgrade, or cancel your plan at any time</li>
              <li>No long-term contracts required (though annual billing discounts are available)</li>
              <li>30-day money-back guarantee for new subscribers</li>
              <li>Pro-rated refunds if you cancel mid-billing cycle</li>
            </ul>
            <p>
              Your satisfaction is our priority, and we're confident that once you experience the benefits of an AI Employee, you'll want to keep them on your team.
            </p>
          </div>
        ),
      },
      {
        question: "What kind of support do you provide?",
        answer: (
          <div className="space-y-2 leading-relaxed">
            <p>
              We provide comprehensive support to ensure your success with AgenticVoice.net:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Essential plan:</strong> Email support with 24-hour response time</li>
              <li><strong>Professional plan:</strong> Priority email and chat support with 4-hour response time</li>
              <li><strong>Enterprise plan:</strong> 24/7 phone, email, and chat support with a dedicated account manager</li>
            </ul>
            <p>
              All plans include monthly performance reviews, regular system updates, and access to our knowledge base and video tutorials.
            </p>
          </div>
        ),
      },
    ],
  },
];

const FaqItem = ({ item }: { item: FAQItemProps }) => {
  const accordion = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li>
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/10"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 text-base-content ${isOpen ? "text-primary" : ""}`}
        >
          {item?.question}
        </span>
        <svg
          className={`flex-shrink-0 w-4 h-4 ml-auto fill-current`}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              isOpen && "rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              isOpen && "rotate-180 hidden"
            }`}
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed">{item?.answer}</div>
      </div>
    </li>
  );
};

// State to track active category
const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState<string>(faqCategories[0].name);
  
  return (
    <section className="bg-base-200" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col text-center w-full mb-12">
          <h2 className="font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-lg max-w-3xl mx-auto text-base-content/70 mb-8">
            Everything you need to know about your AI Employee and how they'll transform your practice
          </p>
          
          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {faqCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`px-4 py-2 rounded-full transition-all ${
                  activeCategory === category.name
                    ? "bg-purple-700 text-white"
                    : "bg-base-300 hover:bg-base-300/80 text-base-content"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {faqCategories
            .filter((category) => category.name === activeCategory)
            .map((category) => (
              <div key={category.name}>
                <ul>
                  {category.items.map((item, i) => (
                    <FaqItem key={i} item={item} />
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
