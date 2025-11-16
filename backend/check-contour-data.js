// Simple script to check contour data in database
const mysql = require('mysql2/promise');

async function checkContourData() {
  console.log('🔍 Checking contour data in database...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'cosmic_drift'
  });

  try {
    // Get all creatures with their contour data
    const [creatures] = await connection.execute(
      'SELECT id, name, image_url, contour_data FROM creatures LIMIT 5'
    );

    console.log(`Found ${creatures.length} creatures\n`);

    creatures.forEach((creature, index) => {
      console.log(`\n--- Creature ${index + 1} ---`);
      console.log('ID:', creature.id);
      console.log('Name:', creature.name);
      console.log('Image URL:', creature.image_url);

      if (creature.contour_data) {
        try {
          // MySQL JSON type is already parsed by mysql2
          const contourData = creature.contour_data;
          console.log('✅ Has contour data');
          console.log('  - Points count:', contourData.points?.length || 0);
          console.log('  - Bounding box:', contourData.boundingBox);

          if (contourData.points && contourData.points.length > 0) {
            // Check first few points
            console.log('  - First 3 points:');
            contourData.points.slice(0, 3).forEach((p, i) => {
              console.log(`    [${i}] x: ${p.x.toFixed(3)}, y: ${p.y.toFixed(3)}`);
            });

            // Check if it's a circle (all points same distance from center)
            const distances = contourData.points.map(p =>
              Math.sqrt(p.x * p.x + p.y * p.y)
            );
            const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length;
            const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDist, 2), 0) / distances.length;

            console.log('  - Shape analysis:');
            console.log('    Average distance:', avgDist.toFixed(4));
            console.log('    Variance:', variance.toFixed(6));

            if (variance < 0.001) {
              console.log('    ⚠️  Looks like a perfect circle (fallback)');
            } else {
              console.log('    ✅ Has shape variation (real contour)');
            }
          }
        } catch (e) {
          console.log('❌ Error parsing contour data:', e.message);
        }
      } else {
        console.log('❌ No contour data');
      }
    });

  } finally {
    await connection.end();
  }
}

checkContourData()
  .then(() => {
    console.log('\n\n✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
