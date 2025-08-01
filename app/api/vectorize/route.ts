import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import os from "os";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs"; // Ensure Node.js runtime

// Function to post-process SVG and fix viewBox issues
async function postProcessSVG(svg: string, inputPath: string): Promise<string> {
  try {
    // Get original image dimensions
    const dimensions = await getImageDimensions(inputPath);
    
    // Extract current viewBox from SVG
    const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
    if (viewBoxMatch) {
      const currentViewBox = viewBoxMatch[1].split(' ').map(Number);
      
      // If viewBox is significantly larger than image dimensions, adjust it
      if (currentViewBox[2] > dimensions.width * 1.1 || currentViewBox[3] > dimensions.height * 1.1) {
        // Replace viewBox with image dimensions
        const newViewBox = `0 0 ${dimensions.width} ${dimensions.height}`;
        svg = svg.replace(/viewBox="[^"]+"/, `viewBox="${newViewBox}"`);
        
        // Also update width and height attributes if they exist
        svg = svg.replace(/width="[^"]+"/, `width="${dimensions.width}"`);
        svg = svg.replace(/height="[^"]+"/, `height="${dimensions.height}"`);
      }
    }
    
    return svg;
  } catch (error) {
    console.error("Error post-processing SVG:", error);
    return svg; // Return original if processing fails
  }
}

// Function to get image dimensions using ImageMagick
async function getImageDimensions(imagePath: string): Promise<{width: number, height: number}> {
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
}

// In a real application, you would use a library like potrace
// This is a simplified example that returns a placeholder SVG
export async function POST(request: NextRequest) {
  console.log("API /api/vectorize called");
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Save uploaded file to a temp location
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempDir = os.tmpdir();
    const id = uuidv4();
    const inputPath = path.join(tempDir, `${id}.png`);
    const outputPath = path.join(tempDir, `${id}.svg`);
    await fs.writeFile(inputPath, buffer);

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

    if (preset === "bw") {
      // Use Potrace for Black & White
      // Flatten against white and convert to PGM (removed -trim to preserve full image)
      const pgmPath = path.join(tempDir, `${id}.pgm`);
      await new Promise((resolve, reject) => {
        exec(
          `magick "${inputPath}" -background white -alpha remove -alpha off -colorspace Gray -depth 8 "${pgmPath}"`,
          (error, stdout, stderr) => {
            if (error) reject(stderr || stdout || error);
            else resolve(true);
          }
        );
      });
      // Run Potrace
      const potraceCmd = `potrace "${pgmPath}" -s -o "${outputPath}"`;
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
      await fs.unlink(pgmPath);
    } else {
      // Use VTracer for all other presets (no fallback)
      const vtracerCmd = [
        "vtracer",
        `--input "${inputPath}"`,
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

    // Post-process SVG to fix viewBox and remove unwanted padding
    svg = await postProcessSVG(svg, inputPath);

    // Clean up temp files
    await fs.unlink(inputPath);
    await fs.unlink(outputPath);

    return new NextResponse(svg, {
      headers: { "Content-Type": "image/svg+xml" },
    });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json({ error: "Failed to process image", details: String(error) }, { status: 500 });
  }
}
