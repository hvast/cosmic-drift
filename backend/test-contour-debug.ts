import ContourExtractionService from './src/services/ContourExtractionService';
import CreatureRepository from './src/repositories/CreatureRepository';
import path from 'path';
import fs from 'fs';

/**
 * Debug script to test contour extraction on actual creature images
 */
async function testContourExtraction() {
  console.log('🔍 Starting contour extraction debug test...\n');

  try {
    // Get creatures from database
    const creatures = await CreatureRepository.findDrifting(10, 0);
    console.log(`Found ${creatures.length} creatures in database\n`);

    if (creatures.length === 0) {
      console.log('❌ No creatures found. Please create some creatures first.');
      return;
    }

    // Test first creature
    const testCreature = creatures[0];
    console.log('Testing creature:', {
      id: testCreature.id,
      name: testCreature.name,
      imageUrl: testCreature.imageUrl,
      hasContourData: !!testCreature.contourData
    });
    console.log('\n---\n');

    // Check if image file exists
    const imagePath = path.join(__dirname, '..', testCreature.imageUrl);
    console.log('Image path:', imagePath);

    if (!fs.existsSync(imagePath)) {
      console.log('❌ Image file does not exist!');
      return;
    }

    const imageStats = fs.statSync(imagePath);
    console.log('Image file size:', imageStats.size, 'bytes');
    console.log('\n---\n');

    // Extract contour
    console.log('🎨 Extracting contour from image...\n');
    const contourData = await ContourExtractionService.extractContour(imagePath);

    console.log('\n---\n');
    console.log('✅ Contour extraction result:');
    console.log('- Points count:', contourData.points.length);
    console.log('- Bounding box:', contourData.boundingBox);

    // Check first few points
    console.log('\n📍 First 10 points:');
    contourData.points.slice(0, 10).forEach((p, i) => {
      console.log(`  [${i}] x: ${p.x.toFixed(3)}, y: ${p.y.toFixed(3)}`);
    });

    // Check if points are all the same (indicating circle fallback)
    const uniqueX = new Set(contourData.points.map(p => p.x.toFixed(2)));
    const uniqueY = new Set(contourData.points.map(p => p.y.toFixed(2)));

    console.log('\n🔍 Uniqueness check:');
    console.log('- Unique X values:', uniqueX.size);
    console.log('- Unique Y values:', uniqueY.size);

    if (uniqueX.size < 10 || uniqueY.size < 10) {
      console.log('⚠️  WARNING: Very few unique values detected!');
      console.log('   This might be the default circle fallback.');
    }

    // Check if it's a perfect circle
    const avgDistance = contourData.points.reduce((sum, p) => {
      return sum + Math.sqrt(p.x * p.x + p.y * p.y);
    }, 0) / contourData.points.length;

    const distanceVariance = contourData.points.reduce((sum, p) => {
      const dist = Math.sqrt(p.x * p.x + p.y * p.y);
      return sum + Math.pow(dist - avgDistance, 2);
    }, 0) / contourData.points.length;

    console.log('\n📊 Shape analysis:');
    console.log('- Average distance from center:', avgDistance.toFixed(3));
    console.log('- Distance variance:', distanceVariance.toFixed(6));

    if (distanceVariance < 0.001) {
      console.log('⚠️  WARNING: This appears to be a perfect circle!');
      console.log('   The contour extraction likely failed and used the fallback.');
    } else {
      console.log('✅ Shape has variation - likely extracted from actual image!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
testContourExtraction()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
