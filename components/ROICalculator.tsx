"use client";

import { useState, useEffect } from "react";
import { smoothScrollTo } from '@/utils/smoothScroll';

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

  // Handle slider changes
  const handleSliderChange = (name: string, value: number) => {
    setInputs((prev) => ({
      ...prev,
      [name]: value,
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
            
            <div className="space-y-6">
              {/* Monthly Call Volume Slider */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Monthly Call Volume</span>
                  <span className="label-text-alt font-bold text-primary">{inputs.monthlyCallVolume.toLocaleString()} calls</span>
                </label>
                <input
                  type="range"
                  name="monthlyCallVolume"
                  min="100"
                  max="2000"
                  step="50"
                  value={inputs.monthlyCallVolume}
                  onChange={(e) => handleSliderChange('monthlyCallVolume', parseInt(e.target.value))}
                  className="range range-primary"
                />
                <div className="w-full flex justify-between text-xs px-2 mt-1">
                  <span>100</span>
                  <span>500</span>
                  <span>1000</span>
                  <span>1500</span>
                  <span>2000</span>
                </div>
              </div>

              {/* Missed Call Percentage Slider */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Missed Call Rate</span>
                  <span className="label-text-alt font-bold text-primary">{inputs.missedCallPercentage}%</span>
                </label>
                <input
                  type="range"
                  name="missedCallPercentage"
                  min="5"
                  max="50"
                  step="5"
                  value={inputs.missedCallPercentage}
                  onChange={(e) => handleSliderChange('missedCallPercentage', parseInt(e.target.value))}
                  className="range range-primary"
                />
                <div className="w-full flex justify-between text-xs px-2 mt-1">
                  <span>5%</span>
                  <span>15%</span>
                  <span>25%</span>
                  <span>35%</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Average Patient/Client Value Slider */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Average Client Value</span>
                  <span className="label-text-alt font-bold text-primary">${inputs.avgPatientValue}</span>
                </label>
                <input
                  type="range"
                  name="avgPatientValue"
                  min="50"
                  max="1000"
                  step="50"
                  value={inputs.avgPatientValue}
                  onChange={(e) => handleSliderChange('avgPatientValue', parseInt(e.target.value))}
                  className="range range-primary"
                />
                <div className="w-full flex justify-between text-xs px-2 mt-1">
                  <span>$50</span>
                  <span>$250</span>
                  <span>$500</span>
                  <span>$750</span>
                  <span>$1000</span>
                </div>
              </div>

              {/* Monthly Staff Hours on Phone Slider */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Staff Hours on Phone/Month</span>
                  <span className="label-text-alt font-bold text-primary">{inputs.monthlyStaffHours} hours</span>
                </label>
                <input
                  type="range"
                  name="monthlyStaffHours"
                  min="40"
                  max="400"
                  step="20"
                  value={inputs.monthlyStaffHours}
                  onChange={(e) => handleSliderChange('monthlyStaffHours', parseInt(e.target.value))}
                  className="range range-primary"
                />
                <div className="w-full flex justify-between text-xs px-2 mt-1">
                  <span>40</span>
                  <span>120</span>
                  <span>200</span>
                  <span>280</span>
                  <span>400</span>
                </div>
              </div>

              {/* Hourly Staff Cost Slider */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Hourly Staff Cost</span>
                  <span className="label-text-alt font-bold text-primary">${inputs.hourlyStaffCost}/hour</span>
                </label>
                <input
                  type="range"
                  name="hourlyStaffCost"
                  min="15"
                  max="50"
                  step="5"
                  value={inputs.hourlyStaffCost}
                  onChange={(e) => handleSliderChange('hourlyStaffCost', parseInt(e.target.value))}
                  className="range range-primary"
                />
                <div className="w-full flex justify-between text-xs px-2 mt-1">
                  <span>$15</span>
                  <span>$25</span>
                  <span>$35</span>
                  <span>$45</span>
                  <span>$50</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Calculator results */}
          <div className="bg-base-200 rounded-xl p-5 md:p-8 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Your Potential Savings</h3>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-base md:text-lg font-medium text-gray-700">Annual Revenue Recovered</h4>
                  <p className="text-3xl md:text-4xl font-extrabold mt-2 text-purple-700">
                    ${results.missedCallRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="mt-1 text-gray-600">From previously missed calls</p>
                </div>
                
                <div>
                  <h4 className="text-base md:text-lg font-medium text-gray-700">Annual Staff Cost Savings</h4>
                  <p className="text-3xl md:text-4xl font-extrabold mt-2 text-purple-700">
                    ${results.staffTimeSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="mt-1 text-gray-600">From reduced time on phone calls</p>
                </div>
                
                <div className="pt-4 border-t border-gray-300">
                  <h4 className="text-base md:text-lg font-medium text-gray-700">Return on Investment</h4>
                  <p className="text-3xl md:text-4xl font-extrabold mt-2 text-purple-700">
                    {results.annualROI.toLocaleString(undefined, { maximumFractionDigits: 0 })}%
                  </p>
                  <p className="mt-1 text-gray-600">Annual ROI</p>
                </div>
                
                <div>
                  <h4 className="text-base md:text-lg font-medium text-gray-700">Payback Period</h4>
                  <p className="text-3xl md:text-4xl font-extrabold mt-2 text-purple-700">
                    {results.paybackPeriod < 1 
                      ? "< 1 month" 
                      : `${results.paybackPeriod.toLocaleString(undefined, { maximumFractionDigits: 1 })} months`}
                  </p>
                  <p className="mt-1 text-gray-600">Time to recover investment</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button 
                className="btn btn-lg w-full btn-primary text-white"
                onClick={() => smoothScrollTo('demo')}
              >
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
