/**
 * Test script to check if creatures have contour data
 */

import CreatureRepository from './src/repositories/CreatureRepository';

async function testCreatureContour() {
  console.log('='.repeat(60));
  console.log('Checking Creature Contour Data');
  console.log('='.repeat(60));
  console.log();

  try {
    // Get all drifting creatures
    const creatures = await CreatureRepository.findDrifting(10, 0);
    
    console.log(`Found ${creatures.length} drifting creatures`);
    console.log();

    if (creatures.length === 0) {
      console.log('⚠️  No creatures found in database');
      console.log('Please create a creature first to test contour data');
      return;
    }

    // Check each creature for contour data
    creatures.forEach((creature, index) => {
      console.log(`${index + 1}. ${creature.name} (${creature.id})`);
      console.log(`   Species: ${creature.species}`);
      console.log(`   Emotion: ${creature.emotionValue}`);
      
      if (creature.contourData) {
        console.log(`   ✅ Has contour data: ${creature.contourData.points.length} points`);
        console.log(`   Bounding box: [${creature.contourData.boundingBox.minX.toFixed(2)}, ${creature.contourData.boundingBox.maxX.toFixed(2)}] x [${creature.contourData.boundingBox.minY.toFixed(2)}, ${creature.contourData.boundingBox.maxY.toFixed(2)}]`);
      } else {
        console.log(`   ❌ No contour data`);
      }
      console.log();
    });

    // Summary
    const withContour = creatures.filter(c => c.contourData).length;
    const withoutContour = creatures.length - withContour;

    console.log('='.repeat(60));
    console.log('Summary');
    console.log('='.repeat(60));
    console.log(`Total creatures: ${creatures.length}`);
    console.log(`With contour data: ${withContour}`);
    console.log(`Without contour data: ${withoutContour}`);
    console.log();

    if (withoutContour > 0) {
      console.log('⚠️  Some creatures are missing contour data');
      console.log('These creatures were created before the contour extraction feature was added.');
      console.log('You can:');
      console.log('1. Create new creatures (they will have contour data)');
      console.log('2. Or manually regenerate contour data for existing creatures');
    } else {
      console.log('✅ All creatures have contour data!');
    }

  } catch (error) {
    console.error('Error:', error);
  }

  process.exit(0);
}

testCreatureContour();
