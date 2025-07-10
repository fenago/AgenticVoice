// Performance testing script for AgenticVoice.net
// This script will analyze page load performance and provide recommendations

(function() {
  console.log('ud83dudcca AgenticVoice.net Performance Test Running');
  
  // Measure page load time
  const startTime = performance.now();
  
  window.addEventListener('load', function() {
    const loadTime = performance.now() - startTime;
    console.log(`ud83dude80 Page loaded in ${loadTime.toFixed(2)}ms`);
    
    // Analyze resources
    const resources = performance.getEntriesByType('resource');
    let totalSize = 0;
    let imageSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    
    resources.forEach(resource => {
      const size = resource.transferSize || 0;
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
      console.warn(`u26a0ufe0f ${unoptimizedImages} images not using Next.js Image optimization`);
    }
    
    // Performance recommendations
    console.log('\nud83dudccb Performance Recommendations:');
    
    if (loadTime > 3000) {
      console.warn('u26a0ufe0f Page load time is high. Consider code splitting and lazy loading.');
    }
    
    if (imageSize > 500 * 1024) {
      console.warn('u26a0ufe0f Large image payload. Optimize images with Next.js Image component.');
    }
    
    if (jsSize > 250 * 1024) {
      console.warn('u26a0ufe0f Large JavaScript payload. Consider code splitting.');
    }
    
    console.log('\nu2705 Performance test complete');
  });
})();
