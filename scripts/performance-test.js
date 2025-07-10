// Simple performance testing script

const startTime = performance.now();

document.addEventListener('DOMContentLoaded', () => {
  const domLoadTime = performance.now() - startTime;
  console.log(`DOM Loaded in: ${domLoadTime.toFixed(2)}ms`);
});

window.addEventListener('load', () => {
  const fullLoadTime = performance.now() - startTime;
  console.log(`Page Fully Loaded in: ${fullLoadTime.toFixed(2)}ms`);
  
  // Get performance metrics
  if (window.performance && window.performance.getEntriesByType) {
    const paintMetrics = window.performance.getEntriesByType('paint');
    const navigationMetrics = window.performance.getEntriesByType('navigation')[0];
    
    paintMetrics.forEach(metric => {
      console.log(`${metric.name}: ${metric.startTime.toFixed(2)}ms`);
    });
    
    if (navigationMetrics) {
      console.log(`DOM Content Loaded: ${navigationMetrics.domContentLoadedEventEnd.toFixed(2)}ms`);
      console.log(`First Byte: ${navigationMetrics.responseStart.toFixed(2)}ms`);
    }
  }
  
  // Check all images are loaded properly
  const images = document.querySelectorAll('img');
  let loadedImages = 0;
  let totalImages = images.length;
  
  images.forEach(img => {
    if (img.complete) loadedImages++;
  });
  
  console.log(`Images loaded: ${loadedImages}/${totalImages}`);
});
