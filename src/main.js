import { savePoster } from './utils/renderer';

const artboard = document.querySelector('[data-ui="poster-artboard"]');
const themeRoot = document.querySelector('[data-ui="theme-root"]');
const exportBtn = document.querySelector('[data-action="export"]');
const exportBtnMobile = document.querySelector('[data-action="export-mobile"]');

let themesConfig = [];
let currentTheme = 'minimal';
let currentSize = 'post'; // internal mapped size suffix

/**
 * IDs of elements that should be hidden if their corresponding input is empty.
 */
const optionalDisplayIds = ['town', 'postcode', 'web-address'];

/**
 * Asynchronously loads the theme configuration and populates the UI dropdown.
 */
const initThemes = async () => {
  try {
    const response = await fetch('/themes/themes.json');
    themesConfig = await response.json();

    const themeSelect = document.querySelector('[data-config="theme"]');
    if (themeSelect) {
      themeSelect.innerHTML = ''; // Clear fallback options
      themesConfig.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme.id;
        option.textContent = theme.name;
        themeSelect.appendChild(option);
      });

      // Default to the first theme in the config
      if (themesConfig.length > 0) {
        currentTheme = themesConfig[0].id;
        themeSelect.value = currentTheme;
      }
    }
  } catch (err) {
    console.error('Failed to load themes configuration:', err);
  }
};

/**
 * Maps sidebar inputs to display IDs and sets up listeners once.
 */
const setupSidebarListeners = () => {
  const inputs = document.querySelectorAll('aside.sidebar [data-field]');

  inputs.forEach(input => {
    input?.addEventListener('input', e => {
      const fieldName = input.dataset.field;

      // Special handling for the banner which doesn't follow the "-display" suffix convention
      if (fieldName === 'banner-text' || fieldName === 'banner-toggle') {
        syncBannerState();
        return;
      }

      const display = themeRoot.querySelector(`[data-display="${fieldName}"]`);
      if (display) {
        display.textContent = e.target.value;
        if (optionalDisplayIds.includes(fieldName)) {
          display.style.display = e.target.value.trim() ? '' : 'none';
        }
      }
    });
  });
};

/**
 * Updates display elements with current input values (called after theme load).
 */
const syncDisplayValues = () => {
  const inputs = document.querySelectorAll('aside.sidebar [data-field]');

  inputs.forEach(input => {
    const fieldName = input.dataset.field;
    const display = themeRoot.querySelector(`[data-display="${fieldName}"]`);

    if (input && display) {
      display.textContent = input.value;
      if (optionalDisplayIds.includes(fieldName)) {
        display.style.display = input.value.trim() ? '' : 'none';
      }
    }
  });
};

/**
 * Initializes the zoom slider listener.
 * It updates the '--user-zoom' CSS variable on the artboard, allowing
 * users to inspect details without affecting the internal pixel math of the export.
 */
const setupZoom = () => {
  const zoomSlider = document.querySelector('[data-ui="zoom-slider"]');
  const zoomValue = document.querySelector('[data-ui="zoom-value"]');

  if (zoomSlider && artboard) {
    zoomSlider.addEventListener('input', e => {
      const val = e.target.value;
      artboard.style.setProperty('--user-zoom', val);
      if (zoomValue) zoomValue.textContent = `${Math.round(val * 100)}%`;
    });
  }
};

/**
 * Calculates and sets a responsive '--base-scale' for the artboard.
 * Because artboards are defined at high physical resolutions (e.g. 3508px),
 * we must scale them down to fit the browser window.
 * The final visual scale is: base-scale * user-zoom.
 */
const setBaseScale = sizeValue => {
  const scales = {
    'insta-post': window.innerWidth < 1024 ? 0.2 : 0.4,
    'insta-story': window.innerWidth < 1024 ? 0.15 : 0.3,
    'a4-print': window.innerWidth < 1024 ? 0.08 : 0.15,
  };
  artboard.style.setProperty('--base-scale', scales[sizeValue] || 0.2);
};

/**
 * Updates the status banner (TONIGHT/CANCELLED) to match the sidebar state.
 * This ensures that when we switch themes (which reloads the HTML),
 * the banner correctly persists its visibility and text content.
 */
const syncBannerState = () => {
  const bannerToggle = document.querySelector('[data-field="banner-toggle"]');
  const bannerTextInput = document.querySelector('[data-field="banner-text"]');
  const bannerElement = themeRoot.querySelector('[data-display="banner"]');

  if (bannerElement) {
    if (bannerToggle) {
      bannerElement.style.display = bannerToggle.checked ? 'flex' : 'none';
    }
    if (bannerTextInput && bannerTextInput.value) {
      bannerElement.textContent = bannerTextInput.value;
    }
  }
};

/**
 * Core engine for theme/size switching.
 * 1. Fetches the theme's HTML template via Ajax.
 * 2. Injects the HTML into the artboard.
 * 3. Switches the size-specific stylesheet (e.g. minimal-story.css).
 * 4. Re-binds data listeners to the fresh DOM elements.
 */
const loadThemeAndSize = async (themeId, sizeValue) => {
  // Find theme metadata from the config
  const themeConfig = themesConfig.find(t => t.id === themeId);
  const folder = themeConfig?.folder || themeId;

  const sizeMap = {
    'insta-post': 'post',
    'insta-story': 'story',
    'a4-print': 'printA4',
  };

  currentSize = sizeMap[sizeValue];
  currentTheme = themeId;

  try {
    // 1. Load HTML Template
    const response = await fetch(`/themes/${folder}/template.html`);
    const html = await response.text();
    themeRoot.innerHTML = html;

    // 2. Manage size-specific stylesheet
    let themeStyle = document.getElementById('dynamic-theme-style');
    if (!themeStyle) {
      themeStyle = document.createElement('link');
      themeStyle.id = 'dynamic-theme-style';
      themeStyle.rel = 'stylesheet';
      document.head.appendChild(themeStyle);
    }
    // Added a cache-buster (?t=) to ensure images and styles refresh immediately
    themeStyle.href = `/themes/${folder}/${themeId}-${currentSize}.css?t=${Date.now()}`;

    // 3. Update artboard class for global size styles
    artboard.className = `poster-canvas ${sizeValue}`;
    setBaseScale(sizeValue);

    // 4. Sync current input values to the new DOM template
    syncDisplayValues();
    syncBannerState();
  } catch (err) {
    console.error('Failed to load theme:', err);
  }
};

// --- UI Event Listeners ---

const sizeSelect = document.querySelector('[data-config="size"]');
const themeSelect = document.querySelector('[data-config="theme"]');

// Size Switcher
sizeSelect?.addEventListener('change', e => {
  loadThemeAndSize(currentTheme, e.target.value);
});

// Theme Switcher
themeSelect?.addEventListener('change', e => {
  loadThemeAndSize(e.target.value, sizeSelect.value);
});

// Mobile UI: Toggle between Editor (Sidebar) and Preview (Canvas)
document
  .querySelector('[data-action="toggle-editor"]')
  ?.addEventListener('click', function () {
    const isHidden = document.body.classList.toggle('controls-hidden');
    this.textContent = isHidden ? 'Toggle Editor' : 'Toggle Preview';
  });

// Export Triggers
const triggerExport = () => savePoster('poster-artboard');
exportBtn?.addEventListener('click', triggerExport);
exportBtnMobile?.addEventListener('click', triggerExport);

// Initial Load
setupZoom();
setupSidebarListeners();
initThemes().then(() => {
  loadThemeAndSize(currentTheme, sizeSelect.value);
});
