# Active Context

## Current Work Focus
- **VTracer Installation Fixed**: Successfully resolved VTracer binary installation and permissions issues
- **Color Vectorization**: Now using VTracer-only approach for color vectorization, no fallback to Potrace
- **Quality Assurance**: Color images now maintain their color information during vectorization
- Maintaining a robust, user-friendly step-by-step UI for SVG conversion.
- Ensuring backend reliability and correct integration of VTracer and Potrace.
- Keeping frontend and backend settings/presets in sync.
- Improving accessibility and user guidance with tooltips and compact design.
- Ensuring pan/zoom features work consistently for both raster and SVG previews.
- Implementing robust tooltip logic to prevent flashing and improve UX.
- Providing clear download/copy guidance for SVG output.

## Recent Changes
- UI reorganized into clear, compact step-by-step cards (Upload, Preset, Convert, Output, Download).
- Preset system implemented with custom Radix UI Select dropdown (black/white, fully styled).
- Tooltips added to Step 4 Download and Copy buttons using Radix UI Tooltip.
- TooltipProvider added at the app root to support tooltips everywhere.
- Step row cards (Step 1-4) are now borderless and shadowless for a cleaner look.
- Top padding reduced for a more compact layout.
- Potrace integrated for Black & White preset, with ImageMagick preprocessing.
- Error handling improved for color precision and backend selection.
- Logo and layout adjustments for a more professional look.
- SVG Output zoom (Ctrl/Cmd + scroll) is now robust: the app ensures a viewBox is always set on SVG load, enabling zoom for all SVGs regardless of original markup.
- Pan/zoom implemented for both raster and SVG previews, with clamping and reset controls.
- Tooltip logic improved to use timers for show/hide, preventing flashing and improving usability.
- Download and copy buttons for SVG output are always visible, with clear disabled states and tooltips.
- Added vercel.json to the project root. This file configures a redirect: requests to svgit4me.com are permanently redirected to www.svgit4me.com using Vercel's configuration. This ensures canonical domain usage and is now tracked as part of project configuration.
- **Docker containerization completed**: Created production-ready Docker setup with multi-stage build, health checks, and deployment scripts.
- **Docker files added**: Dockerfile, .dockerignore, docker-compose.yml, deploy.sh, and health endpoint.
- **Next.js configuration updated**: Added standalone output for optimized Docker containers.
- **Local testing successful**: Container builds and runs correctly with 42ms startup time.
- **Vercel deployment issue identified**: Serverless functions don't support vtracer/potrace binaries, requiring Docker-based deployment for quality.
- **Deployment strategy decided**: Use Docker-based platforms (Railway, Render, DigitalOcean) to maintain vectorization quality.
- **DEPLOYMENT.md created**: Comprehensive guide for deploying to Docker-supporting platforms while maintaining quality.

## Next Steps
- Further UI/UX refinements for compactness and clarity.
- Add more robust error messages and edge case handling.
- Consider extensibility for new presets or backend engines.
- Update documentation and Memory Bank as changes are made.
- **Deploy Docker container to Railway/Render** (recommended platforms for quality).
- **Set up CI/CD pipeline** for automated Docker builds and deployments.
- **Configure environment variables** for production deployment.
- **Test vectorization quality** on deployed platform to ensure consistency.
- **Verify color vectorization** works correctly on deployed platform with VTracer-only approach.

## Active Decisions
- Potrace is used for Black & White preset; VTracer for all others.
- Color precision is clamped to [1,8] for VTracer.
- Step-by-step card layout is the standard for the UI.
- Radix UI Select and Tooltip are the standard for dropdowns and tooltips.
- Always ensure SVG Output has a viewBox for zooming support.
- Pan/zoom and tooltip logic are standard for both raster and SVG previews.
- Download/copy controls are always present for SVG output.
- **Docker is the standard deployment method** with multi-stage builds for optimization.
- **Health checks are implemented** for container monitoring and reliability.
- **Standalone Next.js output** is used for Docker containers to reduce image size.
- **Quality over convenience**: Use Docker-based platforms (Railway, Render) instead of Vercel to maintain vectorization quality.
- **Avoid WebAssembly alternatives**: Stick with native vtracer/potrace binaries for superior SVG conversion results.
- **VTracer-only for color**: Color vectorization uses VTracer exclusively, no fallback to Potrace to maintain color quality. 