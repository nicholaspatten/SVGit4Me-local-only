# <img src="public/logo-transparent-svg.svg" alt="SVG It 4 Me Logo" width="120" style="vertical-align:middle;" />

**SVGit4Me** is a **privacy-first, local-only** web application for converting raster images (PNG, JPG, etc.) to high-quality SVGs. Built with security and privacy as core principles, it runs entirely in a Docker container on your local machine, ensuring your images never leave your computer and are never uploaded to any external servers.

## 🔒 Privacy & Security First

- **🏠 100% Local Processing**: All image conversion happens on your machine - no files ever leave your computer
- **🚫 Zero Cloud Uploads**: Images are processed locally in Docker containers, never sent to external servers
- **🐳 Docker Containerized**: Isolated, secure environment with all dependencies included
- **📱 Offline Capable**: Works completely offline after initial Docker setup
- **🔒 No Data Collection**: Zero telemetry, analytics, or user data collection
- **⚡ Browser-Based Processing**: Runs in your browser but processes locally for maximum privacy
- **🗑️ Automatic Cleanup**: Temporary files are automatically deleted after processing

## ✨ Features

- **🖼️ High-Quality Conversion**: Upload raster images and convert to crisp, scalable SVGs instantly
- **🎯 Smart Presets**: Optimized settings for Photos, Logos, Line Art, Black & White, and more
- **⚙️ Customizable Options**: Fine-tune vectorization parameters for perfect results
- **🎨 Dual Processing Engines**: VTracer for color images, Potrace for black & white
- **📏 Exact Dimensions**: SVG output matches original image dimensions precisely
- **🔍 Pan & Zoom**: Interactive preview with Ctrl/Cmd + scroll for both raster and SVG
- **💾 Easy Export**: Download SVG files or copy paths to clipboard
- **🎛️ Step-by-Step UI**: Clear, intuitive interface with helpful tooltips
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **♿ Accessibility**: Full keyboard navigation and screen reader support

## Getting Started

### Option 1: Docker (Recommended - Privacy & Security)

Docker is the recommended way to run SVGit4Me as it provides complete privacy with all processing happening in an isolated container on your local machine. No internet connection required after initial setup!

#### Prerequisites
- Docker Desktop installed on your system
- Git (to clone the repository)

#### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/nicholaspatten/SVGit4Me.git
cd SVGit4Me

# Build and run with Docker
docker build -t svgit4me .
docker run -d --name svgit4me -p 3000:3000 svgit4me

# Or use the provided deployment script
./deploy.sh
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Local Development Setup

For development or if you prefer to run without Docker.

#### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm
- Rust & Cargo (for VTracer)
- Potrace and ImageMagick installed on your system

#### Installation

```bash
# Clone the repository
git clone https://github.com/nicholaspatten/SVGit4Me.git
cd SVGit4Me

# Install dependencies
npm install --legacy-peer-deps
# or
pnpm install --legacy-peer-deps
```

#### Running the App

```bash
npm run dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `app/` - Next.js app directory with API routes
- `components/` - UI and logic components
- `memory-bank/` - Project documentation and context
- `public/` - Static assets (including logo)
- `Dockerfile` - Container configuration for local deployment
- `docker-compose.yml` - Docker Compose configuration
- `deploy.sh` - Automated deployment script
- `HOW-IT-WORKS.md` - Comprehensive technical documentation

## 📚 Documentation

- **[HOW-IT-WORKS.md](./HOW-IT-WORKS.md)** - Complete technical deep dive, architecture details, privacy explanations, and development guide
- **README.md** (this file) - Quick start and overview
- **memory-bank/** - Project context and decision documentation

## 🔧 Technical Details

### Vectorization Engines
- **VTracer**: High-quality color vectorization with superior color accuracy (MIT License)
- **Potrace**: Black & white vectorization with ImageMagick preprocessing (GPL-2.0 License)
- **Image Preprocessing**: Automatic trim and optimization for perfect dimension matching
- **Quality Assurance**: Intelligent post-processing removes artifacts while preserving content

### Security Features
- **Container Isolation**: All processing happens in isolated Docker containers
- **No External Dependencies**: Vectorization tools bundled in container
- **Local File Processing**: Temporary files cleaned up automatically
- **No Network Access**: Processing doesn't require internet connection

## 🚀 Deployment Options

### Local Docker Deployment (Recommended)
- **Privacy**: 100% local processing
- **Security**: Isolated container environment
- **Ease**: One-command setup with `./deploy.sh`

### Cloud Deployment (Optional)
For public deployment, the application can be deployed to platforms like Railway, Render, or DigitalOcean using the provided Docker configuration. However, this means images will be processed on external servers.

**Note**: Cloud deployment is provided for convenience but goes against the privacy-first design principle of this application.

## License

**SVGit4Me**: MIT License

**Third-Party Tools**: 
- VTracer (MIT License) - Compatible
- Potrace (GPL-2.0 License) - Used as external binary
- ImageMagick (Apache-2.0 License) - Used as external binary

All third-party tools are called as external processes, maintaining license compatibility.

---

Made with ❤️ by [@nicholaspatten](https://github.com/nicholaspatten)

**🔒 Remember**: For maximum privacy and security, always run SVGit4Me locally using Docker! 