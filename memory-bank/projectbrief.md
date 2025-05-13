# Project Brief: SVG Conversion Web App

## Overview
This project is a web application for converting raster images (PNG, JPG, etc.) to SVG vector graphics. It leverages VTracer and Potrace as backend engines to provide high-quality, robust SVG conversion for a variety of image types.

## Core Requirements
- Users can upload raster images and convert them to SVGs.
- Support for multiple conversion backends: VTracer (for color/vector) and Potrace (for black & white).
- Preset system for common use cases (Photo, Logo, Lineart, Black & White, Poster, Detailed, Custom).
- Step-by-step, user-friendly UI with clear feedback and download options.
- Robust error handling and logging.

## Goals
- Professional, modern, and compact UI/UX.
- High conversion accuracy and reliability.
- Easy extensibility for future presets or backends.

## Scope
- Frontend: Next.js/React UI, step-by-step flow, preset selection, SVG preview, and download.
- Backend: API for image upload, conversion, and SVG delivery. Integration with VTracer and Potrace CLI tools.
- Documentation: Maintain a Memory Bank for all project context, decisions, and progress. 