// Test the new convex hull contour extraction
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const mysql = require('mysql2/promise');

async function testConvexHullExtraction() {
  console.log('🧪 Testing Convex Hull Contour Extraction...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'cosmic_drift'
  });

  try {
    // Trigger contour extraction via HTTP API
    const http = require('http');

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
    console.log('Creature ID:', creature.id);

    // Make HTTP request to trigger contour extraction
    console.log('\n📡 Triggering contour extraction via API...');

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/creatures/${creature.id}/contour`,
      method: 'GET'
    };

    await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          console.log('✅ API Response:', res.statusCode);

          if (res.statusCode === 200) {
            const contourData = JSON.parse(data);
            console.log('\n📊 Contour Data:');
            console.log(`   - Points: ${contourData.points?.length || 0}`);
            console.log(`   - Bounding box:`, contourData.boundingBox);

            if (contourData.points && contourData.points.length > 0) {
              console.log(`   - First 3 points:`);
              for (let i = 0; i < Math.min(3, contourData.points.length); i++) {
                const p = contourData.points[i];
                console.log(`     [${i}] x: ${p.x.toFixed(3)}, y: ${p.y.toFixed(3)}`);
              }
            }
          } else {
            console.log('Response:', data);
          }

          resolve();
        });
      });

      req.on('error', (error) => {
        console.error('❌ Request failed:', error.message);
        reject(error);
      });

      req.end();
    });

    // Wait a moment for DB to update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check database again
    console.log('\n🔍 Checking database...');
    const [updated] = await connection.execute(
      'SELECT contour_data FROM creatures WHERE id = ?',
      [creature.id]
    );

    if (updated[0].contour_data) {
      const contourData = JSON.parse(updated[0].contour_data);
      console.log('✅ Contour data saved to database');
      console.log(`   - Points: ${contourData.points?.length || 0}`);
      console.log(`   - Bounding box:`, contourData.boundingBox);

      // Analyze bounding box
      const bb = contourData.boundingBox;
      if (bb) {
        const width = bb.maxX - bb.minX;
        const height = bb.maxY - bb.minY;
        const aspectRatio = width / height;

        console.log(`\n📏 Bounding Box Analysis:`);
        console.log(`   - Width: ${width.toFixed(1)}px`);
        console.log(`   - Height: ${height.toFixed(1)}px`);
        console.log(`   - Aspect ratio: ${aspectRatio.toFixed(2)}`);

        if (height < 10) {
          console.log('   ⚠️  WARNING: Bounding box is too flat! (height < 10px)');
        } else if (aspectRatio > 10 || aspectRatio < 0.1) {
          console.log('   ⚠️  WARNING: Bounding box has extreme aspect ratio!');
        } else {
          console.log('   ✅ Bounding box looks reasonable');
        }
      }
    } else {
      console.log('⚠️  No contour data in database');
    }

  } finally {
    await connection.end();
  }
}

testConvexHullExtraction()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
