# AgenticVoice Landing Page Migration Plan

This checklist outlines the steps required to transform the existing FeNAgO landing page into the AgenticVoice.net landing page for medical and legal professionals as specified in the landing_page_draft.md.

## 1. Project Setup & Configuration

- [ ] Update project name and metadata in config.ts
- [ ] Update SEO metadata in app/page.tsx with AgenticVoice.net information
- [ ] Create new logo and favicon for AgenticVoice.net
- [ ] Update color scheme to match medical/legal professional target audience

## 2. Header/Navigation

- [ ] Modify Header.tsx component to match the specified navigation structure
- [ ] Update navigation links to include: Features, Testimonials, Pricing, FAQ
- [ ] Add "Contact" and "Request Demo" buttons to navigation
- [ ] Create mobile menu toggle with appropriate styling
- [ ] Update logo to AgenticVoice.net

## 3. Hero Section

- [ ] Rewrite Hero.tsx component with new headline: "Never Miss Another Call. Your AI Staff Is Always Available"
- [ ] Update subheadline copy focusing on AI voice agents for medical/legal practices
- [ ] Change CTA buttons to "Schedule Your Demo" and "ROI Calculator"
- [ ] Add hero stats section with 93% patient satisfaction, 24/7 availability, and 30% more appointments
- [ ] Create/update hero image showing AgenticVoice.net AI assistant for medical/legal practices
- [ ] Add floating dialogue cards showing example AI conversations

## 4. Problem Section

- [ ] Completely rewrite Problem.tsx component to focus on "The Hidden Cost of Missed Calls"
- [ ] Add problem stats cards with the statistics from landing_page_draft.md
- [ ] Create the problem scenario section with image of overwhelmed medical office staff
- [ ] Add the quote from Dr. Brenner's perspective
- [ ] Update styling to match the new content structure

## 5. Features/Solution Section

- [ ] Replace FeaturesAccordion.tsx with a new Solution.tsx component
- [ ] Implement "Meet Your New AI Staff Member" section with 6 feature cards
- [ ] Create icons for each feature: 24/7 availability, scheduling, FAQ handling, lead qualification, multilingual support, analytics
- [ ] Add the solution demo section with audio player for sample calls
- [ ] Implement "Listen to Sample Calls" button and functionality

## 6. How It Works Section

- [ ] Create new HowItWorks.tsx component
- [ ] Implement the 4-step process: Initial Consultation, Custom Configuration, Seamless Integration, Ongoing Optimization
- [ ] Add appropriate icons and styling for the step numbers
- [ ] Include integration logos section

## 7. ROI Calculator Section

- [ ] Create new ROICalculator.tsx component
- [ ] Implement interactive calculator with form inputs for practice stats
- [ ] Create calculation logic for showing potential savings and ROI
- [ ] Style calculator with appropriate medical/legal theme
- [ ] Add results display with animated counters

## 8. Pricing Section

- [ ] Update Pricing.tsx component with the three-tier pricing structure
- [ ] Replace existing pricing plans with Essential ($499), Professional ($899), and Enterprise ($1,799) packages
- [ ] Update feature lists for each plan based on landing_page_draft.md
- [ ] Modify ButtonCheckout component to work with the new pricing structure
- [ ] Add highlighted recommended plan (Professional)

## 9. Testimonials Section

- [ ] Update Testimonials3.tsx to include quotes from medical and legal professionals
- [ ] Replace testimonial avatars with appropriate professional headshots
- [ ] Update testimonial quotes to match the target audience pain points
- [ ] Adjust styling to fit the medical/legal theme

## 10. FAQ Section

- [ ] Update FAQ.tsx with new questions relevant to AI voice agents for medical/legal practices
- [ ] Group FAQs into categories: Implementation, Technology, Security & Compliance, and Pricing
- [ ] Ensure all questions from landing_page_draft.md are included
- [ ] Update styling to match the new content structure

## 11. Call-to-Action Section

- [ ] Update CTA.tsx with new headline "Ready to Transform Your Practice?"
- [ ] Implement the demo request form with name, email, practice type, and phone fields
- [ ] Add the scheduling calendar integration
- [ ] Include privacy policy text
- [ ] Style form to match the overall design theme

## 12. Footer Section

- [ ] Update Footer.tsx with appropriate links for AgenticVoice.net
- [ ] Add social media links
- [ ] Update copyright information
- [ ] Include links to privacy policy, terms of service, and HIPAA compliance information
- [ ] Add contact information section

## 13. Mobile Responsiveness

- [ ] Ensure all new components are fully responsive
- [ ] Test mobile menu functionality
- [ ] Optimize images for mobile devices
- [ ] Verify spacing and typography works on all screen sizes

## 14. Additional Assets

- [ ] Create/source all necessary images mentioned in landing_page_draft.md
- [ ] Record sample call audio files for the demo section
- [ ] Design custom icons for feature sections
- [ ] Create integration partner logos

## 15. Performance & Testing

- [ ] Optimize all images and assets for web performance
- [ ] Test page load speed and make necessary optimizations
- [ ] Ensure all links and buttons work correctly
- [ ] Test form submissions and ROI calculator functionality
- [ ] Verify browser compatibility across major browsers
