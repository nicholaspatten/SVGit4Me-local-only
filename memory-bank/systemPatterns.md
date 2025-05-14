# System Patterns

## System Architecture
- **Frontend**: Next.js/React app with a step-by-step UI flow for image upload, preset selection, conversion, SVG preview, and download.
- **Backend**: Node.js/Next.js API routes for handling image uploads, invoking VTracer or Potrace CLI tools, and returning SVG results.
- **Backends**: VTracer (for color and detailed vectorization) and Potrace (for black & white), with ImageMagick for preprocessing.

## Key Technical Decisions
- Use of CLI tools (VTracer, Potrace) for robust, high-quality SVG conversion.
- Automatic backend selection based on preset (e.g., Potrace for B&W, VTracer for others).
- Preset system for common use cases, with customizable options.
- Compact, modern, and information-dense UI using cards and step labels.
- Error handling and logging at both backend and frontend.
- Pan/zoom and robust tooltip logic are standard for both raster and SVG previews.
- Download/copy controls are always present for SVG output.

## Design Patterns
- **Step-by-step UI**: Each major action (upload, preset, convert, download) is a clear step in the flow.
- **Card-based layout**: Each step is visually separated for clarity.
- **Preset abstraction**: Presets encapsulate recommended settings for different image types.
- **Backend abstraction**: Conversion logic is separated by backend, with a unified API interface.
- **Pan/zoom abstraction**: Both raster and SVG previews use a consistent pan/zoom pattern with clamping and reset.
- **Tooltip abstraction**: Tooltips use timers to prevent flashing and improve usability.
- **Download/copy controls**: Always visible for SVG output, with clear disabled states and tooltips.

## Component Relationships
- `Vectorizer` component manages the entire conversion flow and state.
- API routes handle file upload, backend invocation, and SVG response.
- Preset dropdown and controls interact with the main vectorization logic.
- Pan/zoom and tooltip logic are shared between raster and SVG preview components.
- Download/copy controls are part of the SVG output step. 