"use client";

import { useState, useEffect } from "react";

// ROI Calculator component to estimate potential savings and ROI
const ROICalculator = () => {
  // Default values based on average medical practice
  const [inputs, setInputs] = useState({
    monthlyCallVolume: 500,
    missedCallPercentage: 20,
    avgPatientValue: 200,
    monthlyStaffHours: 160,
    hourlyStaffCost: 25,
  });

  const [results, setResults] = useState({
    missedCallRevenue: 0,
    staffTimeSavings: 0,
    annualROI: 0,
    paybackPeriod: 0,
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  // Calculate ROI based on inputs
  useEffect(() => {
    // Missed calls per month
    const missedCalls = (inputs.monthlyCallVolume * inputs.missedCallPercentage) / 100;
    
    // Revenue lost from missed calls per month
    const monthlyRevenueRecovered = missedCalls * inputs.avgPatientValue;
    
    // Annual revenue recovered
    const annualRevenueRecovered = monthlyRevenueRecovered * 12;
    
    // Time saved by staff (assuming 50% reduction in call handling time)
    const monthlyStaffHoursSaved = inputs.monthlyStaffHours * 0.5;
    
    // Annual staff cost savings
    const annualStaffCostSavings = monthlyStaffHoursSaved * inputs.hourlyStaffCost * 12;
    
    // Total annual savings
    const totalAnnualSavings = annualRevenueRecovered + annualStaffCostSavings;
    
    // Annual cost of AgenticVoice.net (using Professional plan as default)
    const annualCost = 899 * 12;
    
    // Annual ROI
    const roi = ((totalAnnualSavings - annualCost) / annualCost) * 100;
    
    // Payback period in months
    const paybackPeriod = (annualCost / totalAnnualSavings) * 12;
    
    setResults({
      missedCallRevenue: annualRevenueRecovered,
      staffTimeSavings: annualStaffCostSavings,
      annualROI: roi,
      paybackPeriod: paybackPeriod,
    });
  }, [inputs]);

  return (
    <section className="py-16 md:py-24 bg-base-100" id="roi-calculator">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col text-center w-full mb-12">
          <h2 className="font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
            Calculate Your <span className="text-primary">ROI</span>
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-base-content/70">
            See how much your practice could save by adding an AI Employee to your team. Our calculator uses real-world data from practices like yours.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-stretch">
          {/* Calculator inputs */}
          <div className="bg-base-200 rounded-xl p-5 md:p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Your Practice Information</h3>
            
            <div className="space-y-5">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Monthly Call Volume</span>
                </label>
                <div className="join w-full">
                  <input
                    type="number"
                    name="monthlyCallVolume"
                    value={inputs.monthlyCallVolume}
                    onChange={handleInputChange}
                    min="0"
                    className="input input-bordered join-item w-full"
                  />
                  <span className="join-item flex items-center justify-center bg-base-300 px-4">calls</span>
                </div>
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Missed Call Percentage</span>
                </label>
                <div className="join w-full">
                  <input
                    type="number"
                    name="missedCallPercentage"
                    value={inputs.missedCallPercentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="input input-bordered join-item w-full"
                  />
                  <span className="join-item flex items-center justify-center bg-base-300 px-4">%</span>
                </div>
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Average Patient Value</span>
                </label>
                <div className="join w-full">
                  <span className="join-item flex items-center justify-center bg-base-300 px-4">$</span>
                  <input
                    type="number"
                    name="avgPatientValue"
                    value={inputs.avgPatientValue}
                    onChange={handleInputChange}
                    min="0"
                    className="input input-bordered join-item w-full"
                  />
                </div>
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Monthly Staff Hours on Phone</span>
                </label>
                <div className="join w-full">
                  <input
                    type="number"
                    name="monthlyStaffHours"
                    value={inputs.monthlyStaffHours}
                    onChange={handleInputChange}
                    min="0"
                    className="input input-bordered join-item w-full"
                  />
                  <span className="join-item flex items-center justify-center bg-base-300 px-4">hrs</span>
                </div>
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Hourly Staff Cost</span>
                </label>
                <div className="join w-full">
                  <span className="join-item flex items-center justify-center bg-base-300 px-4">$</span>
                  <input
                    type="number"
                    name="hourlyStaffCost"
                    value={inputs.hourlyStaffCost}
                    onChange={handleInputChange}
                    min="0"
                    className="input input-bordered join-item w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Calculator results */}
          <div className="bg-primary text-primary-content rounded-xl p-5 md:p-8 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-6">Your Potential Savings</h3>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-base md:text-lg font-medium opacity-90">Annual Revenue Recovered</h4>
                  <p className="text-3xl md:text-4xl font-extrabold mt-2">
                    ${results.missedCallRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="mt-1 opacity-75">From previously missed calls</p>
                </div>
                
                <div>
                  <h4 className="text-base md:text-lg font-medium opacity-90">Annual Staff Cost Savings</h4>
                  <p className="text-3xl md:text-4xl font-extrabold mt-2">
                    ${results.staffTimeSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="mt-1 opacity-75">From reduced time on phone calls</p>
                </div>
                
                <div className="pt-4 border-t border-primary-content/20">
                  <h4 className="text-base md:text-lg font-medium opacity-90">Return on Investment</h4>
                  <p className="text-3xl md:text-4xl font-extrabold mt-2">
                    {results.annualROI.toLocaleString(undefined, { maximumFractionDigits: 0 })}%
                  </p>
                  <p className="mt-1 opacity-75">Annual ROI</p>
                </div>
                
                <div>
                  <h4 className="text-base md:text-lg font-medium opacity-90">Payback Period</h4>
                  <p className="text-3xl md:text-4xl font-extrabold mt-2">
                    {results.paybackPeriod < 1 
                      ? "< 1 month" 
                      : `${results.paybackPeriod.toLocaleString(undefined, { maximumFractionDigits: 1 })} months`}
                  </p>
                  <p className="mt-1 opacity-75">Time to recover investment</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button className="btn btn-lg w-full bg-white text-primary hover:bg-white/90 border-none">
                Get Your Custom ROI Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;
