// Visualize the final extracted contour
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const mysql = require('mysql2/promise');

async function visualizeFinalContour() {
  console.log('🎨 Visualizing Final Contour...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'cosmic_drift'
  });

  try {
    // Get first creature with contour data
    const [creatures] = await connection.execute(
      'SELECT id, name, image_url, contour_data FROM creatures WHERE contour_data IS NOT NULL LIMIT 1'
    );

    if (creatures.length === 0) {
      console.log('❌ No creatures with contour data found');
      return;
    }

    const creature = creatures[0];
    console.log('Visualizing creature:', creature.name);

    // Parse contour data
    let contourData;
    try {
      // Check if it's already an object
      if (typeof creature.contour_data === 'object') {
        contourData = creature.contour_data;
      } else {
        contourData = JSON.parse(creature.contour_data);
      }
    } catch (error) {
      console.error('Failed to parse contour_data:', error.message);
      console.log('Type:', typeof creature.contour_data);
      console.log('Value preview:', String(creature.contour_data).substring(0, 200));
      throw error;
    }

    console.log(`Contour points: ${contourData.points?.length || 0}`);
    console.log('Bounding box:', contourData.boundingBox);

    // Load original image
    const imageUrl = creature.image_url;
    const imagePath = imageUrl.replace('http://localhost:3001', '.');

    if (!fs.existsSync(imagePath)) {
      console.log('❌ Image file not found:', imagePath);
      return;
    }

    const image = await loadImage(imagePath);
    console.log(`Image size: ${image.width}x${image.height}`);

    // Create canvas
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // Draw original image
    ctx.drawImage(image, 0, 0);

    // Convert normalized contour points back to image coordinates
    const bb = contourData.boundingBox;
    const centerX = (bb.minX + bb.maxX) / 2;
    const centerY = (bb.minY + bb.maxY) / 2;
    const width = bb.maxX - bb.minX;
    const height = bb.maxY - bb.minY;
    const scale = Math.max(width, height) / 2;

    // Draw contour
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.beginPath();

    contourData.points.forEach((point, i) => {
      // Convert from normalized [-1, 1] to image coordinates
      const x = point.x * scale + centerX;
      const y = -point.y * scale + centerY; // Flip Y back

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Close the contour
    const firstPoint = contourData.points[0];
    const firstX = firstPoint.x * scale + centerX;
    const firstY = -firstPoint.y * scale + centerY;
    ctx.lineTo(firstX, firstY);

    ctx.stroke();

    // Draw center point
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw bounding box
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(bb.minX, bb.minY, width, height);

    // Save result
    const outputPath = './debug-final-contour.png';
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    console.log('\n✅ Visualization saved to:', outputPath);
    console.log('\n💡 Check the image to see:');
    console.log('   - Red line: Extracted contour');
    console.log('   - Blue dot: Center point');
    console.log('   - Green dashed box: Bounding box');

  } finally {
    await connection.end();
  }
}

visualizeFinalContour()
  .then(() => {
    console.log('\n✅ Visualization completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
