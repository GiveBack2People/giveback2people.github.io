(function () {
  const STORAGE_KEY = 'theme';

  function getSystemPreference() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function getActiveTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return getSystemPreference();
  }

  function applyTheme(theme, save) {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.content = theme;

    if (save) {
      localStorage.setItem(STORAGE_KEY, theme);
    }

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';
      const label = `Switch to ${nextTheme} theme`;
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    }
  }

  // Set initial theme early to prevent FOUC
  const initialTheme = getActiveTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);

  // Setup interactive handlers once DOM is ready
  function initToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    applyTheme(getActiveTheme(), false);

    btn.addEventListener('click', function () {
      const current = getActiveTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
    });

    // Listen for OS scheme changes if user hasn't explicitly chosen
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light', false);
        }
      });
    }

    // Sync across tabs
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        applyTheme(e.newValue, false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggle);
  } else {
    initToggle();
  }
})();
