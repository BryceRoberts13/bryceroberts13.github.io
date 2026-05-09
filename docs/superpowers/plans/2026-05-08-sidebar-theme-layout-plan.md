# Sidebar shell, About home, themes — Implementation Plan

> **For agentic workers:** Preferred flow: sequential tasks on same repo; do not parallelize implementers touching `BaseLayout.astro`.

**Goal:** Sidebar layout with persisted collapse (desktop centered main when hidden), mobile overlay drawer, light/dark theme with additive dark CSS (`:root` light block untouched), `/` renders same markdown About body as `/about`.

**Architecture:** Single `Sidebar.astro` provides nav, social links, sidebar-toggle (desktop collapse), theme toggle, menu button (mobile); `shell.ts` applies listeners, persists `localStorage`, toggles drawer. `global.css` adds layout/grid, drawer/backdrop styles, `[data-theme="dark"]` token overrides after existing `:root`. Theme + optional sidebar-collapsed hydrate via small `is:inline` scripts in `BaseLayout` `<head>` to limit FOUC. Shared `AboutPage.astro` fetches markdown once per page compile.

**Tech Stack:** Astro 6, vanilla TypeScript `<script>` module (`src/scripts/shell.ts`), CSS custom properties.

---

### Task 1: Storage keys module

**Files:**
- Create: `src/lib/site-storage.ts`

- [ ] **Step 1: Add stable key exports**

Create `src/lib/site-storage.ts`:

```typescript
/** localStorage keys for site chrome; keep stable for persisted preferences */
export const THEME_STORAGE_KEY = 'br-site-theme';
export const SIDEBAR_COLLAPSED_STORAGE_KEY = 'br-site-sidebar-collapsed';

export type StoredThemePreference = 'light' | 'dark';
```

- [ ] **Step 2: Commit**

Run:

```bash
git add src/lib/site-storage.ts
git commit -m "chore: add site chrome storage keys"
```

---

### Task 2: Global styles — additive layout + dark theme

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Append layout variables (new `:root` block only for layout)**

After the closing `}` of the existing `:root { ... }` block (after `--nav-height` line — **do not remove or rename existing light tokens**), append a separate rule:

```css
/* Layout additions only (light tokens above stay unchanged). */
:root {
  --breakpoint-sidebar: 768px;
  --sidebar-width: clamp(240px, 22vw, 280px);
  --shell-gap: clamp(1.25rem, 3vw, 2rem);
}
```

Then replace the old `main` padding rule (`padding: calc(var(--nav-height) + 2rem) ...`) so main no longer offsets a top navbar:

```css
main {
  max-width: 800px;
  margin-inline: auto;
  width: 100%;
  padding: var(--shell-gap) clamp(1rem, 3vw, 1.5rem) 4rem;
}
```

(Remove dependency on `--nav-height` for main padding.)

- [ ] **Step 2: Add `[data-theme="dark"]` overrides**

Append after layout section:

```css
[data-theme='dark'] {
  --bg-color: #121211;
  --text-main: #b7b7b5;
  --text-bright: #f5f5f4;
  --accent: #fcaa2d;
  --card-bg: rgba(30, 30, 29, 0.55);
  --card-border: rgba(245, 245, 244, 0.1);
  --glass-bg: rgba(18, 18, 17, 0.85);
}

[data-theme='dark'] body {
  background-image: radial-gradient(circle at 50% 0%, #1f1f1d 0%, var(--bg-color) 72%);
}

[data-theme='dark'] ::selection {
  background-color: rgba(252, 170, 45, 0.35);
  color: var(--text-bright);
}
```

- [ ] **Step 3: Add shell layout (grid + drawer)**

Append:

