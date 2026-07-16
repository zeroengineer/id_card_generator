# Premium Employee ID Card Generator

A client-side web application built with React, Vite, and Vanilla CSS to generate, preview, customize, and export high-fidelity Employee ID Cards. 

The application is built completely serverless (all rendering and generation happens in the browser), ensuring high-speed processing, absolute privacy, and offline compatibility.

---

## Key Features

- **Horizontal Preview Area**: Displays both Front and Back sides of the card side-by-side with real-time canvas zoom controls (from 50% to 120%).
- **Interactive Customizer Form**:
  - Employee fields: Full Name, Role/Designation, ID Number, Blood Group, DOB, Phone, and Email.
  - Advanced corporate details: Edit Company Name, Corporate Identification Number (CIN), Registered Office Address, Website, Notice description, and Taglines.
- **In-Browser Image Cropping & Positioning**: 
  - Allows uploading custom employee photos and corporate logos.
  - Precise CSS-based cropping sliders for **Zoom/Scale**, **Move Horizontal (X)**, and **Move Vertical (Y)**.
- **Auto-Adjusting Spacing**: Eliminates fixed height gaps. Spacing between the name and role/designation shifts automatically depending on whether the name is single-line (e.g., *Devang C V*) or multi-line (e.g., *Kiran Krishnakumar Subhashini*).
- **Glass-Frame Ready Layout**: Bottom margins on dark footer bands are adjusted (padded with extra safe margin) to prevent physical borders or glass mounts from overlapping text and logos.
- **Robust Client-Side Exports**:
  - **Double-Sided PDF**: Compiles both card sides into a unified two-page print-ready PDF.
  - **SVG Vector File**: Downloads the crisp XML vector markup of individual card faces.
  - **JPEG Images**: Generates ultra-sharp `2x` resolution (1276px x 2022px) raster images optimized for physical cards.
  - **Single PDF Pages**: Exports front or back sides as separate individual PDFs.

---

## Technical Stack

1. **Frontend Core**: React 18 & Vite
2. **Styling System**: Custom Vanilla CSS (configured with tokens, custom properties, glassmorphism, and responsive breakpoints)
3. **Icons**: Lucide React
4. **Rendering Engines**:
   - `html-to-image` (for DOM serialization to raw data)
   - `jsPDF` (for layout orchestration and PDF encoding)

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18.x or v20.x recommended) and npm installed.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/zeroengineer/id_card_generator.git
   cd id_card_generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000/`.

4. Build for production:
   ```bash
   npm run build
   ```
   The compiled build will be located in the `dist/` directory.

---

## Design and Assets

- Default images and logos are stored in the `uploads/` directory.
- The default typography loads **Space Grotesk** from Google Fonts to ensure perfect legibility on all devices without fallback dot-matrix rendering issues.
