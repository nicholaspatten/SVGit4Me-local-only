<!-- Centered logo and title vertically aligned -->
<p align="center">
  <img src="public/logo.svg" alt="SVG It 4 Me Logo" width="160" />
</p>
<p align="center">
  <span style="font-size:2.5rem; font-weight:700;">SVGit4Me</span>
</p>

**SVGit4Me** is a modern, user-friendly web app for converting raster images (PNG, JPG, etc.) to high-quality SVGs. It supports both color and black & white vectorization, with a professional, step-by-step UI and robust backend powered by VTracer and Potrace.

## Features
- Upload raster images and convert to SVG instantly
- Preset system for common use cases (Photo, Logo, Lineart, Black & White, etc.)
- Customizable vectorization options
- Step-by-step, compact UI for clarity and ease of use
- Download and copy SVG output
- Pan and zoom (with Ctrl/Cmd + scroll) for both raster and SVG previews
- Tooltips for guidance and accessibility
- Fully responsive and accessible design

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm
- Rust & Cargo (for VTracer)
- Potrace and ImageMagick installed on your system (for B&W conversion)

### Installation

```bash
# Clone the repository
https://github.com/nicholaspatten/SVGit4Me.git
cd SVGit4Me

# Install dependencies
npm install
# or
pnpm install
```

### Running the App

```bash
npm run dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `app/` - Next.js app directory
- `components/` - UI and logic components
- `memory-bank/` - Project documentation and context
- `public/` - Static assets (including logo)

## License
MIT

---

Made with ❤️ by [@nicholaspatten](https://github.com/nicholaspatten) 