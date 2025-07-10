// Comprehensive performance audit script

console.log('Running comprehensive performance audit...');

// Track page load performance
const pageLoadStart = performance.now();

window.addEventListener('load', () => {
  const pageLoadTime = performance.now() - pageLoadStart;
  console.log(`\n🔍 PERFORMANCE AUDIT REPORT`);
  console.log(`============================`);
  
  // Load time metrics
  console.log(`\n📊 PAGE LOAD METRICS:`);
  console.log(`Total page load time: ${pageLoadTime.toFixed(2)}ms`);
  
  // Get Web Vitals if available
  if (window.performance && window.performance.getEntriesByType) {
    const paintMetrics = window.performance.getEntriesByType('paint');
    const navTiming = window.performance.getEntriesByType('navigation')[0];
    
    if (paintMetrics && paintMetrics.length > 0) {
      console.log('\n⚡ WEB VITALS:');
      paintMetrics.forEach(metric => {
        console.log(`${metric.name}: ${metric.startTime.toFixed(2)}ms`);
      });
    }
    
    if (navTiming) {
      console.log('\n🕒 NAVIGATION TIMING:');
      console.log(`DNS lookup: ${navTiming.domainLookupEnd - navTiming.domainLookupStart}ms`);
      console.log(`Connection time: ${navTiming.connectEnd - navTiming.connectStart}ms`);
      console.log(`Time to First Byte: ${navTiming.responseStart - navTiming.requestStart}ms`);
      console.log(`DOM Content Loaded: ${navTiming.domContentLoadedEventEnd}ms`);
      console.log(`Server response time: ${navTiming.responseEnd - navTiming.responseStart}ms`);
    }
  }
  
  // Resource audit
  console.log('\n📦 RESOURCE AUDIT:');
  const resources = window.performance.getEntriesByType('resource');
  let totalResourceSize = 0;
  let imageSize = 0;
  let jsSize = 0;
  let cssSize = 0;
  let fontSize = 0;
  let otherSize = 0;
  
  resources.forEach(resource => {
    const size = resource.transferSize || 0;
    totalResourceSize += size;
    
    if (resource.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
      imageSize += size;
    } else if (resource.name.match(/\.js(\?.*)?$/i)) {
      jsSize += size;
    } else if (resource.name.match(/\.css(\?.*)?$/i)) {
      cssSize += size;
    } else if (resource.name.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
      fontSize += size;
    } else {
      otherSize += size;
    }
  });
  
  console.log(`Total resources: ${resources.length}`);
  console.log(`Total size: ${(totalResourceSize / 1024).toFixed(2)}KB`);
  console.log(`Images: ${(imageSize / 1024).toFixed(2)}KB`);
  console.log(`JavaScript: ${(jsSize / 1024).toFixed(2)}KB`);
  console.log(`CSS: ${(cssSize / 1024).toFixed(2)}KB`);
  console.log(`Fonts: ${(fontSize / 1024).toFixed(2)}KB`);
  console.log(`Other: ${(otherSize / 1024).toFixed(2)}KB`);
  
  // DOM size audit
  console.log('\n🏗️ DOM AUDIT:');
  const domSize = document.querySelectorAll('*').length;
  console.log(`Total DOM elements: ${domSize}`);
  if (domSize > 1500) {
    console.warn('⚠️ Large DOM size detected. Consider reducing DOM elements for better performance.');
  }
  
  // Check for console errors
  console.log('\n🐞 ERROR CHECK:');
  const originalConsoleError = console.error;
  let errorCount = 0;
  
  console.error = function(...args) {
    errorCount++;
    originalConsoleError.apply(console, args);
  };
  
  setTimeout(() => {
    console.error = originalConsoleError;
    console.log(`JS errors detected: ${errorCount}`);
    
    // Final recommendations
    console.log('\n🚀 RECOMMENDATIONS:');
    if (pageLoadTime > 3000) {
      console.warn('⚠️ Page load time is high. Consider:');
      console.warn('  - Lazy loading non-critical components');
      console.warn('  - Optimizing images with Next.js Image component');
      console.warn('  - Reducing JavaScript bundle size');
    }
    
    if (jsSize > 500 * 1024) {
      console.warn('⚠️ JavaScript size is large. Consider code splitting and lazy loading.');
    }
    
    if (imageSize > 1000 * 1024) {
      console.warn('⚠️ Image size is large. Optimize images and use Next.js Image component.');
    }
    
    console.log('\nAudit complete! For more detailed analysis, run Lighthouse in Chrome DevTools.');
  }, 1000);
});
