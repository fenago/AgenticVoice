"use client";

import { useState } from "react";
import Image from "next/image";
import config from "@/config";

// Practice types for the dropdown selection
const practiceTypes = [
  { value: "", label: "Select your practice type" },
  { value: "medical-primary", label: "Medical - Primary Care" },
  { value: "medical-specialty", label: "Medical - Specialty" },
  { value: "dental", label: "Dental" },
  { value: "legal-general", label: "Legal - General Practice" },
  { value: "legal-specialty", label: "Legal - Specialty" },
  { value: "other", label: "Other" },
];

// Available time slots for the demo
const timeSlots = [
  { value: "", label: "Select a time slot" },
  { value: "morning", label: "Morning (9am - 12pm)" },
  { value: "afternoon", label: "Afternoon (1pm - 5pm)" },
  { value: "custom", label: "Request a custom time" },
];

const CTA = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    practiceType: "",
    preferredTime: "",
    message: "",
    agreeToTerms: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear any previous error message when user makes changes
    if (submitError) setSubmitError(null);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form data:', formData);
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Send form data to the API endpoint
      console.log('Sending request to /api/demo...');
      const response = await fetch('/api/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to submit demo request');
      }
      
      // Show success message and reset form
      console.log('✅ Form submitted successfully!');
      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        practiceType: "",
        preferredTime: "",
        message: "",
        agreeToTerms: false
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      
    } catch (error: any) {
      console.error('❌ Error submitting demo request:', error);
      setSubmitError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="demo" className="py-12 md:py-24 bg-base-100">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left column - Text content */}
          <div>
            <div className="max-w-md mx-auto md:mx-0 text-center md:text-left space-y-4 md:space-y-6">
              <h2 className="font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6">
                Ready to <span className="text-primary">Transform</span> Your Practice?
              </h2>
              
              <p className="text-lg text-base-content/80 mb-8">
                Schedule a personalized demo to see how an AI Employee can revolutionize your practice's communication, boost efficiency, and improve patient satisfaction.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">30-Minute Live Demo</h3>
                    <p className="text-base-content/70">See your AI Employee in action, handling real-world scenarios for your practice.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Custom Implementation Plan</h3>
                    <p className="text-base-content/70">Receive a tailored proposal specific to your practice's unique needs.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Personalized ROI Analysis</h3>
                    <p className="text-base-content/70">We'll calculate your potential savings and efficiency gains based on your practice data.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Form */}
          <div className="bg-base-200 rounded-xl p-5 md:p-8 shadow-lg max-w-lg mx-auto md:ml-auto md:mr-0">
            <h3 className="text-2xl font-bold mb-6">Schedule Your Demo</h3>
            
            {submitSuccess && (
              <div className="alert alert-success mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Thank you! We'll contact you shortly to schedule your demo.</span>
              </div>
            )}
            
            {submitError && (
              <div className="alert alert-error mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{submitError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="input input-bordered w-full" 
                  placeholder="Dr. John Smith" 
                  disabled={isSubmitting}
                  required 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="input input-bordered w-full" 
                    placeholder="doctor@example.com" 
                    disabled={isSubmitting}
                    required 
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phone Number</span>
                  </label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="input input-bordered w-full" 
                    placeholder="(555) 123-4567" 
                    disabled={isSubmitting}
                    required 
                  />
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Practice Type</span>
                </label>
                <select 
                  name="practiceType" 
                  value={formData.practiceType} 
                  onChange={handleChange} 
                  className="select select-bordered w-full" 
                  disabled={isSubmitting}
                  required
                >
                  {practiceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Preferred Time for Demo</span>
                </label>
                <select 
                  name="preferredTime" 
                  value={formData.preferredTime} 
                  onChange={handleChange} 
                  className="select select-bordered w-full" 
                  disabled={isSubmitting}
                  required
                >
                  {timeSlots.map(slot => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Additional Information</span>
                </label>
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleChange} 
                  className="textarea textarea-bordered w-full" 
                  placeholder="Tell us about your practice's specific needs or challenges..." 
                  disabled={isSubmitting}
                  rows={3}
                ></textarea>
              </div>
              
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input 
                    type="checkbox" 
                    name="agreeToTerms" 
                    checked={formData.agreeToTerms} 
                    onChange={handleChange} 
                    className="checkbox checkbox-primary" 
                    disabled={isSubmitting}
                    required 
                  />
                  <span className="label-text text-xs">
                    I agree to AgenticVoice.net's <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a> and consent to being contacted about my demo request.
                  </span>
                </label>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-full sm:flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Submitting...
                  </>
                ) : (
                  'Request Your Demo'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full"></div>
        <div className="absolute bottom-12 -left-24 w-64 h-64 bg-primary/5 rounded-full"></div>
      </div>
    </section>
  );
};

export default CTA;
