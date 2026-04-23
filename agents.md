# Project Architecture and Conventions

This document outlines the architectural decisions and conventions used in the Gig Poster Generator application. The goal is to create a modular, maintainable, and scalable system for generating high-quality posters.

## 1. Modular Templating System

The application uses a modular templating approach where each visual theme is self-contained within its own folder. This allows for easy addition, modification, or removal of themes without impacting other parts of the application.

### Structure

Each theme (e.g., `minimal`, `grunge`) has a dedicated directory under `src/themes/` and `src/styles/`:

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

- The `main.js` script dynamically fetches the corresponding `template.html` file and injects its content into the `#theme-root` element on the canvas.
- Simultaneously, it removes any previously loaded theme-specific CSS and injects the correct size-specific stylesheet (e.g., `minimal-post.css`) into the document's `<head>`.
- This ensures that the poster's structure and styling are always appropriate for the selected theme and size.

## 2. Real-time Data Binding

The application implements real-time, two-way data binding between the input fields in the sidebar and the text elements displayed on the poster canvas.

### Mechanism

- Each editable field in the sidebar (e.g., 'Venue Name', 'Date') has a unique `id`.
- Corresponding display elements on the poster canvas (within the `template.html` files) also have unique `id`s (e.g., `venue-display`, `date-display`).
- In `main.js`, event listeners are attached to the input fields. Any change in an input field immediately updates the `textContent` of its corresponding display element on the canvas.
- This binding is re-established (`bindTextInputs()` function) every time a new theme's HTML template is loaded, ensuring that the new template's elements are correctly linked to the input controls.

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
