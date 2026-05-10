# Tania-inspired layout, home as About, sidebar, themes

Approved 2026-05-08. Implementation follows this spec; existing light-theme appearance must not regress.

## Goals

1. **Shell:** Replace top navbar with a **left sidebar** (site identity, navigation, social links, **sidebar visibility toggle**, **light/dark theme toggle**). Main content uses same typography and Relace-inspired **light** palette as today unless user opts into dark mode.
2. **Home:** Root URL `/` shows the **same About content and layout** as the About page (prose, structure). `/about` remains a valid URL with the same content (no mandatory redirect).
3. **Theme:** User can switch **light** and **dark**. Default before any stored preference follows **`prefers-color-scheme`**. After user chooses, persist choice in **`localStorage`**. **Do not edit** the existing light-theme custom property block in `global.css`; add dark theme via an additive selector (e.g. `[data-theme="dark"]`).
4. **Sidebar visibility (desktop):** Toggle collapses the sidebar; when hidden, **main column stays at current max-width behavior and is horizontally centered** in the viewport (no permanent empty gutter). Persist open/closed state in **`localStorage`**.
5. **Mobile:** Navigation lives in a **drawer that overlays main content** (not push-layout). Sidebar collapse behavior applies to desktop-wide breakpoints; mobile uses drawer open/close separate from desktop collapse unless noted otherwise in implementation.

## Non-goals

- Pixel-perfect clone of taniarascia.com (reference only for IA: sidebar + reading layout).
- Changing Inter / Roboto Mono pairing or refactoring unrelated pages beyond what the new shell requires.

## Layout and components

- **`BaseLayout`:** Wrapper uses **CSS Grid** (or equivalent): **aside** + **main**. `main` retains readable max-width and padding consistent with current `main` rules after shell change.
- **Refactor `Navigation.astro`** into a **sidebar** component: vertical links (Home, About, Projects, Garden, Resume), active state, logo/site mark, social block (reuse existing patterns from site data).
- **Desktop collapse:** Toggling hide removes or zeroes aside width; **main** is **centered**. Prefer CSS-driven layout over duplicating content.
- **Mobile:** Control opens **overlay drawer**; focus trap and escape-to-close are desirable; minimum is usable tap targets and no broken scroll.

## Client script

- **Theme:** Set `data-theme` on `<html>`. Optional **inline script in `<head>`** runs before paint to apply stored theme (or system) and reduce flash.
- **Sidebar:** Client logic for **persisted collapsed state** on desktop; drawer open state can be ephemeral (no requirement to persist drawer open on mobile).

## Storage keys

Define stable string keys in one place (e.g. small module or constants):

| Concern            | Persistence        |
|--------------------|--------------------|
| Color theme        | `localStorage`     |
| Sidebar collapsed  | `localStorage`     |

Exact key names are an implementation detail; avoid colliding with unrelated keys.

## Accessibility

- Theme control: **`<button>`** with **`aria-label`** reflecting target mode; visible focus.
- Sidebar toggle: labels / `aria-expanded` as appropriate for collapse vs drawer.
- Respect **`prefers-reduced-motion`** for sidebar width and drawer transitions where practical.

## Files likely touched (planning hint only)

- `src/layouts/BaseLayout.astro`, `src/components/Navigation.astro` (rename or replace with sidebar), `src/styles/global.css` (additive dark + layout), `src/pages/index.astro`, `src/pages/about.astro` (shared content), possibly small Astro island(s) for toggles and drawer.

## Verification

- Light theme default: **visually match pre-change light appearance** on first load (system light).
- Toggle dark: readable contrast, accent still coherent.
- Collapse sidebar: main **centered**, no layout break on Projects/Garden/Resume.
- Mobile: drawer **over** content; no horizontal scrollbar from shell alone.

## Open decisions left to implementation

- Exact breakpoint where drawer replaces persistent sidebar.
- Whether Home and About share one Astro component or duplicate layout with shared content import (either is fine if DRY on markdown body).
