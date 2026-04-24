# Project Architecture and Conventions

This document outlines the architectural decisions and conventions used in the Gig Poster Generator application. The goal is to create a modular, maintainable, and scalable system for generating high-quality posters.

## 1. Modular Templating System

The application uses a modular templating approach where each visual theme is self-contained within its own folder. This allows for easy addition, modification, or removal of themes without impacting other parts of the application.

### Structure

Each theme (e.g., `minimal`, `grunge`) has a dedicated directory under `public/themes/`. This ensures that templates and CSS can be fetched at runtime in production without being purged by Vite's build process.

```
src/
├── styles/
│   ├── style.css           # Global application styles (layout, UI, etc.)
│   └── [theme-name]/
│       ├── [theme-name]-post.css     # Styles for Instagram Post (4:5)
│       ├── [theme-name]-story.css    # Styles for Instagram Story (9:16)
│       └── [theme-name]-printA4.css  # Styles for A4 Print (1:1.41)
└── themes/
    └── [theme-name]/
        └── template.html   # HTML structure for the poster content
```

### Dynamic Loading

When a user selects a theme or changes the artboard size:

- The `main.js` script fetches the theme registry from `themes.json` and then retrieves the corresponding `template.html` file, injecting its content into the `#theme-root` element.

## 2. Real-time Data Binding

The application implements real-time, two-way data binding between the input fields in the sidebar and the text elements displayed on the poster canvas.

### Mechanism

- In `main.js`, event listeners are attached to the sidebar inputs **once** during initialization via `setupSidebarListeners`.
- When a user types, the listener finds the current element in the active artboard and updates it.
- `syncDisplayValues()` is called every time a theme is loaded to populate the new DOM elements with values currently held in the sidebar.
  - Date and time inputs are automatically formatted using the active theme's configuration before rendering.

### Date and Time Formatting

Themes can customize how the native HTML date and time pickers are presented on the canvas using `dateOptions`/`timeOptions` and optional `dateTemplate`/`timeTemplate` strings in `public/themes/themes.json`.

The templates use a placeholder syntax where `{type}` corresponds to the keys returned by the JavaScript `Intl` engine.

#### Configuration Examples

**1. Minimalist (Long form)**

```json
"dateOptions": { "weekday": "long", "day": "numeric", "month": "short" },
"dateTemplate": "{weekday}, {day} {month}",
"timeOptions": { "hour": "2-digit", "minute": "2-digit", "hour12": false }
// Poster Display: "Monday, 24 Oct" | "19:00"
```

**2. Funky (Compact/US style)**

```json
"dateOptions": { "day": "2-digit", "month": "2-digit", "year": "2-digit" },
"timeOptions": { "hour": "numeric", "minute": "2-digit", "hour12": true }
// Poster Display: "10/24/23" | "7:00 PM"
```

**3. Simple Mono (Narrow)**

```json
"dateOptions": { "day": "numeric", "month": "narrow" }
// Poster Display: "24 O"
```

#### Supported Values

Common fields include `weekday`, `year`, `month`, and `day`. Valid values for these include:

- `"numeric"` (e.g., 2023, 24)
- `"2-digit"` (e.g., 23, 01)
- `"long"` (e.g., October, Monday)
- `"short"` (e.g., Oct, Mon)
- `"narrow"` (e.g., O, M)

### Optional Field Logic

The 'Town', 'Postcode', and 'Web Address' fields are optional. If these inputs are empty (or contain only whitespace), the corresponding display elements on the artboard are automatically set to `display: none`.

## 3. Dynamic Canvas and Aspect Ratios

The application supports three distinct aspect ratios for different output needs.

### Technical Implementation

- The `#poster-artboard` element in `index.html` is assigned a CSS class (e.g., `insta-post`, `insta-story`, `a4-print`) based on the user's selection from the "Select Size" dropdown.
- Global CSS in `src/styles/style.css` defines the `width` and `height` for these classes, setting the target pixel dimensions for high-quality export.
- For preview purposes, the `.poster-canvas` uses `transform: scale()` to fit the high-resolution artboard within the visible `preview-area`. This scaling is dynamically adjusted based on the selected size and the viewport width (for mobile responsiveness).

## 4. Snapshot Engine (`html-to-image`)

The `html-to-image` library is used to convert the HTML content of the `#poster-artboard` into a high-resolution PNG image.

### Export Process

- When the "Download" button is clicked, `savePoster()` is called from `renderer.js`.
- It targets the `#poster-artboard` element.
- Crucially, it overrides the CSS `transform: scale()` property to `none` during the capture process. This ensures that the image is rendered at its full, native pixel dimensions (e.g., 2480x3508 for A4) rather than the scaled-down preview size.
- The output resolution is typically double the defined pixel dimensions on high-DPI screens due to the device pixel ratio, providing a visually appealing, high-quality export.

## 5. Status Banner

The status banner (e.g., "TONIGHT", "CANCELLED") is now an integral part of each theme's `template.html` and its styling is defined within the theme's CSS files.

### Customization

- This allows each theme to implement a unique visual style, position, or animation for the banner, offering maximum creative flexibility.
- The banner's visibility is controlled by a checkbox in the sidebar, and its text content is editable via a dedicated input field.
- The `syncBannerState()` function in `main.js` ensures that the banner's visibility and text are correctly applied whenever a new theme is loaded.

## 6. Zoom Functionality

A zoom slider is available in the preview area to allow users to inspect the poster details.

### Implementation

- The zoom controls are positioned as a fixed overlay within the `preview-area` but _outside_ the `#poster-artboard` to prevent them from being scaled or included in the final export.
- The slider manipulates a CSS custom property (`--user-zoom`) which is multiplied with a base scale (`--base-scale`) to control the `transform: scale()` of the `.poster-canvas`.
- The zoom controls are hidden when the editor sidebar is open and reappear when the sidebar is closed, ensuring a clean editing experience.

## 7. Mobile-First Design

The application prioritizes mobile usability with a responsive layout.

### Key Aspects

- On smaller screens, the editor sidebar is initially hidden and can be toggled into view, overlaying the poster preview.
- The header provides quick access to the "Toggle Editor" and "Download" actions.
- The base scaling of the poster preview is adjusted for mobile to ensure it fits within the viewport.
- The form controls within the sidebar are constrained to the viewport using `box-sizing: border-box` and `overflow-y: auto` to ensure they are fully scrollable.
