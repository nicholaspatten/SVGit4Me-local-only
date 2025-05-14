# Active Context

## Current Work Focus
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

## Next Steps
- Further UI/UX refinements for compactness and clarity.
- Add more robust error messages and edge case handling.
- Consider extensibility for new presets or backend engines.
- Update documentation and Memory Bank as changes are made.

## Active Decisions
- Potrace is used for Black & White preset; VTracer for all others.
- Color precision is clamped to [1,8] for VTracer.
- Step-by-step card layout is the standard for the UI.
- Radix UI Select and Tooltip are the standard for dropdowns and tooltips.
- Always ensure SVG Output has a viewBox for zooming support.
- Pan/zoom and tooltip logic are standard for both raster and SVG previews.
- Download/copy controls are always present for SVG output. 