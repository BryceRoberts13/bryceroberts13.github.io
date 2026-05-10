import {
  SIDEBAR_COLLAPSED_STORAGE_KEY,
  type StoredThemePreference,
  THEME_STORAGE_KEY,
} from '../lib/site-storage';

function qs<T extends HTMLElement = HTMLElement>(sel: string): T | null {
  return document.querySelector(sel);
}

const DRAWER_MEDIA = window.matchMedia('(max-width: 767px)');

/** Clears pending width→rail transition listener (collapse) and fallback timer */
let railLayoutTransitionCleanup: (() => void) | null = null;

function clearPendingRailLayoutTransition() {
  railLayoutTransitionCleanup?.();
  railLayoutTransitionCleanup = null;
}

function scheduleRailLayoutAfterSidebarWidthTransition(shell: HTMLElement): void {
  const sidebar = qs<HTMLElement>('#site-sidebar');
  if (!sidebar) {
    shell.dataset.railLayout = 'true';
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shell.dataset.railLayout = 'true';
    return;
  }

  clearPendingRailLayoutTransition();

  const onEnd = (event: TransitionEvent) => {
    if (event.target !== sidebar || event.propertyName !== 'width') return;
    shell.dataset.railLayout = 'true';
    cleanup();
  };

  const timeoutId = window.setTimeout(() => {
    if (shell.dataset.sidebarCollapsed === 'true') {
      shell.dataset.railLayout = 'true';
    }
    cleanup();
  }, 650);

  function cleanup() {
    sidebar.removeEventListener('transitionend', onEnd);
    window.clearTimeout(timeoutId);
    railLayoutTransitionCleanup = null;
  }

  sidebar.addEventListener('transitionend', onEnd);
  railLayoutTransitionCleanup = cleanup;
}

function getStoredThemePreference(): StoredThemePreference | null {
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  return raw === 'light' || raw === 'dark' ? raw : null;
}

function readResolvedThemeAttr(): StoredThemePreference {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'dark' ? 'dark' : 'light';
}

function applyTheme(pref: StoredThemePreference) {
  document.documentElement.setAttribute('data-theme', pref);
  localStorage.setItem(THEME_STORAGE_KEY, pref);
}

function refreshThemeToggleLabel() {
  const themeToggle = qs<HTMLButtonElement>('[data-theme-toggle]');
  if (!themeToggle) return;

  const current = readResolvedThemeAttr();
  const label = current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  themeToggle.setAttribute('aria-label', label);
  themeToggle.setAttribute('title', label);
}

function refreshSidebarToggleState(shell: HTMLElement) {
  const sidebarToggle = qs<HTMLButtonElement>('#desktop-sidebar-toggle');
  if (!sidebarToggle) return;

  const collapsed = shell.dataset.sidebarCollapsed === 'true';
  sidebarToggle.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
  const label = collapsed
    ? 'Expand sidebar to full width'
    : 'Collapse sidebar to icon rail';
  sidebarToggle.setAttribute('aria-label', label);
  sidebarToggle.setAttribute('title', label);
}

function setCollapsed(shell: HTMLElement, collapsed: boolean) {
  if (DRAWER_MEDIA.matches) return;

  clearPendingRailLayoutTransition();

  if (!collapsed) {
    shell.dataset.railLayout = 'false';
    shell.dataset.sidebarCollapsed = 'false';
  } else {
    shell.dataset.sidebarCollapsed = 'true';
    shell.dataset.railLayout = 'false';
    scheduleRailLayoutAfterSidebarWidthTransition(shell);
  }

  localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, collapsed ? 'true' : 'false');
  refreshSidebarToggleState(shell);
}

function toggleCollapsed(shell: HTMLElement) {
  setCollapsed(shell, shell.dataset.sidebarCollapsed !== 'true');
}

function setDrawer(shell: HTMLElement, open: boolean) {
  shell.dataset.drawerOpen = open ? 'true' : 'false';
  const opener = qs<HTMLButtonElement>('#mobile-open-menu');
  if (opener) opener.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function syncResponsiveShell(shell: HTMLElement) {
  if (DRAWER_MEDIA.matches) {
    shell.removeAttribute('data-sidebar-collapsed');
    shell.dataset.railLayout = 'false';
    shell.dataset.drawerOpen = 'false';
    const opener = qs<HTMLButtonElement>('#mobile-open-menu');
    if (opener) opener.setAttribute('aria-expanded', 'false');
    clearPendingRailLayoutTransition();
  } else {
    const collapsed = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true';
    shell.dataset.sidebarCollapsed = collapsed ? 'true' : 'false';
    shell.dataset.railLayout = collapsed ? 'true' : 'false';
    refreshSidebarToggleState(shell);
  }
}

function cycleTheme() {
  const current = readResolvedThemeAttr();
  const next: StoredThemePreference = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  refreshThemeToggleLabel();
}

/** Re-sync if head script ran before storage became available (rare edge). */
function reconcileThemeFromStorage() {
  const storedPref = getStoredThemePreference();
  if (!storedPref) return;
  document.documentElement.setAttribute('data-theme', storedPref);
}

function wireShell(shell: HTMLElement) {
  reconcileThemeFromStorage();
  refreshThemeToggleLabel();

  qs<HTMLButtonElement>('[data-theme-toggle]')?.addEventListener('click', () => {
    cycleTheme();
  });

  qs<HTMLButtonElement>('#desktop-sidebar-toggle')?.addEventListener('click', () => {
    toggleCollapsed(shell);
  });

  qs<HTMLButtonElement>('#mobile-open-menu')?.addEventListener('click', () => {
    setDrawer(shell, shell.dataset.drawerOpen !== 'true');
  });

  qs<HTMLElement>('.drawer-backdrop')?.addEventListener('click', () => {
    setDrawer(shell, false);
  });

  DRAWER_MEDIA.addEventListener('change', () => syncResponsiveShell(shell));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && DRAWER_MEDIA.matches && shell.dataset.drawerOpen === 'true') {
      setDrawer(shell, false);
    }
  });
}

function initializeShell(): void {
  const shell = qs<HTMLElement>('.app-shell');
  if (!shell) return;

  syncResponsiveShell(shell);
  wireShell(shell);
}

function run() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeShell, { once: true });
  } else {
    initializeShell();
  }
}

run();
