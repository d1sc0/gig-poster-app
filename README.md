# 🎸 Gig Poster Generator

A high-performance, web-based tool designed for musicians, promoters, and venues to create professional, print-ready gig posters in seconds. This application allows users to edit content in real-time and export high-resolution images optimized for social media and physical print.

## 🎯 Purpose

The Gig Poster Generator eliminates the need for complex graphic design software. It provides a streamlined interface to input event details and instantly see them applied to professionally designed templates. Whether you need an Instagram Story, a square post, or an A4 flyer, this tool handles the layout and resolution automatically.

## ✨ Key Features

- **Real-time Editing:** Two-way data binding ensures that every character you type in the sidebar is instantly reflected on the poster canvas.
- **Modular Theme System:** Easily swap between different visual styles. Each theme is self-contained with its own HTML structure and responsive CSS.
- **Multi-Format Support:** Switch between three industry-standard aspect ratios:
  - **Instagram Post** (4:5)
  - **Instagram Story** (9:16)
  - **A4 Print** (1:1.41)
- **High-Resolution Export:** Uses a specialized snapshot engine (`modern-screenshot`) to generate high-DPI PNG files, ensuring your posters look sharp both on screens and in print.
- **Mobile-First Design:** Fully responsive editor UI that works seamlessly on smartphones and tablets.
- **Status Banners:** Quick toggles for "SOLD OUT", "CANCELLED", or "TONIGHT" overlays, customizable per theme.
- **Interactive Preview:** Integrated zoom functionality to inspect fine details before downloading.

## 🏗️ Project Architecture

The project is built with a focus on modularity and maintainability:

### 1. Modular Templating

Themes are stored in `public/themes/`. This approach allows the application to fetch templates and styles at runtime without them being purged by the build process. Adding a new theme is as simple as creating a new folder with a `template.html` and corresponding CSS files.

### 2. Real-time Data Binding

The core logic in `main.js` manages the synchronization between HTML `<input>` fields and the DOM elements within the artboard. It uses a robust `syncDisplayValues` mechanism to ensure that data persists even when switching themes or sizes.

### 3. Dynamic Scaling Engine

To provide a WYSIWYG experience on all screen sizes, the application uses CSS `transform: scale()`. It calculates a base scale to fit the high-resolution artboard into your browser window, while the "Download" process temporarily resets this scale to capture the image at its native, full-quality dimensions.

### 4. Internationalization (Intl) Support

Date and time formatting is handled via the `Intl` engine, allowing themes to define custom date formats (e.g., "Monday, 24 Oct" vs "10/24/23") via simple JSON configurations.

## 🚀 Quick Start

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/gig-poster-app.git
   cd gig-poster-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` to start creating.

### Building for Production

To create an optimized production build:

```bash
npm run build
```

The output will be in the `dist/` folder, ready to be hosted on any static site provider (Netlify, Vercel, GitHub Pages, etc.).

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Build Tool:** Vite
- **Rendering Library:** modern-screenshot
- **Architecture:** Modular Static Asset Templating

---

_Developed for the music community to make promotion easier._

## 📄 License

This project is licensed under the MIT License.
