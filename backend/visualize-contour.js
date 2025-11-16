// Visualize contour extraction - draw contour on image
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function visualizeContour() {
  console.log('🎨 Visualizing contour extraction...\n');

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

    // Analyze alpha channel
    console.log('\n🔍 Analyzing alpha channel...');
    let opaquePixels = 0;
    let transparentPixels = 0;
    let semiTransparentPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > 200) opaquePixels++;
      else if (alpha < 50) transparentPixels++;
      else semiTransparentPixels++;
    }

    const totalPixels = image.width * image.height;
    console.log(`Opaque pixels (>200): ${opaquePixels} (${(opaquePixels/totalPixels*100).toFixed(1)}%)`);
    console.log(`Transparent pixels (<50): ${transparentPixels} (${(transparentPixels/totalPixels*100).toFixed(1)}%)`);
    console.log(`Semi-transparent: ${semiTransparentPixels} (${(semiTransparentPixels/totalPixels*100).toFixed(1)}%)`);

    // Create alpha mask visualization
    console.log('\n🎨 Creating alpha mask visualization...');
    const maskCanvas = createCanvas(canvas.width, canvas.height);
    const maskCtx = maskCanvas.getContext('2d');

    // Draw original image
    maskCtx.drawImage(image, 0, 0);

    // Create binary mask
    const alphaMask = new Uint8ClampedArray(canvas.width * canvas.height);
    const alphaThreshold = 50;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const idx = (y * canvas.width + x) * 4;
        const alpha = data[idx + 3];
        alphaMask[y * canvas.width + x] = alpha > alphaThreshold ? 255 : 0;
      }
    }

    // Draw mask overlay
    maskCtx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        if (alphaMask[y * canvas.width + x] === 255) {
          maskCtx.fillRect(x, y, 1, 1);
        }
      }
    }

    // Save mask visualization
    const maskPath = './debug-alpha-mask.png';
    const maskBuffer = maskCanvas.toBuffer('image/png');
    fs.writeFileSync(maskPath, maskBuffer);
    console.log(`✅ Alpha mask saved to: ${maskPath}`);

    // Find boundary pixels
    console.log('\n🔍 Finding boundary pixels...');
    const boundaryPixels = [];

    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const idx = y * canvas.width + x;

        if (alphaMask[idx] === 255) {
          // Check if it's a boundary pixel (has at least one transparent neighbor)
          let isBoundary = false;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (alphaMask[ny * canvas.width + nx] === 0) {
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

    // Draw boundary on image
    const boundaryCanvas = createCanvas(canvas.width, canvas.height);
    const boundaryCtx = boundaryCanvas.getContext('2d');
    boundaryCtx.drawImage(image, 0, 0);

    // Draw boundary pixels in red
    boundaryCtx.fillStyle = 'red';
    boundaryPixels.forEach(p => {
      boundaryCtx.fillRect(p.x, p.y, 2, 2);
    });

    // Save boundary visualization
    const boundaryPath = './debug-boundary.png';
    const boundaryBuffer = boundaryCanvas.toBuffer('image/png');
    fs.writeFileSync(boundaryPath, boundaryBuffer);
    console.log(`✅ Boundary visualization saved to: ${boundaryPath}`);

    console.log('\n💡 Check the generated debug images:');
    console.log('   - debug-alpha-mask.png (red = opaque area)');
    console.log('   - debug-boundary.png (red dots = detected boundary)');

  } finally {
    await connection.end();
  }
}

visualizeContour()
  .then(() => {
    console.log('\n✅ Visualization completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
