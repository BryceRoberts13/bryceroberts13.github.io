# Design Doc: Resume Link Integration

This document outlines the design for adding a prominent "Download Resume" link to the portfolio's resume page.

## Goal
The goal is to allow visitors to easily access a PDF version of the resume directly from the resume page, while maintaining the "premium" and minimalist aesthetic of the site.

## Proposed Design

### 1. File Syncing
- **Source**: `Career/website/public/resume.pdf`
- **Destination**: `bryceroberts13.github.io/public/resume.pdf`
- The file will be copied during the build or development process to ensure the live site always has the most recent version.

### 2. UI Components
- **Primary Button**: A new `.primary-btn` class will be added to `src/pages/resume.astro`.
- **Styling**:
    - `background: var(--accent)`
    - `color: var(--bg-dark)`
    - `border-radius: 6px`
    - `font-weight: 600`
    - `transition: background 0.2s ease`
- **Icon**: An SVG representing an "external link" or "download" will be included next to the text.
- **Link Behavior**: `target="_blank"` to open in a new tab.

### 3. Layout Update
The header in `resume.astro` will be updated to display:
- `Download Resume` (Primary)
- `Contact Me` (Secondary)

## Implementation Plan
After this design is approved, an implementation plan will be created to:
1. Copy the PDF file.
2. Update the `resume.astro` styles and template.
3. Verify the layout on different screen sizes.

## Verification
- Confirm the link opens the correct file.
- Verify the button is responsive.
- Ensure the "Contact Me" button still works as expected.