```css
.app-shell {
  --sidebar-current-width: var(--sidebar-width);
  display: grid;
  min-height: 100vh;
  grid-template-columns: minmax(0, var(--sidebar-current-width)) minmax(0, 1fr);
  transition: grid-template-columns 0.28s ease;
}

@media (prefers-reduced-motion: reduce) {
  .app-shell,
  #site-sidebar,
  .drawer-backdrop {
    transition: none !important;
  }
}

.drawer-backdrop {
  display: none;
}

@media (max-width: 767px) {
  .app-shell {
    grid-template-columns: 1fr;
    --sidebar-current-width: 0px;
    transition: none;
  }

  #site-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(288px, 86vw);
    max-width: 100%;
    transform: translateX(-100%);
    z-index: 300;
    background: var(--glass-bg);
    backdrop-filter: blur(14px);
    border-right: 1px solid var(--card-border);
    padding: var(--shell-gap);
    overflow-y: auto;
    transition: transform 0.24s ease;
  }

  .app-shell[data-drawer-open='true'] #site-sidebar {
    transform: translateX(0);
  }

  .drawer-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 200;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.22s ease;
  }

  .app-shell[data-drawer-open='true'] .drawer-backdrop {
    opacity: 1;
    pointer-events: auto;
  }
}

@media (min-width: 768px) {
  #site-sidebar {
    position: sticky;
    top: 0;
    align-self: start;
    height: 100vh;
    padding: var(--shell-gap);
    border-right: 1px solid var(--card-border);
    background: var(--glass-bg);
    backdrop-filter: blur(14px);
    overflow-y: auto;
  }

  .app-shell[data-sidebar-collapsed='true'] {
    grid-template-columns: 0 minmax(0, 1fr);
  }

  .app-shell[data-sidebar-collapsed='true'] #site-sidebar {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    overflow: hidden;
    padding-inline: 0;
    border: none;
  }

  #mobile-open-menu {
    display: none;
  }

  /* duplicate hidden rule if needed via class on button */
}

.content-wrap {
  min-width: 0;
}

@media (max-width: 767px) {
  #desktop-sidebar-toggle {
    display: none;
  }

  main {
    padding-top: calc(var(--shell-gap) + 3rem);
  }
}

.top-mobile-bar {
  display: none;
}

@media (max-width: 767px) {
  .top-mobile-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: fixed;
    inset: var(--shell-gap) var(--shell-gap) auto var(--shell-gap);
    z-index: 150;
    pointer-events: none;
  }

  .top-mobile-bar > button {
    pointer-events: auto;
  }
}

.sr-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

(Edit IDs/class names below if implementations rename — keep selectors aligned with Sidebar markup.)

- [ ] **Step 4: Verify**

Run: `npm run build` — expect SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(styles): shell layout grid, drawer, dark tokens"
```

---

### Task 3: Client shell script

**Files:**
- Create: `src/scripts/shell.ts`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Implement `shell.ts`**

Use storage keys:

```typescript
import {
  SIDEBAR_COLLAPSED_STORAGE_KEY,
  StoredThemePreference,
  THEME_STORAGE_KEY,
} from '../lib/site-storage';

const DRAWER_MEDIA = window.matchMedia('(max-width: 767px)');

function qs<T extends HTMLElement = HTMLElement>(sel: string) {
  return document.querySelector<T>(sel);
}

function getStoredTheme(): StoredThemePreference | null {
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  return raw === 'light' || raw === 'dark' ? raw : null;
}

function applyTheme(pref: StoredThemePreference) {
  document.documentElement.setAttribute('data-theme', pref);
  localStorage.setItem(THEME_STORAGE_KEY, pref);
}

function cycleTheme(themeToggle: HTMLElement) {
  const current = document.documentElement.getAttribute('data-theme');
  const next: StoredThemePreference = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  themeToggle.setAttribute(
    'aria-label',
    next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
  );
}

function setCollapsed(shell: HTMLElement, collapsed: boolean) {
  if (DRAWER_MEDIA.matches) return;
  shell.dataset.sidebarCollapsed = collapsed ? 'true' : 'false';
  localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, collapsed ? 'true' : 'false');
  const sidebarToggle = qs<HTMLButtonElement>('#desktop-sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
    sidebarToggle.setAttribute(
      'aria-label',
      collapsed ? 'Show sidebar navigation' : 'Hide sidebar navigation',
    );
  }
}

function toggleCollapsed(shell: HTMLElement) {
  setCollapsed(shell, shell.dataset.sidebarCollapsed !== 'true');
}

function setDrawer(shell: HTMLElement, open: boolean) {
  shell.dataset.drawerOpen = open ? 'true' : 'false';
  const opener = qs<HTMLButtonElement>('#mobile-open-menu');
  if (opener) opener.setAttribute('aria-expanded', open ? 'true' : 'false');
}

export function initializeShell(): void {
  const shell = qs<HTMLElement>('.app-shell');
  if (!shell) return;

  const themeToggle = qs<HTMLElement>('[data-theme-toggle]');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => cycleTheme(themeToggle));
  }

  const sidebarToggle = qs<HTMLButtonElement>('#desktop-sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => toggleCollapsed(shell));
  }

  const mobileOpen = qs<HTMLButtonElement>('#mobile-open-menu');
  const backdrop = qs<HTMLElement>('.drawer-backdrop');
  if (mobileOpen) {
    mobileOpen.addEventListener('click', () => setDrawer(shell, shell.dataset.drawerOpen !== 'true'));
  }
  if (backdrop) {
    backdrop.addEventListener('click', () => setDrawer(shell, false));
  }

  DRAWER_MEDIA.addEventListener('change', (event) => {
    if ((event as MediaQueryListEvent).matches) {
      shell.removeAttribute('data-sidebar-collapsed');
      setDrawer(shell, false);
    } else if (localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true') {
      setCollapsed(shell, true);
    } else {
      setCollapsed(shell, false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DRAWER_MEDIA.matches && shell.dataset.drawerOpen === 'true') {
      setDrawer(shell, false);
    }
  });
}

initializeShell();
```

