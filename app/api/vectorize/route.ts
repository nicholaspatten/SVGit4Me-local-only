import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import os from "os";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs"; // Ensure Node.js runtime

// Add OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Function to post-process SVG and fix viewBox issues


// In a real application, you would use a library like potrace
// This is a simplified example that returns a placeholder SVG
export async function POST(request: NextRequest) {
  console.log("API /api/vectorize called");
  try {
    // Check if binaries are available
    console.log("=== CHECKING BINARY AVAILABILITY ===");
    const checkBinaries = async () => {
      const checks = [
        { name: 'ImageMagick', cmd: 'which magick' },
        { name: 'Potrace', cmd: 'which potrace' },
        { name: 'VTracer', cmd: 'which vtracer' }
      ];
      
      for (const check of checks) {
        try {
          await new Promise((resolve, reject) => {
            exec(check.cmd, (error, stdout, stderr) => {
              if (error) {
                console.error(`${check.name} NOT FOUND:`, error.message);
                reject(error);
              } else {
                console.log(`${check.name} found at:`, stdout.trim());
                resolve(true);
              }
            });
          });
        } catch (error) {
          console.error(`${check.name} check failed:`, error);
        }
      }
    };
    
    await checkBinaries();
    
    // Add headers for better mobile browser compatibility
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    const formData = await request.formData();
    console.log("FormData received, entries:", Array.from(formData.entries()).map(([key, value]) => [key, typeof value === 'object' ? `File(${value.constructor.name})` : value]));
    
    const file = formData.get("image") as File;

    if (!file) {
      console.error("No file provided in formData");
      return NextResponse.json({ error: "No file provided" }, { status: 400, headers });
    }

    console.log("File info:", {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Enhanced mobile browser support with file size and type validation
    console.log("=== MOBILE FILE PROCESSING ===");
    console.log("User-Agent:", request.headers.get('user-agent'));
    console.log("Content-Length:", request.headers.get('content-length'));
    
    // Check file size limits for mobile compatibility
    const maxSizeBytes = 15 * 1024 * 1024; // 15MB limit for mobile
    if (file.size > maxSizeBytes) {
      console.error("File too large for mobile processing:", file.size);
      return NextResponse.json({ 
        error: "File too large for mobile processing", 
        maxSize: "15MB",
        actualSize: `${Math.round(file.size / 1024 / 1024)}MB`
      }, { status: 413, headers });
    }
    
    // Validate file type more strictly for mobile
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
      'image/webp', 'image/bmp', 'image/tiff'
    ];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      console.error("Invalid file type for mobile:", file.type);
      return NextResponse.json({ 
        error: "Unsupported file type", 
        supportedTypes: allowedTypes,
        receivedType: file.type
      }, { status: 400, headers });
    }

    // Save uploaded file to a temp location with better mobile browser support
    let buffer: Buffer;
    try {
      console.log("Converting file to buffer...");
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      console.log("Successfully converted file to buffer, size:", buffer.length);
      
      // Additional validation for corrupted files (common on mobile)
      if (buffer.length === 0) {
        throw new Error("Empty file buffer");
      }
      
      // Validate basic image header for common formats
      const header = buffer.slice(0, 10);
      const isPNG = header[0] === 0x89 && header[1] === 0x50;
      const isJPEG = header[0] === 0xFF && header[1] === 0xD8;
      const isGIF = header.toString('ascii', 0, 3) === 'GIF';
      const isWebP = header.toString('ascii', 8, 12) === 'WEBP';
      
      if (!isPNG && !isJPEG && !isGIF && !isWebP) {
        console.warn("File might be corrupted or unsupported format, but proceeding...");
      }
      
    } catch (error) {
      console.error("Failed to convert file to arrayBuffer:", error);
      return NextResponse.json({ 
        error: "Failed to process uploaded file", 
        details: error instanceof Error ? error.message : String(error)
      }, { status: 400, headers });
    }

    const tempDir = os.tmpdir();
    const id = uuidv4();
    const inputPath = path.join(tempDir, `${id}.png`);
    const outputPath = path.join(tempDir, `${id}.svg`);
    
    try {
      await fs.writeFile(inputPath, buffer);
      console.log("Successfully wrote file to:", inputPath);
    } catch (error) {
      console.error("Failed to write file:", error);
      return NextResponse.json({ error: "Failed to save uploaded file" }, { status: 500, headers });
    }

    const preset = formData.get("preset");
    // Read settings from formData
    const mode = formData.get("mode") || "spline";
    const colorMode = formData.get("colorMode") || "color";
    const colorPrecisionRaw = formData.get("colorPrecision") || 6;
    // Clamp colorPrecision to [1,8]
    const colorPrecision = Math.max(1, Math.min(8, Number(colorPrecisionRaw)));
    const cornerThreshold = formData.get("cornerThreshold") || 60;
    const spliceThreshold = formData.get("spliceThreshold") || 45;
    const filterSpeckle = formData.get("filterSpeckle") || 2;
    const pathPrecision = formData.get("pathPrecision") || 4;

    if (preset === "bw" || colorMode === "grayscale") {
      // Use Potrace for Black & White
      // Convert to bitmap (PBM) format that Potrace expects
      const pbmPath = path.join(tempDir, `${id}.pbm`);
      console.log("=== BLACK & WHITE PROCESSING ===");
      console.log("Input file:", inputPath);
      console.log("Output PBM:", pbmPath);
      
      const magickCmd = `magick "${inputPath}" -background white -alpha remove -alpha off -colorspace Gray -contrast-stretch 0x15% -threshold 75% -monochrome "${pbmPath}"`;
      console.log("ImageMagick command:", magickCmd);
      
      await new Promise((resolve, reject) => {
        const process = exec(magickCmd, { timeout: 45000 }, (error, stdout, stderr) => {
          console.log("ImageMagick stdout:", stdout);
          console.log("ImageMagick stderr:", stderr);
          if (error) {
            console.error("ImageMagick failed:", error);
            if (error.code === 'SIGTERM' || error.killed) {
              reject(new Error("ImageMagick processing timed out (mobile)"));
            } else {
              reject(new Error(`ImageMagick failed: ${stderr || stdout || error.message}`));
            }
          } else {
            console.log("ImageMagick completed successfully");
            resolve(true);
          }
        });
        
        // Additional timeout safety for mobile
        setTimeout(() => {
          if (process.killed === false) {
            console.warn("Killing ImageMagick process due to mobile timeout");
            process.kill('SIGTERM');
          }
        }, 40000);
      });
      // Run Potrace with mobile-friendly timeout
      const potraceCmd = `potrace "${pbmPath}" -s -o "${outputPath}"`;
      console.log("Running Potrace command:", potraceCmd);
      await new Promise((resolve, reject) => {
        const process = exec(potraceCmd, { timeout: 30000 }, (error, stdout, stderr) => {
          if (error) {
            console.error("Potrace error:", error);
            console.error("Potrace stderr:", stderr);
            console.error("Potrace stdout:", stdout);
            if (error.code === 'SIGTERM' || error.killed) {
              reject(new Error("Potrace processing timed out (mobile)"));
            } else {
              reject(new Error(`Potrace failed: ${stderr || stdout || error.message}`));
            }
          } else {
            console.log("Potrace completed successfully");
            resolve(true);
          }
        });
        
        // Additional timeout safety for mobile
        setTimeout(() => {
          if (process.killed === false) {
            console.warn("Killing Potrace process due to mobile timeout");
            process.kill('SIGTERM');
          }
        }, 25000);
      });
      await fs.unlink(pbmPath);
    } else {
      console.log("=== COLOR PROCESSING WITH VTRACER ===");
      console.log("Input file:", inputPath);
      console.log("Preset:", preset, "ColorMode:", colorMode);
      
      // Preprocess the image to ensure exact dimensions and remove any padding
      const processedPath = path.join(tempDir, `${id}_processed.png`);
      console.log("Processed file:", processedPath);
      
      const preprocessCmd = `magick "${inputPath}" -trim +repage -background white -gravity center "${processedPath}"`;
      console.log("ImageMagick preprocess command:", preprocessCmd);
      
      await new Promise((resolve, reject) => {
        const process = exec(preprocessCmd, { timeout: 30000 }, (error, stdout, stderr) => {
          console.log("ImageMagick preprocess stdout:", stdout);
          console.log("ImageMagick preprocess stderr:", stderr);
          if (error) {
            console.error("ImageMagick preprocess failed:", error);
            if (error.code === 'SIGTERM' || error.killed) {
              reject(new Error("ImageMagick preprocessing timed out (mobile)"));
            } else {
              reject(new Error(`ImageMagick preprocessing failed: ${stderr || stdout || error.message}`));
            }
          } else {
            console.log("ImageMagick preprocess completed successfully");
            resolve(true);
          }
        });
        
        // Additional timeout safety for mobile
        setTimeout(() => {
          if (process.killed === false) {
            console.warn("Killing ImageMagick preprocess due to mobile timeout");
            process.kill('SIGTERM');
          }
        }, 25000);
      });

      // Use VTracer for all other presets (no fallback)
      const vtracerCmd = [
        "vtracer",
        `--input "${processedPath}"`,
        `--output "${outputPath}"`,
        `--colormode ${colorMode}`,
        `--color_precision ${colorPrecision}`,
        `--mode ${mode}`,
        `--corner_threshold ${cornerThreshold}`,
        `--splice_threshold ${spliceThreshold}`,
        `--filter_speckle ${filterSpeckle}`,
        `--path_precision ${pathPrecision}`,
      ].join(" ");
      console.log("Running VTracer command:", vtracerCmd);
      
      await new Promise((resolve, reject) => {
        const process = exec(vtracerCmd, { timeout: 60000 }, (error, stdout, stderr) => {
          console.log("VTracer stdout:", stdout);
          console.log("VTracer stderr:", stderr);
          if (error) {
            console.error("VTracer failed - Error code:", error.code);
            console.error("VTracer failed - Signal:", error.signal);
            console.error("VTracer failed - Error:", error.message);
            console.error("VTracer stderr:", stderr);
            console.error("VTracer stdout:", stdout);
            if (error.code === 'SIGTERM' || error.killed) {
              reject(new Error("VTracer processing timed out (mobile) - try reducing image size or complexity"));
            } else {
              reject(new Error(`VTracer failed: ${stderr || stdout || error.message}`));
            }
          } else {
            console.log("VTracer completed successfully");
            resolve(true);
          }
        });
        
        // Additional timeout safety for mobile
        setTimeout(() => {
          if (process.killed === false) {
            console.warn("Killing VTracer process due to mobile timeout");
            process.kill('SIGTERM');
          }
        }, 55000);
      });
    }

    // Read SVG output
    let svg = await fs.readFile(outputPath, "utf8");

    // Debug: Log the SVG content to see what's causing the black lines
    console.log("Original SVG content first 500 chars:", svg.substring(0, 500));
    console.log("SVG content includes rect:", svg.includes('<rect'));
    console.log("SVG content includes background:", svg.includes('background'));
    console.log("SVG content includes stroke:", svg.includes('stroke'));

    // Post-processing to fix viewBox and remove black lines
    if (preset !== "bw" && colorMode !== "grayscale") {
      const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
      if (viewBoxMatch) {
        const viewBox = viewBoxMatch[1].split(' ').map(Number);
        console.log("Original viewBox:", viewBox);
        
        // If viewBox has negative values, try to fix it
        if (viewBox[0] < 0 || viewBox[1] < 0) {
          const newViewBox = `0 0 ${viewBox[2]} ${viewBox[3]}`;
          svg = svg.replace(/viewBox="[^"]+"/, `viewBox="${newViewBox}"`);
          console.log("Fixed viewBox to:", newViewBox);
        }
      }
      
      // Get original image dimensions to ensure SVG matches
      const getImageDimensions = async (imagePath) => {
        return new Promise((resolve, reject) => {
          exec(
            `magick identify -format "%w %h" "${imagePath}"`,
            (error, stdout, stderr) => {
              if (error) {
                reject(error);
              } else {
                const [width, height] = stdout.trim().split(' ').map(Number);
                resolve({ width, height });
              }
            }
          );
        });
      };
      
      try {
        const { width, height } = await getImageDimensions(inputPath);
        console.log("Original image dimensions:", width, "x", height);
        
        // Fix SVG dimensions to match original image
        svg = svg.replace(/width="[^"]*"/, `width="${width}"`);
        svg = svg.replace(/height="[^"]*"/, `height="${height}"`);
        svg = svg.replace(/viewBox="[^"]*"/, `viewBox="0 0 ${width} ${height}"`);
        
        console.log("Fixed SVG dimensions to match original image");
      } catch (error) {
        console.error("Could not get image dimensions:", error);
      }
      
      // Remove only black border lines that might be artifacts
      svg = svg.replace(/<rect[^>]*fill="black"[^>]*\/>/g, '');
      svg = svg.replace(/<rect[^>]*fill="#000000"[^>]*\/>/g, '');
      svg = svg.replace(/<rect[^>]*fill="#000"[^>]*\/>/g, '');
      
      console.log("After dimension fix and black border removal");
    }

    // Clean up temp files
    await fs.unlink(inputPath);
    if (preset !== "bw" && colorMode !== "grayscale") {
      try {
        await fs.unlink(processedPath);
      } catch (e) {
        // File might not exist, ignore
      }
    }
    await fs.unlink(outputPath);

    return new NextResponse(svg, {
      headers: { 
        "Content-Type": "image/svg+xml",
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json({ 
      error: "Failed to process image", 
      details: String(error) 
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
