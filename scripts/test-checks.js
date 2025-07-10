// Simple accessibility and functionality tests

// Wait for page to fully load
window.addEventListener('load', () => {
  console.log('Running accessibility and functionality tests...');
  
  // Test 1: Check all images have alt text
  const images = document.querySelectorAll('img');
  let imagesWithoutAlt = 0;
  
  images.forEach(img => {
    if (!img.hasAttribute('alt') || img.getAttribute('alt') === '') {
      imagesWithoutAlt++;
      console.warn('Image missing alt text:', img.src);
    }
  });
  
  console.log(`Images without alt text: ${imagesWithoutAlt}/${images.length}`);
  
  // Test 2: Check all links have href
  const links = document.querySelectorAll('a');
  let brokenLinks = 0;
  
  links.forEach(link => {
    if (!link.hasAttribute('href') || link.getAttribute('href') === '#' || link.getAttribute('href') === '') {
      brokenLinks++;
      console.warn('Link without proper href:', link.textContent || link.innerHTML);
    }
  });
  
  console.log(`Potentially broken links: ${brokenLinks}/${links.length}`);
  
  // Test 3: Check form elements have labels
  const formInputs = document.querySelectorAll('input, textarea, select');
  let inputsWithoutLabels = 0;
  
  formInputs.forEach(input => {
    // Skip hidden inputs and those with aria-label
    if (input.type === 'hidden' || input.hasAttribute('aria-label')) return;
    
    const id = input.getAttribute('id');
    if (!id || !document.querySelector(`label[for="${id}"]`)) {
      inputsWithoutLabels++;
      console.warn('Form element without associated label:', input);
    }
  });
  
  console.log(`Form elements without labels: ${inputsWithoutLabels}/${formInputs.length}`);
  
  // Test 4: Check heading hierarchy
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let headingIssues = 0;
  
  // Group headings by level
  const headingLevels = headings.map(h => parseInt(h.tagName.substring(1)));
  
  // Check for skipped levels (e.g., h1 to h3 without h2)
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] > headingLevels[i-1] + 1) {
      headingIssues++;
      console.warn(`Heading level skipped from ${headingLevels[i-1]} to ${headingLevels[i]}`);
    }
  }
  
  console.log(`Heading hierarchy issues: ${headingIssues}`);
  
  // Test 5: Check buttons have accessible names
  const buttons = document.querySelectorAll('button');
  let buttonsWithoutText = 0;
  
  buttons.forEach(button => {
    if (!button.textContent.trim() && !button.hasAttribute('aria-label')) {
      buttonsWithoutText++;
      console.warn('Button without text or aria-label:', button);
    }
  });
  
  console.log(`Buttons without accessible names: ${buttonsWithoutText}/${buttons.length}`);
  
  console.log('Tests completed.');
});