- [ ] **Step 2: Import script from `Sidebar.astro`**

Add trailing empty line if needed:

```astro
<script type="module" src={new URL('../scripts/shell.ts', import.meta.url)}></script>
```

(Astro resolves module path; alternatively use `<script>` with `import '../scripts/shell.ts';` inside component.)

- [ ] **Step 3: Commit**

```bash
git add src/scripts/shell.ts src/components/Sidebar.astro src/layouts/BaseLayout.astro
git commit -m "feat(shell): hydrate toggles drawer and persistence"
```
(Combine with Sidebar when Task 4 lands if easier.)

---

### Task 4: Sidebar + layout + About pages + remove top nav

**Files:**
- Replace: rename/replace `src/components/Navigation.astro` with `Sidebar.astro` OR keep file name Navigation but content becomes sidebar — plan uses **`src/components/Sidebar.astro`** and delete obsolete top nav markup.
- Modify: `src/layouts/BaseLayout.astro`
- Create: `src/components/AboutPage.astro`
- Modify: `src/pages/index.astro`, `src/pages/about.astro`
- Delete: unused `Navigation.astro` imports

**Sidebar.astro markup expectations:**

- Imports `site` from `../data/site`; nav items unchanged from Navigation.
- Top: branded link `/` initials or name.
- List nav same routes.
- Social links block from `Navigation` parity.
- Buttons: `#desktop-sidebar-toggle` (visible desktop), `[data-theme-toggle]` with label text "Theme", `#mobile-open-menu` with menu icon/text (visible mobile).
- `<script>` referencing `shell.ts`.

**AboutPage prop:** `showPageHeading` boolean optional — when true renders current `About Me` header + divider; when false skips (home may want different hero — spec asks same layout: use heading on both unless user wants home without duplicate — spec: `/` About section same layout → include heading both places).

Actually spec: index should match about layout → include `<h1>About Me</h1>` divider on `/` too.

Implement `AboutPage.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { getCollection, render } from 'astro:content';

interface Props {
  title: string;
}

const { title } = Astro.props;

const aboutEntries = await getCollection('about');
const entry = aboutEntries[0];

let Body = null;
if (entry) {
  ({ Content: Body } = await render(entry));
}
---

<BaseLayout {title}>
  <section class="page-header">
    <div class="header-content fade-in-up">
      <h1>About Me</h1>
      <div class="divider"></div>
    </div>
  </section>

  <section class="content-section">
    <article class="prose glass-card fade-in-up" style="animation-delay: 0.1s;">
      {Body ? <Body /> : <p>About content coming soon...</p>}
    </article>
  </section>
</BaseLayout>
```

Migrate shared styles block from legacy `about.astro`.

**Pages:**

`index.astro`:

```astro
---
import AboutPage from '../components/AboutPage.astro';
import { site } from '../data/site';
---

<AboutPage title={site.name} />
```

`about.astro`:

```astro
---
import AboutPage from '../components/AboutPage.astro';
---

<AboutPage title="About | Bryce Roberts" />
```

**BaseLayout.astro:**
- **`head` FOUC snippet (duplicate literal key `br-site-theme` to avoid bundling into inline head):**

```html
<script is:inline>
  try {
    var k = 'br-site-theme';
    var saved = localStorage.getItem(k);
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute(
      'data-theme',
      saved === 'light' || saved === 'dark' ? saved : prefersDark ? 'dark' : 'light',
    );
  } catch (_) {}
</script>
```

- **`body`** opens `.app-shell` with `data-sidebar-collapsed="false"` and `data-drawer-open="false"` defaults; SSR cannot know persisted collapse yet.
- Immediately after `.app-shell` opens, optional **tiny inline snippet** reads `localStorage` `br-site-sidebar-collapsed` when `matchMedia('(min-width:768px)')` matches and sets `data-sidebar-collapsed="true"` on `.app-shell` to reduce FOUC (mirror key string literals with `SITE_STORAGE_SIDEBAR` comment for manual sync).

- [ ] **Step layout structure**

Replace body content with Sidebar + backdrop + `.content-wrap` having slot.

- [ ] **Step: Remove Navigation import.**

- [ ] **Run `npm run build`**

Expect PASS.

- [ ] **Commit**

```
git add .
git commit -m "feat(ui): sidebar shell and home about page"
```

---

### Self-review (plan vs spec)

| Spec item | Covered by |
|-----------|-------------|
| Sidebar nav + toggles | Task 4 + 3 |
| Home = About | Task 4 |
| Light tokens untouched block | Task 2 (append-only + new rules) |
| Dark additive | Task 2 |
| Collapse centers main desktop | CSS grid collapse Task 2 + shell Task 3 |
| Mobile drawer overlay | Task 2 |
| Persist theme + collapsed | Tasks 3 + head script |
| A11y buttons / labels | Sidebar markup Task 4 (implementer verifies attributes) |

No placeholder steps remain.
