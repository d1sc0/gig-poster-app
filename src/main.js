import { savePoster } from './utils/renderer';

const artboard = document.getElementById('poster-artboard');
const themeRoot = document.getElementById('theme-root');
const exportBtn = document.getElementById('export-btn');
const exportBtnMobile = document.getElementById('export-btn-mobile');

let themesConfig = [];
let currentTheme = 'minimal';
let currentSize = 'post'; // internal mapped size suffix

/**
 * Asynchronously loads the theme configuration and populates the UI dropdown.
 */
const initThemes = async () => {
  try {
    const response = await fetch('/src/themes/themes.json');
    themesConfig = await response.json();

    const themeSelect = document.getElementById('theme-select');
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
 * Binds sidebar input fields to their corresponding display elements on the artboard.
 * This needs to be re-called whenever the theme template (HTML) is replaced.
 *
 * We use a mapping array to maintain the relationship between the ID of the
 * input field in the sidebar and the ID of the text element on the poster.
 */
const bindTextInputs = () => {
  const fieldMappings = [
    { input: 'venue-input', display: 'venue-display' },
    { input: 'town-input', display: 'town-display' },
    { input: 'date-input', display: 'date-display' },
    { input: 'start-time-input', display: 'start-time-display' },
    { input: 'end-time-input', display: 'end-time-display' },
    { input: 'postcode-input', display: 'postcode-display' },
    { input: 'web-address-input', display: 'web-address-display' },
  ];

  fieldMappings.forEach(({ input, display }) => {
    const inputEl = document.getElementById(input);
    const displayEl = document.getElementById(display);
    if (inputEl && displayEl) {
      // Set initial value from input
      if (inputEl.value) displayEl.textContent = inputEl.value;

      inputEl.addEventListener('input', e => {
        displayEl.textContent = e.target.value;
      });
    }
  });
};

/**
 * Initializes the zoom slider listener.
 * It updates the '--user-zoom' CSS variable on the artboard, allowing
 * users to inspect details without affecting the internal pixel math of the export.
 */
const setupZoom = () => {
  const zoomSlider = document.getElementById('zoom-slider');
  const zoomValue = document.getElementById('zoom-value');

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
  const bannerToggle = document.getElementById('banner-toggle');
  const bannerTextInput = document.getElementById('banner-text-input');
  const bannerElement = document.getElementById('status-banner');

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
    const response = await fetch(`/src/themes/${folder}/template.html`);
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
    themeStyle.href = `/src/themes/${folder}/${themeId}-${currentSize}.css`;

    // 3. Update artboard class for global size styles
    artboard.className = `poster-canvas ${sizeValue}`;
    setBaseScale(sizeValue);

    // 4. Re-bind inputs to new DOM elements
    bindTextInputs();
    syncBannerState();
  } catch (err) {
    console.error('Failed to load theme:', err);
  }
};

// --- UI Event Listeners ---

const sizeSelect = document.getElementById('artboard-size-select');
const themeSelect = document.getElementById('theme-select');

// Size Switcher
sizeSelect?.addEventListener('change', e => {
  loadThemeAndSize(currentTheme, e.target.value);
});

// Theme Switcher
themeSelect?.addEventListener('change', e => {
  loadThemeAndSize(e.target.value, sizeSelect.value);
});

// Banner visibility toggle
document.getElementById('banner-toggle')?.addEventListener('change', e => {
  document.getElementById('status-banner').style.display = e.target.checked
    ? 'flex'
    : 'none';
});

// Banner text update
document.getElementById('banner-text-input')?.addEventListener('input', e => {
  document.getElementById('status-banner').textContent = e.target.value;
});

// Mobile UI: Toggle between Editor (Sidebar) and Preview (Canvas)
document
  .getElementById('toggle-controls')
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
initThemes().then(() => {
  loadThemeAndSize(currentTheme, sizeSelect.value);
});
