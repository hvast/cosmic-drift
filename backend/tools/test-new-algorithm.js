// Test the new background removal algorithm
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const mysql = require('mysql2/promise');

async function testNewAlgorithm() {
  console.log('🧪 Testing new background removal algorithm...\n');

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

    const imagePath = creature.image_url.replace('http://localhost:3001', '.');
    console.log('Image path:', imagePath);

    if (!fs.existsSync(imagePath)) {
      console.log('❌ Image file not found');
      return;
    }

    // Load image
    const image = await loadImage(imagePath);
    console.log(`\n📷 Image: ${image.width}x${image.height}`);

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Detect background color from corners
    console.log('\n🎨 Detecting background color...');

    const samples = [];
    const sampleSize = 10;
    const width = canvas.width;
    const height = canvas.height;

    // Sample from corners
    for (let y = 0; y < sampleSize; y++) {
      for (let x = 0; x < sampleSize; x++) {
        const idx = (y * width + x) * 4;
        samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }
    }

    const avgR = samples.reduce((sum, s) => sum + s.r, 0) / samples.length;
    const avgG = samples.reduce((sum, s) => sum + s.g, 0) / samples.length;
    const avgB = samples.reduce((sum, s) => sum + s.b, 0) / samples.length;

    console.log(`Background color: RGB(${Math.round(avgR)}, ${Math.round(avgG)}, ${Math.round(avgB)})`);

    // Create mask by removing background
    console.log('\n🔍 Creating foreground mask...');

    const mask = new Uint8ClampedArray(width * height);
    const colorThreshold = 40;
    let foregroundPixels = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const diff = Math.sqrt(
          Math.pow(r - avgR, 2) +
          Math.pow(g - avgG, 2) +
          Math.pow(b - avgB, 2)
        );

        if (diff > colorThreshold) {
          mask[y * width + x] = 255;
          foregroundPixels++;
        }
      }
    }

    console.log(`Foreground pixels: ${foregroundPixels} (${(foregroundPixels/(width*height)*100).toFixed(1)}%)`);

    // Visualize the mask
    console.log('\n🎨 Creating mask visualization...');

    const visCanvas = createCanvas(width, height);
    const visCtx = visCanvas.getContext('2d');
    visCtx.drawImage(image, 0, 0);

    // Overlay mask in semi-transparent red
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y * width + x] === 255) {
          visCtx.fillStyle = 'rgba(255, 0, 0, 0.3)';
          visCtx.fillRect(x, y, 1, 1);
        }
      }
    }

    const outputPath = './debug-background-removal.png';
    const buffer = visCanvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    console.log(`✅ Visualization saved to: ${outputPath}`);
    console.log('\n💡 Red overlay shows detected foreground');

  } finally {
    await connection.end();
  }
}

testNewAlgorithm()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
