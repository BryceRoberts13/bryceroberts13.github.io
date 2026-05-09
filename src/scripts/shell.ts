import {
  SIDEBAR_COLLAPSED_STORAGE_KEY,
  type StoredThemePreference,
  THEME_STORAGE_KEY,
} from '../lib/site-storage';

function qs<T extends HTMLElement = HTMLElement>(sel: string): T | null {
  return document.querySelector(sel);
}

const DRAWER_MEDIA = window.matchMedia('(max-width: 767px)');

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
  themeToggle.setAttribute(
    'aria-label',
    current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
  );
}

function refreshSidebarToggleState(shell: HTMLElement) {
  const sidebarToggle = qs<HTMLButtonElement>('#desktop-sidebar-toggle');
  if (!sidebarToggle) return;

  const collapsed = shell.dataset.sidebarCollapsed === 'true';
  sidebarToggle.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
  sidebarToggle.setAttribute(
    'aria-label',
    collapsed ? 'Show sidebar navigation' : 'Hide sidebar navigation',
  );
  sidebarToggle.textContent = collapsed ? 'Show sidebar' : 'Hide sidebar';
}

function setCollapsed(shell: HTMLElement, collapsed: boolean) {
  if (DRAWER_MEDIA.matches) return;

  shell.dataset.sidebarCollapsed = collapsed ? 'true' : 'false';
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
    shell.dataset.drawerOpen = 'false';
    const opener = qs<HTMLButtonElement>('#mobile-open-menu');
    if (opener) opener.setAttribute('aria-expanded', 'false');
  } else {
    const collapsed = localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true';
    shell.dataset.sidebarCollapsed = collapsed ? 'true' : 'false';
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
