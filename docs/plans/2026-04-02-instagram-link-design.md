# Instagram Link Addition Design

This document outlines the design for adding an Instagram link to the home page of the portfolio website.

## Proposed Changes

### Data Layer
- **File:** `src/data/site.ts`
- **Change:** Add `instagram` to the `contact` object in the `site` constant.
- **Value:** `https://www.instagram.com/bryce_roberts13/`

### Presentation Layer
- **File:** `src/pages/index.astro`
- **Change:** Add a new social link anchor tag to the `social-links` section.
- **Icon:** Matching Lucide-style Instagram SVG.
- **Position:** Last in the sequence of social links (after LinkedIn).

## Implementation Details

### Social Link Structure
```html
<a href={site.contact.instagram} class="social-link" title="Instagram" target="_blank" rel="noopener noreferrer">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
</a>
```

## Verification Plan
1. **Manual Check:** Run `npm run dev` and verify the link appears and points to the correct URL.
2. **Visual Check:** Ensure the icon matches the style and alignment of existing icons.
