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

function setupThemePicker() {
  const toggle = qs<HTMLButtonElement>('[data-theme-toggle]');
  const dropdown = qs<HTMLElement>('.theme-picker-dropdown');
  const shell = qs<HTMLElement>('.app-shell');
  if (!toggle || !dropdown) return;

  /** Place the menu in a fixed layer so the narrow rail overflow cannot clip it. */
  function positionDropdown() {
    const rect = toggle!.getBoundingClientRect();
    const rail = shell?.dataset.sidebarCollapsed === 'true';
    const gap = 8;
    dropdown!.style.position = 'fixed';
    dropdown!.style.zIndex = '500';

    if (rail) {
      dropdown!.style.left = `${Math.round(rect.right + gap)}px`;
      dropdown!.style.bottom = `${Math.round(window.innerHeight - rect.bottom)}px`;
      dropdown!.style.top = 'auto';
      dropdown!.style.right = 'auto';
    } else {
      dropdown!.style.left = `${Math.round(rect.left)}px`;
      dropdown!.style.bottom = `${Math.round(window.innerHeight - rect.top + gap)}px`;
      dropdown!.style.top = 'auto';
      dropdown!.style.right = 'auto';
    }
  }

  function clearDropdownPosition() {
    dropdown!.style.position = '';
    dropdown!.style.left = '';
    dropdown!.style.right = '';
    dropdown!.style.top = '';
    dropdown!.style.bottom = '';
    dropdown!.style.zIndex = '';
  }

  function openPicker() {
    positionDropdown();
    toggle!.setAttribute('aria-expanded', 'true');
  }

  function closePicker() {
    toggle!.setAttribute('aria-expanded', 'false');
    clearDropdownPosition();
  }

  function isOpen() {
    return toggle!.getAttribute('aria-expanded') === 'true';
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen()) {
      closePicker();
    } else {
      openPicker();
    }
  });

  dropdown.addEventListener('click', (e) => {
    const option = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-theme-value]');
    if (!option) return;
    const value = option.dataset.themeValue as StoredThemePreference;
    if (!value) return;
    applyTheme(value);
    dropdown.querySelectorAll('[data-theme-value]').forEach((opt) => {
      opt.setAttribute('aria-selected', opt === option ? 'true' : 'false');
    });
    closePicker();
  });

  document.addEventListener('click', (e) => {
    if (isOpen() && !(e.target as HTMLElement).closest('[data-theme-picker]')) {
      closePicker();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      closePicker();
      toggle.focus();
    }
  });

  window.addEventListener(
    'resize',
    () => {
      if (isOpen()) positionDropdown();
    },
    { passive: true },
  );

  window.addEventListener(
    'scroll',
    () => {
      if (isOpen()) positionDropdown();
    },
    { passive: true, capture: true },
  );

  const current = readResolvedThemeAttr();
  dropdown.querySelectorAll('[data-theme-value]').forEach((opt) => {
    const btn = opt as HTMLButtonElement;
    btn.setAttribute('aria-selected', btn.dataset.themeValue === current ? 'true' : 'false');
  });
}

/** Re-sync if head script ran before storage became available (rare edge). */
function reconcileThemeFromStorage() {
  const storedPref = getStoredThemePreference();
  if (!storedPref) return;
  document.documentElement.setAttribute('data-theme', storedPref);
}

function ensureCopyToast(): HTMLElement {
  let toast = qs<HTMLElement>('#copy-toast');
  if (toast) return toast;

  toast = document.createElement('div');
  toast.id = 'copy-toast';
  toast.className = 'copy-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.hidden = true;
  document.body.appendChild(toast);
  return toast;
}

let toastHideTimer: number | null = null;

function showCopyToast(message: string) {
  const toast = ensureCopyToast();
  toast.textContent = message;
  toast.hidden = false;
  toast.dataset.visible = 'true';

  if (toastHideTimer !== null) window.clearTimeout(toastHideTimer);
  toastHideTimer = window.setTimeout(() => {
    toast.dataset.visible = 'false';
    toastHideTimer = window.setTimeout(() => {
      toast.hidden = true;
      toastHideTimer = null;
    }, 220);
  }, 1800);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function setupEmailCopy() {
  document.addEventListener('click', async (e) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-copy-email]');
    if (!trigger) return;

    e.preventDefault();
    const email = trigger.dataset.copyEmail?.trim();
    if (!email) return;

    const ok = await copyText(email);
    showCopyToast(ok ? 'Email address copied' : 'Could not copy email');
  });
}

function wireShell(shell: HTMLElement) {
  reconcileThemeFromStorage();
  setupThemePicker();
  setupEmailCopy();

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
