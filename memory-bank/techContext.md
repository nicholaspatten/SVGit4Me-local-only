# Tech Context

## Technologies Used
- **Frontend**: Next.js (React), TypeScript, Tailwind CSS
- **Backend**: Node.js (Next.js API routes)
- **CLI Tools**: VTracer (Rust), Potrace (C), ImageMagick (for preprocessing)

## Development Setup
- Requires Node.js, npm, and Next.js for frontend/backend.
- Rust and Cargo must be installed for VTracer.
- Potrace and ImageMagick must be installed and available in the system PATH.
- All CLI tools must be accessible from the backend server environment.

## Technical Constraints
- VTracer color precision must be clamped to [1,8] to avoid errors.
- Uploaded images must be saved and accessible for CLI processing.
- Backend must handle errors gracefully and return helpful messages to the frontend.

## Dependencies
- Next.js, React, Tailwind CSS
- VTracer (installed via Cargo)
- Potrace (system package)
- ImageMagick (system package)
- uuid (Node.js package for unique filenames) 