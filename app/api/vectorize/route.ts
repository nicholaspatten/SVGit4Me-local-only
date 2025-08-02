import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import os from "os";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs"; // Ensure Node.js runtime

// Function to post-process SVG and fix viewBox issues


// In a real application, you would use a library like potrace
// This is a simplified example that returns a placeholder SVG
export async function POST(request: NextRequest) {
  console.log("API /api/vectorize called");
  try {
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

    // Save uploaded file to a temp location with better mobile browser support
    let buffer: Buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      console.log("Successfully converted file to buffer, size:", buffer.length);
    } catch (error) {
      console.error("Failed to convert file to arrayBuffer:", error);
      return NextResponse.json({ error: "Failed to process uploaded file" }, { status: 400, headers });
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
      await new Promise((resolve, reject) => {
        exec(
          `magick "${inputPath}" -background white -alpha remove -alpha off -colorspace Gray -contrast-stretch 0x15% -threshold 75% -monochrome "${pbmPath}"`,
          (error, stdout, stderr) => {
            if (error) reject(stderr || stdout || error);
            else resolve(true);
          }
        );
      });
      // Run Potrace
      const potraceCmd = `potrace "${pbmPath}" -s -o "${outputPath}"`;
      console.log("Running Potrace command:", potraceCmd);
      await new Promise((resolve, reject) => {
        exec(
          potraceCmd,
          (error, stdout, stderr) => {
            if (error) {
              console.error("Potrace error:", error);
              console.error("Potrace stderr:", stderr);
              console.error("Potrace stdout:", stdout);
              reject(stderr || stdout || error);
            } else {
              console.log("Potrace completed successfully");
              resolve(true);
            }
          }
        );
      });
      await fs.unlink(pbmPath);
    } else {
      // Preprocess the image to ensure exact dimensions and remove any padding
      const processedPath = path.join(tempDir, `${id}_processed.png`);
      await new Promise((resolve, reject) => {
        exec(
          `magick "${inputPath}" -trim +repage -background white -gravity center "${processedPath}"`,
          (error, stdout, stderr) => {
            if (error) reject(stderr || stdout || error);
            else resolve(true);
          }
        );
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
        exec(
          vtracerCmd,
          (error, stdout, stderr) => {
            if (error) {
              console.error("VTracer error:", error);
              console.error("VTracer stderr:", stderr);
              console.error("VTracer stdout:", stdout);
              reject(stderr || stdout || error);
            } else {
              console.log("VTracer completed successfully");
              resolve(true);
            }
          }
        );
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
