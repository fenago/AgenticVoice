"use client";

import { useState } from 'react';

const PerformanceTestButton = () => {
  const [testRunning, setTestRunning] = useState(false);

  const runPerformanceTest = () => {
    setTestRunning(true);
    console.log('📊 AgenticVoice.net Performance Test Running');
    
    // Measure page load time
    const startTime = performance.now();
    
    // Analyze resources
    const resources = performance.getEntriesByType('resource');
    let totalSize = 0;
    let imageSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    
    resources.forEach(resource => {
      // Type cast to PerformanceResourceTiming which has transferSize property
      const resourceTiming = resource as PerformanceResourceTiming;
      const size = resourceTiming.transferSize || 0;
      totalSize += size;
      
      if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        imageSize += size;
      } else if (resource.name.match(/\.js(\?.*)?$/i)) {
        jsSize += size;
      } else if (resource.name.match(/\.css(\?.*)?$/i)) {
        cssSize += size;
      }
    });
    
    console.log(`Total resources loaded: ${resources.length}`);
    console.log(`Total size: ${(totalSize / 1024).toFixed(2)}KB`);
    console.log(`Image size: ${(imageSize / 1024).toFixed(2)}KB`);
    console.log(`JavaScript size: ${(jsSize / 1024).toFixed(2)}KB`);
    console.log(`CSS size: ${(cssSize / 1024).toFixed(2)}KB`);
    
    // Check images using Next.js Image
    const images = document.querySelectorAll('img');
    let optimizedImages = 0;
    let unoptimizedImages = 0;
    
    images.forEach(img => {
      if (img.hasAttribute('data-nimg')) {
        optimizedImages++;
      } else {
        unoptimizedImages++;
      }
    });
    
    console.log(`Images using Next.js optimization: ${optimizedImages}/${images.length}`);
    
    if (unoptimizedImages > 0) {
      console.warn(`⚠️ ${unoptimizedImages} images not using Next.js Image optimization`);
    }
    
    // Performance recommendations
    console.log('\n📋 Performance Recommendations:');
    
    const loadTime = performance.now() - startTime;
    console.log(`🚀 Test completed in ${loadTime.toFixed(2)}ms`);
    
    if (loadTime > 3000) {
      console.warn('⚠️ Page load time is high. Consider code splitting and lazy loading.');
    }
    
    if (imageSize > 500 * 1024) {
      console.warn('⚠️ Large image payload. Optimize images with Next.js Image component.');
    }
    
    if (jsSize > 250 * 1024) {
      console.warn('⚠️ Large JavaScript payload. Consider code splitting.');
    }
    
    console.log('\n✅ Performance test complete');
    setTestRunning(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={runPerformanceTest}
        disabled={testRunning}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg transition-all"
      >
        {testRunning ? 'Running Test...' : 'Run Performance Test'}
      </button>
    </div>
  );
};

export default PerformanceTestButton;
