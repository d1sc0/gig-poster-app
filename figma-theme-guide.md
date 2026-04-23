# Figma to Theme Workflow Guide

This guide explains how to design new poster templates in Figma and translate them into the modular theme structure used by the Gig Poster Generator.

## 1. Setup Your Figma Frames

To ensure high-resolution exports, always design at the native pixel dimensions. Create three frames in your Figma file:

- **Instagram Post:** 1080 × 1350 px (4:5)
- **Instagram Story:** 1080 × 1920 px (9:16)
- **A4 Print:** 2480 × 3508 px (1:1.41 / 300 DPI)

## 2. Layer Naming (ID Mapping)

The application uses specific IDs to sync sidebar inputs with the artboard. Name your text layers in Figma to match these IDs. This makes it easier to keep track of what elements need styling:

| Field             | ID in Template                   |
| :---------------- | :------------------------------- |
| **Band Name**     | `#band-name-display` (Hardcoded) |
| **Venue Name**    | `#venue-display`                 |
| **Town**          | `#town-display`                  |
| **Postcode**      | `#postcode-display`              |
| **Website/URL**   | `#web-address-display`           |
| **Date**          | `#date-display`                  |
| **Start Time**    | `#start-time-display`            |
| **End Time**      | `#end-time-display`              |
| **Update Banner** | `#status-banner`                 |

## 3. Typography & Assets

### Fonts

- **Google Fonts:** If you use a Google Font, note the name and weight to include the `@import` in your CSS.
- **Custom Fonts:** Place `.woff2` files in `src/assets/` and use `@font-face` in the theme CSS.
- **Size Scaling:** Remember that for the **A4 Print** size, font sizes must be significantly larger (e.g., 120pt+) to look correct at 300 DPI.

### Images & Textures

- Export background images or textures from Figma as high-quality JPEGs or WebP.
- Place them in `public/themes/[theme-name]/images/`.
- Reference them in CSS: `background-image: url('./images/texture.jpg');`.

## 4. Translating Layout to CSS

- **Auto Layout:** Figma’s Auto Layout is equivalent to CSS **Flexbox**.
  - `Gap` in Figma → `gap` in CSS.
  - `Padding` in Figma → `padding` in CSS.
  - `Distribute` → `justify-content`.
- **Grid:** For structured layouts (like the Minimal theme), use `display: grid` in your CSS.
- **Rotation:** If you tilt elements (common in the Grunge theme), use `transform: rotate(-5deg);`.

## 5. Creative Status Banners

The `#status-banner` is an absolute-positioned element. You can get creative with its placement:

- **Sticker Look:** Use `transform: rotate()` and a heavy `box-shadow`.
- **Corner Ribbon:** Use `top: 0; right: 0;` with a diagonal background gradient.
- **Minimal Bar:** Use `top: 0; left: 0; width: 100%;` for a clean notification strip.

## 6. Implementation Checklist

Once your design is ready, follow these steps to add it to the app:

1.  Create `public/themes/[theme-name]/`.
2.  Create `template.html` in that folder.
3.  Create the three size-specific CSS files in that same folder:
    - `[theme-id]-post.css`
    - `[theme-id]-story.css`
    - `[theme-id]-printA4.css`
4.  Add the new theme entry to `public/themes/themes.json`.

---

_Tip: Use Figma's **Dev Mode** to quickly inspect and copy values for border-radius, drop-shadows, and complex gradients._
