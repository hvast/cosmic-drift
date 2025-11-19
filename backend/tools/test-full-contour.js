// Test complete contour extraction pipeline including background removal
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const mysql = require('mysql2/promise');

// Import the contour extraction logic (simplified version for testing)
async function testContourExtraction() {
  console.log('🧪 Testing complete contour extraction pipeline...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'cosmic_drift'
  });

  try {
    // Get first creature
    const [creatures] = await connection.execute(
      'SELECT id, name, image_url FROM creatures LIMIT 1'
    );

    if (creatures.length === 0) {
      console.log('❌ No creatures found');
      return;
    }

    const creature = creatures[0];
    console.log('Testing creature:', creature.name);
    console.log('Image URL:', creature.image_url);

    // Convert URL to file path
    const imageUrl = creature.image_url;
    const imagePath = imageUrl.replace('http://localhost:3001', '.');
    console.log('Image path:', imagePath);

    if (!fs.existsSync(imagePath)) {
      console.log('❌ Image file not found:', imagePath);
      return;
    }

    // Load image
    console.log('\n📷 Loading image...');
    const image = await loadImage(imagePath);
    console.log(`Image size: ${image.width}x${image.height}`);

    // Create canvas
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // 1. Check transparency
    console.log('\n🔍 Step 1: Analyzing alpha channel...');
    let opaquePixels = 0;
    let transparentPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > 200) opaquePixels++;
      else if (alpha < 50) transparentPixels++;
    }

    const totalPixels = width * height;
    const transparencyRatio = (totalPixels - opaquePixels) / totalPixels;
    console.log(`Opaque pixels: ${opaquePixels} (${(opaquePixels/totalPixels*100).toFixed(1)}%)`);
    console.log(`Transparency ratio: ${(transparencyRatio*100).toFixed(1)}%`);

    if (transparencyRatio < 0.05) {
      console.log('⚠️  No significant transparency, proceeding with background removal...');

      // 2. Detect background color
      console.log('\n🎨 Step 2: Detecting background color...');
      const backgroundColor = detectBackgroundColor(data, width, height);
      console.log(`Background color: RGB(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b})`);

      // 3. Calculate color differences
      console.log('\n📊 Step 3: Calculating color differences...');
      const colorDifferences = [];
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const diff = Math.sqrt(
          Math.pow(r - backgroundColor.r, 2) +
          Math.pow(g - backgroundColor.g, 2) +
          Math.pow(b - backgroundColor.b, 2)
        );
        colorDifferences.push(diff);
      }

      colorDifferences.sort((a, b) => a - b);
      const percentile25 = colorDifferences[Math.floor(colorDifferences.length * 0.25)];
      const percentile75 = colorDifferences[Math.floor(colorDifferences.length * 0.75)];
      const colorThreshold = Math.max(15, Math.min(60, (percentile25 + percentile75) / 2));

      console.log(`25th percentile: ${percentile25.toFixed(1)}`);
      console.log(`75th percentile: ${percentile75.toFixed(1)}`);
      console.log(`Adaptive threshold: ${colorThreshold.toFixed(1)}`);

      // 4. Create binary mask
      console.log('\n🎯 Step 4: Creating binary mask...');
      const mask = new Uint8ClampedArray(width * height);
      let foregroundPixels = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const diff = Math.sqrt(
            Math.pow(r - backgroundColor.r, 2) +
            Math.pow(g - backgroundColor.g, 2) +
            Math.pow(b - backgroundColor.b, 2)
          );

          if (diff > colorThreshold) {
            mask[y * width + x] = 255;
            foregroundPixels++;
          }
        }
      }

      const foregroundRatio = foregroundPixels / totalPixels;
      console.log(`Foreground pixels: ${foregroundPixels} (${(foregroundRatio*100).toFixed(1)}%)`);

      // 5. Visualize binary mask
      console.log('\n🖼️  Step 5: Visualizing binary mask...');
      const maskCanvas = createCanvas(width, height);
      const maskCtx = maskCanvas.getContext('2d');

      // Draw white background
      maskCtx.fillStyle = 'white';
      maskCtx.fillRect(0, 0, width, height);

      // Draw foreground in black
      maskCtx.fillStyle = 'black';
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (mask[y * width + x] === 255) {
            maskCtx.fillRect(x, y, 1, 1);
          }
        }
      }

      const maskPath = './debug-binary-mask.png';
      const maskBuffer = maskCanvas.toBuffer('image/png');
      fs.writeFileSync(maskPath, maskBuffer);
      console.log(`✅ Binary mask saved to: ${maskPath}`);

      // 6. Find boundary pixels
      console.log('\n🔍 Step 6: Finding boundary pixels...');
      const boundaryPixels = [];

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;

          if (mask[idx] === 255) {
            // Check if it's a boundary pixel
            let isBoundary = false;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (mask[ny * width + nx] === 0) {
                  isBoundary = true;
                  break;
                }
              }
              if (isBoundary) break;
            }

            if (isBoundary) {
              boundaryPixels.push({ x, y });
            }
          }
        }
      }

      console.log(`Found ${boundaryPixels.length} boundary pixels`);

      // 7. Visualize boundary
      console.log('\n🎨 Step 7: Visualizing boundary...');
      const boundaryCanvas = createCanvas(width, height);
      const boundaryCtx = boundaryCanvas.getContext('2d');
      boundaryCtx.drawImage(image, 0, 0);

      // Draw boundary in red
      boundaryCtx.fillStyle = 'red';
      boundaryPixels.forEach(p => {
        boundaryCtx.fillRect(p.x, p.y, 2, 2);
      });

      const boundaryPath = './debug-boundary-final.png';
      const boundaryBuffer = boundaryCanvas.toBuffer('image/png');
      fs.writeFileSync(boundaryPath, boundaryBuffer);
      console.log(`✅ Boundary saved to: ${boundaryPath}`);

      console.log('\n💡 Generated debug images:');
      console.log('   - debug-binary-mask.png (black = foreground)');
      console.log('   - debug-boundary-final.png (red = boundary)');

    } else {
      console.log('✅ Image has transparency, alpha channel extraction should work');
    }

  } finally {
    await connection.end();
  }
}

function detectBackgroundColor(data, width, height) {
  const samples = [];
  const sampleSize = 10;

  // Sample from four corners
  const corners = [
    { x: 0, y: 0 },
    { x: width - sampleSize, y: 0 },
    { x: 0, y: height - sampleSize },
    { x: width - sampleSize, y: height - sampleSize }
  ];

  for (const corner of corners) {
    for (let y = corner.y; y < Math.min(corner.y + sampleSize, height); y++) {
      for (let x = corner.x; x < Math.min(corner.x + sampleSize, width); x++) {
        const idx = (y * width + x) * 4;
        samples.push({
          r: data[idx],
          g: data[idx + 1],
          b: data[idx + 2]
        });
      }
    }
  }

  const avgR = samples.reduce((sum, s) => sum + s.r, 0) / samples.length;
  const avgG = samples.reduce((sum, s) => sum + s.g, 0) / samples.length;
  const avgB = samples.reduce((sum, s) => sum + s.b, 0) / samples.length;

  return {
    r: Math.round(avgR),
    g: Math.round(avgG),
    b: Math.round(avgB)
  };
}

testContourExtraction()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
