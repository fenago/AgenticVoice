// Script to check image optimization across the website

console.log('Running image optimization check...');

// Wait for the page to fully load
window.addEventListener('load', () => {
  // Get all image elements
  const images = document.querySelectorAll('img');
  let unoptimizedImages = 0;
  let totalImageSize = 0;
  let potentialSavings = 0;
  
  // Check each image
  images.forEach(img => {
    // Skip Next.js optimized images (they have data-nimg attribute)
    if (img.hasAttribute('data-nimg')) {
      console.log(`✓ Optimized image: ${img.src}`);
      return;
    }
    
    // Flag unoptimized images
    unoptimizedImages++;
    console.warn(`✗ Unoptimized image: ${img.src}`);
    
    // Estimate image size based on dimensions (rough calculation)
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    const approxSize = (width * height * 3) / 1024; // Rough size in KB
    totalImageSize += approxSize;
    
    // Estimate potential savings with Next.js Image optimization (typical savings 30-70%)
    const potentialSaving = approxSize * 0.5; // Assuming 50% reduction
    potentialSavings += potentialSaving;
    
    console.log(`  Estimated size: ~${Math.round(approxSize)}KB, Potential saving: ~${Math.round(potentialSaving)}KB`);
  });
  
  // Output summary
  console.log('\nImage Optimization Summary:');
  console.log(`Total images: ${images.length}`);
  console.log(`Unoptimized images: ${unoptimizedImages}`);
  console.log(`Estimated total unoptimized size: ~${Math.round(totalImageSize)}KB`);
  console.log(`Potential savings with Next.js Image: ~${Math.round(potentialSavings)}KB`);
  
  if (unoptimizedImages > 0) {
    console.log('\nRecommendation: Replace standard <img> tags with Next.js <Image> components for better performance.');
  } else {
    console.log('\nAll images are already optimized with Next.js Image component.');
  }
});
