# <img src="public/logo.svg" alt="SVG It 4 Me Logo" width="120" style="vertical-align:middle;" />

**SVGit4Me** is a **local-only** web application for converting raster images (PNG, JPG, etc.) to high-quality SVGs. Built with privacy and security in mind, it runs entirely in a Docker container on your local machine, ensuring your images never leave your computer.

## 🔒 Privacy & Security First

- **100% Local Processing**: All image conversion happens on your machine
- **No Cloud Uploads**: Images are never sent to external servers
- **Docker Containerized**: Isolated environment for secure processing
- **Offline Capable**: Works without internet connection after initial setup
- **No Data Collection**: Zero telemetry or user data collection

## Features
- Upload raster images and convert to SVG instantly
- Preset system for common use cases (Photo, Logo, Lineart, Black & White, etc.)
- Customizable vectorization options
- Step-by-step, compact UI for clarity and ease of use
- Download and copy SVG output
- Pan and zoom (with Ctrl/Cmd + scroll) for both raster and SVG previews
- Tooltips for guidance and accessibility
- Fully responsive and accessible design

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

### Option 1: Docker (Recommended - Easiest Setup)

The easiest way to run SVGit4Me is using Docker, which provides a complete isolated environment with all dependencies pre-installed.

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

## 🔧 Technical Details

### Vectorization Engines
- **VTracer**: High-quality color vectorization
- **Potrace**: Black & white vectorization with ImageMagick preprocessing
- **Fallback System**: Automatic fallback to Potrace if VTracer fails

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
MIT

---

Made with ❤️ by [@nicholaspatten](https://github.com/nicholaspatten)

**🔒 Remember**: For maximum privacy and security, always run SVGit4Me locally using Docker! 