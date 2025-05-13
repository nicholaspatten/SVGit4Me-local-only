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

## Design Patterns
- **Step-by-step UI**: Each major action (upload, preset, convert, download) is a clear step in the flow.
- **Card-based layout**: Each step is visually separated for clarity.
- **Preset abstraction**: Presets encapsulate recommended settings for different image types.
- **Backend abstraction**: Conversion logic is separated by backend, with a unified API interface.

## Component Relationships
- `Vectorizer` component manages the entire conversion flow and state.
- API routes handle file upload, backend invocation, and SVG response.
- Preset dropdown and controls interact with the main vectorization logic. 