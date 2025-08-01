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

    // Debug: Log the SVG content to see what's causing the black lines
    console.log("Original SVG content:", svg);

    // Post-processing to fix viewBox and remove black lines
    if (preset !== "bw") {
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
      
      // Remove any black border elements that might be causing the lines
      // Look for rect elements with black fill that are likely borders
      svg = svg.replace(/<rect[^>]*fill="black"[^>]*\/>/g, '');
      svg = svg.replace(/<rect[^>]*fill="black"[^>]*><\/rect>/g, '');
      svg = svg.replace(/<rect[^>]*fill="#000000"[^>]*\/>/g, '');
      svg = svg.replace(/<rect[^>]*fill="#000000"[^>]*><\/rect>/g, '');
      
      // Also remove any rect elements with very thin width/height that might be lines
      svg = svg.replace(/<rect[^>]*width="1"[^>]*\/>/g, '');
      svg = svg.replace(/<rect[^>]*width="1"[^>]*><\/rect>/g, '');
      svg = svg.replace(/<rect[^>]*height="1"[^>]*\/>/g, '');
      svg = svg.replace(/<rect[^>]*height="1"[^>]*><\/rect>/g, '');
      
      console.log("After black line removal:", svg);
    }

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
