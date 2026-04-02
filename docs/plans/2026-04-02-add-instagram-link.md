# Add Instagram Link Implementation Plan

> **For agent:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an Instagram social link to the home page next to LinkedIn.

**Architecture:** Update the central site data and the home page component to include the new social link with a matching SVG icon.

**Tech Stack:** Astro, SVG

---

### Task 1: Update Site Data

**Files:**
- Modify: `src/data/site.ts`

**Step 1: Add Instagram URL to site data**

```typescript
// src/data/site.ts
// Modify the contact object
    instagram: 'https://www.instagram.com/bryce_roberts13/',
```

**Step 2: Commit**

```bash
git add src/data/site.ts
git commit -m "feat: add instagram to site data"
```

### Task 2: Update Home Page Social Links

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Add Instagram link to social-links section**

```html
<!-- src/pages/index.astro -->
        <a href={site.contact.instagram} class="social-link" title="Instagram" target="_blank" rel="noopener noreferrer">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
        </a>
```

**Step 2: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add instagram link to home page"
```

### Task 3: Verification

**Step 1: Verify file contents**

Run: `cat src/pages/index.astro | grep instagram`
Expected: The line with `site.contact.instagram` is present.

**Step 2: Manual Verification**

Ask user to check the preview.
