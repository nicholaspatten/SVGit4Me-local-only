import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";

export async function GET(request: NextRequest) {
  console.log("Binary check endpoint called");
  
  const results = {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    binaries: {} as any,
    paths: {} as any,
    versions: {} as any
  };

  const checks = [
    { name: 'magick', cmd: 'which magick' },
    { name: 'convert', cmd: 'which convert' },
    { name: 'potrace', cmd: 'which potrace' },
    { name: 'vtracer', cmd: 'which vtracer' }
  ];
  
  for (const check of checks) {
    try {
      const path = await new Promise<string>((resolve, reject) => {
        exec(check.cmd, (error, stdout, stderr) => {
          if (error) reject(error);
          else resolve(stdout.trim());
        });
      });
      
      results.binaries[check.name] = 'found';
      results.paths[check.name] = path;
      
      // Try to get version
      try {
        const versionCmd = check.name === 'vtracer' ? `${check.name} --help` : `${check.name} --version`;
        const version = await new Promise<string>((resolve, reject) => {
          exec(versionCmd, { timeout: 5000 }, (error, stdout, stderr) => {
            // Don't reject on error for version checks
            resolve(stdout.trim() || stderr.trim() || 'unknown');
          });
        });
        results.versions[check.name] = version.split('\n')[0]; // First line only
      } catch (versionError) {
        results.versions[check.name] = 'version check failed';
      }
      
    } catch (error) {
      results.binaries[check.name] = 'not found';
      results.paths[check.name] = null;
      results.versions[check.name] = null;
    }
  }
  
  // Check if we can execute a simple command
  try {
    const testResult = await new Promise<string>((resolve, reject) => {
      exec('echo "test successful"', (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve(stdout.trim());
      });
    });
    results.execTest = testResult;
  } catch (error) {
    results.execTest = `failed: ${error}`;
  }

  return NextResponse.json(results, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  });
}