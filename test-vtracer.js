#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function testVTracer() {
  console.log('🔍 Testing VTracer installation and functionality...\n');

  // Test 1: Check if vtracer is installed
  console.log('1. Checking VTracer installation...');
  try {
    const { stdout } = await new Promise((resolve, reject) => {
      exec('which vtracer', (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve({ stdout, stderr });
      });
    });
    console.log('✅ VTracer found at:', stdout.trim());
  } catch (error) {
    console.log('❌ VTracer not found:', error.message);
    return;
  }

  // Test 2: Check vtracer version/help
  console.log('\n2. Checking VTracer version...');
  try {
    const { stdout } = await new Promise((resolve, reject) => {
      exec('vtracer --help', (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve({ stdout, stderr });
      });
    });
    console.log('✅ VTracer help output (first 200 chars):');
    console.log(stdout.substring(0, 200) + '...');
  } catch (error) {
    console.log('❌ VTracer help failed:', error.message);
  }

  // Test 3: Create a test image
  console.log('\n3. Creating test image...');
  const testImagePath = path.join(os.tmpdir(), 'test-image.png');
  const testSvgPath = path.join(os.tmpdir(), 'test-output.svg');
  
  // Create a simple test image using ImageMagick
  try {
    await new Promise((resolve, reject) => {
      exec(`convert -size 100x100 xc:red "${testImagePath}"`, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve();
      });
    });
    console.log('✅ Test image created at:', testImagePath);
  } catch (error) {
    console.log('❌ Failed to create test image:', error.message);
    return;
  }

  // Test 4: Test VTracer with different command formats
  console.log('\n4. Testing VTracer command formats...');
  
  const testCommands = [
    // Format 1: Original format (spaces)
    `vtracer --input "${testImagePath}" --output "${testSvgPath}" --colormode color --color_precision 6 --mode spline --corner_threshold 60 --splice_threshold 45 --filter_speckle 2 --path_precision 4`,
    
    // Format 2: New format (=)
    `vtracer --input="${testImagePath}" --output="${testSvgPath}" --colormode=color --color_precision=6 --mode=spline --corner_threshold=60 --splice_threshold=45 --filter_speckle=2 --path_precision=4`,
    
    // Format 3: Minimal command
    `vtracer --input="${testImagePath}" --output="${testSvgPath}" --colormode=color`,
    
    // Format 4: Different parameter names
    `vtracer --input="${testImagePath}" --output="${testSvgPath}" --colormode=color --color-precision=6 --mode=spline --corner-threshold=60 --splice-threshold=45 --filter-speckle=2 --path-precision=4`
  ];

  for (let i = 0; i < testCommands.length; i++) {
    const cmd = testCommands[i];
    console.log(`\n   Testing command ${i + 1}:`);
    console.log(`   ${cmd}`);
    
    try {
      const { stdout, stderr } = await new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
          if (error) reject(error);
          else resolve({ stdout, stderr });
        });
      });
      
      console.log('   ✅ Command succeeded!');
      if (stdout) console.log('   stdout:', stdout);
      if (stderr) console.log('   stderr:', stderr);
      
      // Check if output file was created
      if (fs.existsSync(testSvgPath)) {
        const stats = fs.statSync(testSvgPath);
        console.log(`   📄 Output file created: ${stats.size} bytes`);
        
        // Read first few lines of SVG
        const svgContent = fs.readFileSync(testSvgPath, 'utf8');
        console.log('   📄 SVG preview:', svgContent.substring(0, 100) + '...');
      } else {
        console.log('   ❌ Output file not created');
      }
      
      break; // Stop at first successful command
      
    } catch (error) {
      console.log('   ❌ Command failed:', error.message);
    }
  }

  // Cleanup
  try {
    if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
    if (fs.existsSync(testSvgPath)) fs.unlinkSync(testSvgPath);
  } catch (error) {
    // Ignore cleanup errors
  }

  console.log('\n🎯 Test completed!');
}

testVTracer().catch(console.error); 