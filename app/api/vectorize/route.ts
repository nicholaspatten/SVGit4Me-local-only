import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import os from "os";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs"; // Ensure Node.js runtime

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
      // Flatten against white, trim, and convert to PGM
      const pgmPath = path.join(tempDir, `${id}.pgm`);
      await new Promise((resolve, reject) => {
        exec(
          `convert "${inputPath}" -background white -alpha remove -alpha off -trim -colorspace Gray -depth 8 "${pgmPath}"`,
          (error, stdout, stderr) => {
            if (error) reject(stderr || stdout || error);
            else resolve(true);
          }
        );
      });
      // Run Potrace
      await new Promise((resolve, reject) => {
        exec(
          `potrace "${pgmPath}" -s -o "${outputPath}"`,
          (error, stdout, stderr) => {
            if (error) reject(stderr || stdout || error);
            else resolve(true);
          }
        );
      });
      await fs.unlink(pgmPath);
    } else {
      // Use VTracer for all other presets
      const vtracerCmd = [
        "vtracer",
        `--input \"${inputPath}\"`,
        `--output \"${outputPath}\"`,
        `--colormode ${colorMode}`,
        `--color_precision ${colorPrecision}`,
        `--mode ${mode}`,
        `--corner_threshold ${cornerThreshold}`,
        `--splice_threshold ${spliceThreshold}`,
        `--filter_speckle ${filterSpeckle}`,
        `--path_precision ${pathPrecision}`,
      ].join(" ");
      await new Promise((resolve, reject) => {
        exec(
          vtracerCmd,
          (error, stdout, stderr) => {
            if (error) reject(stderr || stdout || error);
            else resolve(true);
          }
        );
      });
    }

    // Read SVG output
    const svg = await fs.readFile(outputPath, "utf8");

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
