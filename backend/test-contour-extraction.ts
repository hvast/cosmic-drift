/**
 * Test script for ContourExtractionService
 * Tests contour extraction with different types of images
 */

import ContourExtractionService from './src/services/ContourExtractionService';
import { createCanvas } from 'canvas';

// Helper function to create test images
function createTestImage(type: 'simple' | 'complex' | 'transparent'): string {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  if (type !== 'transparent') {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 200, 200);
  }
  
  switch (type) {
    case 'simple':
      // Simple circle
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(100, 100, 60, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'complex':
      // Complex star shape
      ctx.fillStyle = 'black';
      ctx.beginPath();
      const points = 5;
      const outerRadius = 80;
      const innerRadius = 40;
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points;
        const x = 100 + radius * Math.cos(angle - Math.PI / 2);
        const y = 100 + radius * Math.sin(angle - Math.PI / 2);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      break;
      
    case 'transparent':
      // Circle with transparent background
      ctx.fillStyle = 'rgba(0, 0, 0, 255)';
      ctx.beginPath();
      ctx.arc(100, 100, 60, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  
  return canvas.toDataURL();
}

// Test results interface
interface TestResult {
  testName: string;
  passed: boolean;
  pointCount: number;
  executionTime: number;
  error?: string;
}

async function runTests(): Promise<void> {
  console.log('='.repeat(60));
  console.log('ContourExtractionService Test Suite');
  console.log('='.repeat(60));
  console.log();
  
  const results: TestResult[] = [];
  
  // Test 1: Simple circle
  console.log('Test 1: Simple Circle Image');
  console.log('-'.repeat(60));
  try {
    const startTime = Date.now();
    const imageData = createTestImage('simple');
    const contourData = await ContourExtractionService.extractContour(imageData);
    const executionTime = Date.now() - startTime;
    
    const pointCount = contourData.points.length;
    const passed = pointCount >= 100 && pointCount <= 500;
    
    console.log(`✓ Extraction completed in ${executionTime}ms`);
    console.log(`✓ Point count: ${pointCount}`);
    console.log(`✓ Bounding box: [${contourData.boundingBox.minX.toFixed(2)}, ${contourData.boundingBox.maxX.toFixed(2)}] x [${contourData.boundingBox.minY.toFixed(2)}, ${contourData.boundingBox.maxY.toFixed(2)}]`);
    console.log(`✓ Test ${passed ? 'PASSED' : 'FAILED'}: Point count in range [100, 500]`);
    
    results.push({
      testName: 'Simple Circle',
      passed,
      pointCount,
      executionTime,
    });
  } catch (error) {
    console.log(`✗ Test FAILED: ${error}`);
    results.push({
      testName: 'Simple Circle',
      passed: false,
      pointCount: 0,
      executionTime: 0,
      error: String(error),
    });
  }
  console.log();
  
  // Test 2: Complex star shape
  console.log('Test 2: Complex Star Shape');
  console.log('-'.repeat(60));
  try {
    const startTime = Date.now();
    const imageData = createTestImage('complex');
    const contourData = await ContourExtractionService.extractContour(imageData);
    const executionTime = Date.now() - startTime;
    
    const pointCount = contourData.points.length;
    const passed = pointCount >= 100 && pointCount <= 500;
    
    console.log(`✓ Extraction completed in ${executionTime}ms`);
    console.log(`✓ Point count: ${pointCount}`);
    console.log(`✓ Bounding box: [${contourData.boundingBox.minX.toFixed(2)}, ${contourData.boundingBox.maxX.toFixed(2)}] x [${contourData.boundingBox.minY.toFixed(2)}, ${contourData.boundingBox.maxY.toFixed(2)}]`);
    console.log(`✓ Test ${passed ? 'PASSED' : 'FAILED'}: Point count in range [100, 500]`);
    
    results.push({
      testName: 'Complex Star',
      passed,
      pointCount,
      executionTime,
    });
  } catch (error) {
    console.log(`✗ Test FAILED: ${error}`);
    results.push({
      testName: 'Complex Star',
      passed: false,
      pointCount: 0,
      executionTime: 0,
      error: String(error),
    });
  }
  console.log();
  
  // Test 3: Transparent background
  console.log('Test 3: Transparent Background');
  console.log('-'.repeat(60));
  try {
    const startTime = Date.now();
    const imageData = createTestImage('transparent');
    const contourData = await ContourExtractionService.extractContour(imageData);
    const executionTime = Date.now() - startTime;
    
    const pointCount = contourData.points.length;
    const passed = pointCount >= 100 && pointCount <= 500;
    
    console.log(`✓ Extraction completed in ${executionTime}ms`);
    console.log(`✓ Point count: ${pointCount}`);
    console.log(`✓ Bounding box: [${contourData.boundingBox.minX.toFixed(2)}, ${contourData.boundingBox.maxX.toFixed(2)}] x [${contourData.boundingBox.minY.toFixed(2)}, ${contourData.boundingBox.maxY.toFixed(2)}]`);
    console.log(`✓ Test ${passed ? 'PASSED' : 'FAILED'}: Point count in range [100, 500]`);
    
    results.push({
      testName: 'Transparent Background',
      passed,
      pointCount,
      executionTime,
    });
  } catch (error) {
    console.log(`✗ Test FAILED: ${error}`);
    results.push({
      testName: 'Transparent Background',
      passed: false,
      pointCount: 0,
      executionTime: 0,
      error: String(error),
    });
  }
  console.log();
  
  // Test 4: Execution time (should be < 3000ms)
  console.log('Test 4: Execution Time Performance');
  console.log('-'.repeat(60));
  try {
    const startTime = Date.now();
    const imageData = createTestImage('simple');
    await ContourExtractionService.extractContour(imageData);
    const executionTime = Date.now() - startTime;
    
    const passed = executionTime < 3000;
    
    console.log(`✓ Extraction completed in ${executionTime}ms`);
    console.log(`✓ Test ${passed ? 'PASSED' : 'FAILED'}: Execution time < 3000ms`);
    
    results.push({
      testName: 'Execution Time',
      passed,
      pointCount: 0,
      executionTime,
    });
  } catch (error) {
    console.log(`✗ Test FAILED: ${error}`);
    results.push({
      testName: 'Execution Time',
      passed: false,
      pointCount: 0,
      executionTime: 0,
      error: String(error),
    });
  }
  console.log();
  
  // Test 5: Smoothing effect (verify points are smoothed)
  console.log('Test 5: Contour Smoothing');
  console.log('-'.repeat(60));
  try {
    const imageData = createTestImage('simple');
    const contourData = await ContourExtractionService.extractContour(imageData);
    
    // Check if points are reasonably distributed (not all clustered)
    const points = contourData.points;
    let totalDistance = 0;
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      const distance = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
      );
      totalDistance += distance;
    }
    const avgDistance = totalDistance / points.length;
    
    // Average distance should be reasonable (not too small, indicating clustering)
    const passed = avgDistance > 0.001 && avgDistance < 0.5;
    
    console.log(`✓ Average point distance: ${avgDistance.toFixed(4)}`);
    console.log(`✓ Test ${passed ? 'PASSED' : 'FAILED'}: Points are well-distributed`);
    
    results.push({
      testName: 'Contour Smoothing',
      passed,
      pointCount: points.length,
      executionTime: 0,
    });
  } catch (error) {
    console.log(`✗ Test FAILED: ${error}`);
    results.push({
      testName: 'Contour Smoothing',
      passed: false,
      pointCount: 0,
      executionTime: 0,
      error: String(error),
    });
  }
  console.log();
  
  // Test 6: Normalization (verify coordinates are in [-1, 1])
  console.log('Test 6: Coordinate Normalization');
  console.log('-'.repeat(60));
  try {
    const imageData = createTestImage('simple');
    const contourData = await ContourExtractionService.extractContour(imageData);
    
    // Check if all points are within [-1, 1] range
    const points = contourData.points;
    let allInRange = true;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
      
      if (point.x < -1.1 || point.x > 1.1 || point.y < -1.1 || point.y > 1.1) {
        allInRange = false;
      }
    }
    
    const passed = allInRange;
    
    console.log(`✓ X range: [${minX.toFixed(3)}, ${maxX.toFixed(3)}]`);
    console.log(`✓ Y range: [${minY.toFixed(3)}, ${maxY.toFixed(3)}]`);
    console.log(`✓ Test ${passed ? 'PASSED' : 'FAILED'}: All coordinates in [-1, 1] range`);
    
    results.push({
      testName: 'Coordinate Normalization',
      passed,
      pointCount: points.length,
      executionTime: 0,
    });
  } catch (error) {
    console.log(`✗ Test FAILED: ${error}`);
    results.push({
      testName: 'Coordinate Normalization',
      passed: false,
      pointCount: 0,
      executionTime: 0,
      error: String(error),
    });
  }
  console.log();
  
  // Summary
  console.log('='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  console.log(`Total: ${totalCount} tests`);
  console.log(`Passed: ${passedCount} tests`);
  console.log(`Failed: ${totalCount - passedCount} tests`);
  console.log();
  
  results.forEach(result => {
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${status} - ${result.testName}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  });
  console.log();
  
  if (passedCount === totalCount) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please review the results above.');
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
