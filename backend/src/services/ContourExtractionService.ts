import { createCanvas, loadImage, Canvas } from 'canvas';

/**
 * Represents a point in 2D space
 */
export interface ContourPoint {
  x: number;
  y: number;
}

/**
 * Represents a normalized 2D vector
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Represents extracted contour data with bounding box
 */
export interface ContourData {
  points: Vector2[];
  boundingBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

/**
 * Service for extracting contours from images using alpha channel and edge detection
 * OPTIMIZED VERSION - Uses alpha channel for better accuracy
 */
class ContourExtractionService {
  private readonly targetPointCount: number = 300; // Increased to 300 for smoother contours
  private readonly smoothingIterations: number = 5; // More smoothing for better visuals
  private readonly timeoutMs: number = 5000; // 5 second timeout

  constructor() {
    console.log('✨ ContourExtractionService initialized (Optimized Alpha Channel Version)');
  }

  /**
   * Extract contour from image URL or base64 data
   * @param imageData - Image URL or base64 string
   * @returns Promise<ContourData> - Extracted and normalized contour data
   */
  async extractContour(imageData: string): Promise<ContourData> {
    try {
      // Implement timeout wrapper
      const contourPromise = this.extractContourInternal(imageData);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Contour extraction timeout')), this.timeoutMs);
      });

      return await Promise.race([contourPromise, timeoutPromise]);
    } catch (error) {
      console.error('❌ Contour extraction failed:', error);
      return this.getDefaultCircleContour();
    }
  }

  /**
   * Internal method to extract contour
   */
  private async extractContourInternal(imageData: string): Promise<ContourData> {
    try {
      // Load image to canvas
      const canvas = await this.loadImageToCanvas(imageData);
      console.log(`📐 Image loaded: ${canvas.width}x${canvas.height}`);

      // Try alpha channel extraction first (better for PNG with transparency)
      let rawPoints = this.extractContourFromAlpha(canvas);

      // If alpha extraction failed, fall back to edge detection
      if (rawPoints.length < 50) {
        console.log('⚠️  Alpha channel extraction failed, trying edge detection...');
        rawPoints = this.extractContourFromEdges(canvas);
      }

      console.log(`🔍 Extracted ${rawPoints.length} raw contour points`);

      // Check if we have enough points (lowered to 4 since we use convex hull + interpolation)
      if (rawPoints.length < 4) {
        console.warn(`⚠️  Too few contour points (${rawPoints.length}), using default contour`);
        return this.getDefaultCircleContour();
      }

      // Smooth the contour
      const smoothedPoints = this.smoothContour(rawPoints, this.smoothingIterations);
      console.log(`✨ Smoothed contour with ${this.smoothingIterations} iterations`);

      // Sample to target point count
      const sampledPoints = this.sampleContour(smoothedPoints, this.targetPointCount);
      console.log(`🎯 Sampled to ${sampledPoints.length} points`);

      // Normalize coordinates
      const contourData = this.normalizeContour(sampledPoints);
      console.log('✅ Contour extraction completed successfully');

      return contourData;
    } catch (error) {
      console.error('❌ Error in extractContourInternal:', error);
      throw error;
    }
  }

  /**
   * Load image to canvas
   * @param imageData - Image URL or base64 string
   * @returns Promise<Canvas> - Canvas with loaded image
   */
  private async loadImageToCanvas(imageData: string): Promise<Canvas> {
    try {
      const image = await loadImage(imageData);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      return canvas;
    } catch (error) {
      console.error('Failed to load image to canvas:', error);
      throw error;
    }
  }

  /**
   * Extract contour from alpha channel (best for PNG with transparency)
   * @param canvas - Canvas with image data
   * @returns ContourPoint[] - Raw contour points
   */
  private extractContourFromAlpha(canvas: Canvas): ContourPoint[] {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Check if image has transparency
    let transparentPixels = 0;
    const alphaThreshold = 50;

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 200) {
        transparentPixels++;
      }
    }

    const totalPixels = width * height;
    const transparencyRatio = transparentPixels / totalPixels;

    console.log(`   Alpha analysis: ${(transparencyRatio * 100).toFixed(1)}% non-opaque pixels`);

    // If no significant transparency, try background removal
    if (transparencyRatio < 0.05) {
      console.log('   ⚠️  No transparency detected, trying background removal...');
      return this.extractContourWithBackgroundRemoval(canvas);
    }

    // Create binary mask from alpha channel
    const alphaMask = new Uint8ClampedArray(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const alpha = data[idx + 3]; // Alpha channel
        alphaMask[y * width + x] = alpha > alphaThreshold ? 255 : 0;
      }
    }

    // Find contours in alpha mask
    const contours = this.findContours(alphaMask, width, height);

    // Return the largest contour
    if (contours.length > 0) {
      const largestContour = contours.reduce((max, contour) =>
        contour.length > max.length ? contour : max
      );
      console.log(`   🎨 Found ${contours.length} alpha contours, using largest with ${largestContour.length} points`);
      return largestContour;
    }

    return [];
  }

  /**
   * Extract contour by detecting and removing background
   * @param canvas - Canvas with image data
   * @returns ContourPoint[] - Raw contour points
   */
  private extractContourWithBackgroundRemoval(canvas: Canvas): ContourPoint[] {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Detect background color from corners
    const backgroundColor = this.detectBackgroundColor(data, width, height);
    console.log(`   🎨 Detected background color: RGB(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b})`);

    // Calculate adaptive threshold based on image variance
    const colorDifferences: number[] = [];
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

    // Sort and find a good threshold (use 25th percentile)
    colorDifferences.sort((a, b) => a - b);
    const percentile25 = colorDifferences[Math.floor(colorDifferences.length * 0.25)];
    const percentile75 = colorDifferences[Math.floor(colorDifferences.length * 0.75)];

    // Use adaptive threshold between 25th and 75th percentile
    const colorThreshold = Math.max(15, Math.min(60, (percentile25 + percentile75) / 2));
    console.log(`   📊 Adaptive threshold: ${colorThreshold.toFixed(1)} (25th: ${percentile25.toFixed(1)}, 75th: ${percentile75.toFixed(1)})`);

    // Create binary mask by removing background
    const mask = new Uint8ClampedArray(width * height);
    let foregroundPixels = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Calculate color difference from background
        const diff = Math.sqrt(
          Math.pow(r - backgroundColor.r, 2) +
          Math.pow(g - backgroundColor.g, 2) +
          Math.pow(b - backgroundColor.b, 2)
        );

        // Foreground if color is different enough from background
        if (diff > colorThreshold) {
          mask[y * width + x] = 255;
          foregroundPixels++;
        }
      }
    }

    const foregroundRatio = foregroundPixels / (width * height);
    console.log(`   📍 Foreground pixels: ${(foregroundRatio * 100).toFixed(1)}%`);

    // Apply morphological operations to clean up the mask
    const cleanedMask = this.morphologicalClose(mask, width, height);

    // Find contours in cleaned mask
    const contours = this.findContours(cleanedMask, width, height);

    // Return the largest contour
    if (contours.length > 0) {
      const largestContour = contours.reduce((max, contour) =>
        contour.length > max.length ? contour : max
      );
      console.log(`   🎨 Found ${contours.length} background-removed contours, using largest with ${largestContour.length} points`);
      return largestContour;
    }

    return [];
  }

  /**
   * Detect background color from image corners
   * @param data - Image data array
   * @param width - Image width
   * @param height - Image height
   * @returns RGB color
   */
  private detectBackgroundColor(data: Uint8ClampedArray, width: number, height: number): { r: number; g: number; b: number } {
    const samples: Array<{ r: number; g: number; b: number }> = [];

    // Sample from corners and edges
    const sampleSize = 10;

    // Top-left corner
    for (let y = 0; y < sampleSize && y < height; y++) {
      for (let x = 0; x < sampleSize && x < width; x++) {
        const idx = (y * width + x) * 4;
        samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }
    }

    // Top-right corner
    for (let y = 0; y < sampleSize && y < height; y++) {
      for (let x = Math.max(0, width - sampleSize); x < width; x++) {
        const idx = (y * width + x) * 4;
        samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }
    }

    // Bottom-left corner
    for (let y = Math.max(0, height - sampleSize); y < height; y++) {
      for (let x = 0; x < sampleSize && x < width; x++) {
        const idx = (y * width + x) * 4;
        samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }
    }

    // Bottom-right corner
    for (let y = Math.max(0, height - sampleSize); y < height; y++) {
      for (let x = Math.max(0, width - sampleSize); x < width; x++) {
        const idx = (y * width + x) * 4;
        samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }
    }

    // Calculate average color
    const avgR = samples.reduce((sum, s) => sum + s.r, 0) / samples.length;
    const avgG = samples.reduce((sum, s) => sum + s.g, 0) / samples.length;
    const avgB = samples.reduce((sum, s) => sum + s.b, 0) / samples.length;

    return {
      r: Math.round(avgR),
      g: Math.round(avgG),
      b: Math.round(avgB)
    };
  }

  /**
   * Apply morphological closing operation (dilation followed by erosion)
   * Helps fill small holes and connect nearby regions
   * @param binary - Binary image
   * @param width - Image width
   * @param height - Image height
   * @returns Cleaned binary image
   */
  private morphologicalClose(binary: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    // Dilate then erode
    const dilated = this.dilate(binary, width, height);
    const closed = this.erode(dilated, width, height);
    return closed;
  }

  /**
   * Dilate binary image (expand white regions)
   */
  private dilate(binary: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const result = new Uint8ClampedArray(width * height);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let hasWhiteNeighbor = false;

        // Check 3x3 neighborhood
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (binary[(y + dy) * width + (x + dx)] === 255) {
              hasWhiteNeighbor = true;
              break;
            }
          }
          if (hasWhiteNeighbor) break;
        }

        result[y * width + x] = hasWhiteNeighbor ? 255 : 0;
      }
    }

    return result;
  }

  /**
   * Erode binary image (shrink white regions)
   */
  private erode(binary: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const result = new Uint8ClampedArray(width * height);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let allWhite = true;

        // Check 3x3 neighborhood
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (binary[(y + dy) * width + (x + dx)] === 0) {
              allWhite = false;
              break;
            }
          }
          if (!allWhite) break;
        }

        result[y * width + x] = allWhite ? 255 : 0;
      }
    }

    return result;
  }

  /**
   * Extract contour from edges (fallback method)
   * @param canvas - Canvas with image data
   * @returns ContourPoint[] - Raw contour points
   */
  private extractContourFromEdges(canvas: Canvas): ContourPoint[] {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Apply Canny-inspired edge detection with higher threshold
    const edges = this.applyEdgeDetection(imageData);

    // Find contours in edge map
    const contours = this.findContours(edges, canvas.width, canvas.height);

    // Return the largest contour
    if (contours.length > 0) {
      const largestContour = contours.reduce((max, contour) =>
        contour.length > max.length ? contour : max
      );
      console.log(`🔍 Found ${contours.length} edge contours, using largest with ${largestContour.length} points`);
      return largestContour;
    }

    return [];
  }

  /**
   * Apply edge detection with improved algorithm
   * @param imageData - Image data from canvas
   * @returns Uint8ClampedArray - Edge map (binary: 255 = edge, 0 = no edge)
   */
  private applyEdgeDetection(imageData: { data: Uint8ClampedArray; width: number; height: number }): Uint8ClampedArray {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const edges = new Uint8ClampedArray(width * height);

    // Sobel kernels
    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ];
    const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ];

    // Convert to grayscale and apply Sobel
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0;
        let gy = 0;

        // Apply Sobel kernels
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            // Convert to grayscale (weighted average for better perception)
            const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;

            gx += gray * sobelX[ky + 1][kx + 1];
            gy += gray * sobelY[ky + 1][kx + 1];
          }
        }

        // Calculate gradient magnitude
        const magnitude = Math.sqrt(gx * gx + gy * gy);

        // Higher threshold for cleaner edges (reduced noise)
        const threshold = 100; // Increased from 50
        edges[y * width + x] = magnitude > threshold ? 255 : 0;
      }
    }

    return edges;
  }

  /**
   * Find all contours in binary image
   * IMPROVED APPROACH: Sort all boundary pixels by angle to preserve shape details
   * This works better for complex shapes and preserves concave features
   * @param binary - Binary image (255 = foreground, 0 = background)
   * @param width - Image width
   * @param height - Image height
   * @returns ContourPoint[][] - Array of contours
   */
  private findContours(binary: Uint8ClampedArray, width: number, height: number): ContourPoint[][] {
    // Collect all boundary pixels
    const boundaryPixels: ContourPoint[] = [];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;

        // Check if this is a boundary pixel (foreground with at least one background neighbor)
        if (binary[idx] === 255) {
          const isBoundary = this.isBoundaryPixel(binary, x, y, width, height);

          if (isBoundary) {
            boundaryPixels.push({ x, y });
          }
        }
      }
    }

    console.log(`   📍 Found ${boundaryPixels.length} total boundary pixels`);

    if (boundaryPixels.length < 20) {
      return [];
    }

    // Use nearest neighbor algorithm to connect boundary pixels
    // This preserves both inner and outer contours of line drawings
    const connectedPixels = this.connectByNearestNeighbor(boundaryPixels);

    console.log(`   🔗 Connected ${connectedPixels.length} pixels by nearest neighbor`);

    // Return connected pixels as single contour
    return [connectedPixels];
  }

  /**
   * Connect pixels using nearest neighbor algorithm
   * This creates a path that follows the actual boundary lines
   * @param pixels - Boundary pixels
   * @returns ContourPoint[] - Connected pixels
   */
  private connectByNearestNeighbor(pixels: ContourPoint[]): ContourPoint[] {
    if (pixels.length === 0) {
      return [];
    }

    const remaining = new Set(pixels.map((_, i) => i));
    const result: ContourPoint[] = [];

    // Start from the top-left pixel
    let currentIdx = 0;
    let minVal = Infinity;
    pixels.forEach((p, i) => {
      const val = p.y * 10000 + p.x; // Top-left first
      if (val < minVal) {
        minVal = val;
        currentIdx = i;
      }
    });

    result.push(pixels[currentIdx]);
    remaining.delete(currentIdx);

    // Connect by nearest neighbor
    while (remaining.size > 0) {
      const current = pixels[currentIdx];
      let nearestIdx = -1;
      let nearestDist = Infinity;

      for (const idx of remaining) {
        const p = pixels[idx];
        const dist = Math.pow(p.x - current.x, 2) + Math.pow(p.y - current.y, 2);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = idx;
        }
      }

      if (nearestIdx === -1) break;

      result.push(pixels[nearestIdx]);
      remaining.delete(nearestIdx);
      currentIdx = nearestIdx;
    }

    return result;
  }

  /**
   * Check if pixel is on boundary
   */
  private isBoundaryPixel(binary: Uint8ClampedArray, x: number, y: number, width: number, height: number): boolean {
    // Check 8-connected neighbors
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          if (binary[ny * width + nx] === 0) {
            return true; // Has at least one background neighbor
          }
        }
      }
    }

    return false;
  }


  /**
   * Compute convex hull using Graham Scan algorithm
   * Returns points in counter-clockwise order
   * @param points - Input points
   * @returns ContourPoint[] - Convex hull points
   */
  private convexHull(points: ContourPoint[]): ContourPoint[] {
    if (points.length < 3) {
      return points;
    }

    // Find the point with lowest y coordinate (bottom-most)
    // If tied, choose leftmost
    let lowestIdx = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].y > points[lowestIdx].y ||
          (points[i].y === points[lowestIdx].y && points[i].x < points[lowestIdx].x)) {
        lowestIdx = i;
      }
    }

    const pivot = points[lowestIdx];

    // Sort points by polar angle with respect to pivot
    const sortedPoints = points
      .filter((p, idx) => idx !== lowestIdx)
      .map(p => ({
        point: p,
        angle: Math.atan2(p.y - pivot.y, p.x - pivot.x),
        dist: Math.sqrt(Math.pow(p.x - pivot.x, 2) + Math.pow(p.y - pivot.y, 2))
      }))
      .sort((a, b) => {
        if (Math.abs(a.angle - b.angle) < 1e-9) {
          return a.dist - b.dist; // If same angle, closer point first
        }
        return a.angle - b.angle;
      })
      .map(item => item.point);

    // Graham scan
    const hull: ContourPoint[] = [pivot];

    for (const point of sortedPoints) {
      // Remove points that make clockwise turn
      while (hull.length >= 2) {
        const p1 = hull[hull.length - 2];
        const p2 = hull[hull.length - 1];
        const cross = this.crossProduct(p1, p2, point);

        if (cross <= 0) {
          hull.pop(); // Clockwise or collinear, remove
        } else {
          break; // Counter-clockwise, keep
        }
      }

      hull.push(point);
    }

    return hull;
  }

  /**
   * Calculate cross product for three points
   * Positive = counter-clockwise, Negative = clockwise, Zero = collinear
   */
  private crossProduct(p1: ContourPoint, p2: ContourPoint, p3: ContourPoint): number {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  }

  /**
   * Smooth contour points using Gaussian smoothing
   * @param points - Raw contour points
   * @param iterations - Number of smoothing iterations
   * @returns ContourPoint[] - Smoothed contour points
   */
  private smoothContour(points: ContourPoint[], iterations: number): ContourPoint[] {
    if (points.length < 5) {
      return points;
    }

    let smoothed = [...points];

    // Apply Gaussian smoothing multiple times for smoother curves
    for (let iter = 0; iter < iterations; iter++) {
      const newPoints: ContourPoint[] = [];

      for (let i = 0; i < smoothed.length; i++) {
        // Use 5-point Gaussian kernel: [0.06, 0.24, 0.40, 0.24, 0.06]
        const prev2 = smoothed[(i - 2 + smoothed.length) % smoothed.length];
        const prev1 = smoothed[(i - 1 + smoothed.length) % smoothed.length];
        const curr = smoothed[i];
        const next1 = smoothed[(i + 1) % smoothed.length];
        const next2 = smoothed[(i + 2) % smoothed.length];

        const x = prev2.x * 0.06 + prev1.x * 0.24 + curr.x * 0.40 + next1.x * 0.24 + next2.x * 0.06;
        const y = prev2.y * 0.06 + prev1.y * 0.24 + curr.y * 0.40 + next1.y * 0.24 + next2.y * 0.06;

        newPoints.push({ x, y });
      }

      smoothed = newPoints;
    }

    return smoothed;
  }

  /**
   * Sample contour to target point count with uniform distribution
   * @param points - Contour points
   * @param targetCount - Target number of points
   * @returns ContourPoint[] - Sampled contour points
   */
  private sampleContour(points: ContourPoint[], targetCount: number): ContourPoint[] {
    if (points.length === 0) {
      return [];
    }

    if (points.length <= targetCount) {
      // If we have fewer points, interpolate to add more
      return this.interpolatePoints(points, targetCount);
    }

    // Calculate cumulative distances for uniform sampling
    const distances: number[] = [0];
    let totalDistance = 0;

    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      totalDistance += dist;
      distances.push(totalDistance);
    }

    // Sample uniformly along the contour
    const sampledPoints: ContourPoint[] = [];
    const step = totalDistance / targetCount;

    for (let i = 0; i < targetCount; i++) {
      const targetDist = i * step;

      // Find the segment containing this distance
      let segmentIdx = 0;
      for (let j = 0; j < distances.length - 1; j++) {
        if (distances[j] <= targetDist && targetDist < distances[j + 1]) {
          segmentIdx = j;
          break;
        }
      }

      // Interpolate within the segment
      const segmentStart = distances[segmentIdx];
      const segmentEnd = distances[segmentIdx + 1];
      const segmentLength = segmentEnd - segmentStart;
      const t = segmentLength > 0 ? (targetDist - segmentStart) / segmentLength : 0;

      const p1 = points[segmentIdx];
      const p2 = points[(segmentIdx + 1) % points.length];

      sampledPoints.push({
        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t
      });
    }

    return sampledPoints;
  }

  /**
   * Interpolate points to reach target count
   * @param points - Original points
   * @param targetCount - Target number of points
   * @returns ContourPoint[] - Interpolated points
   */
  private interpolatePoints(points: ContourPoint[], targetCount: number): ContourPoint[] {
    if (points.length === 0) {
      return [];
    }

    const interpolated: ContourPoint[] = [];

    for (let i = 0; i < targetCount; i++) {
      const t = (i / targetCount) * points.length;
      const index1 = Math.floor(t) % points.length;
      const index2 = (index1 + 1) % points.length;
      const fraction = t - Math.floor(t);

      const p1 = points[index1];
      const p2 = points[index2];

      // Linear interpolation
      interpolated.push({
        x: p1.x + (p2.x - p1.x) * fraction,
        y: p1.y + (p2.y - p1.y) * fraction
      });
    }

    return interpolated;
  }

  /**
   * Normalize contour coordinates to [-1, 1] range
   * Y-axis is flipped to match rendering coordinate system
   * @param points - Contour points
   * @returns ContourData - Normalized contour data with bounding box
   */
  private normalizeContour(points: ContourPoint[]): ContourData {
    if (points.length === 0) {
      return {
        points: [],
        boundingBox: { minX: 0, maxX: 0, minY: 0, maxY: 0 }
      };
    }

    // Find bounding box
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }

    // Calculate center and scale
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const width = maxX - minX;
    const height = maxY - minY;
    const scale = Math.max(width, height) / 2;

    // Normalize to [-1, 1] with Y-axis flipped for rendering
    const normalizedPoints: Vector2[] = points.map(point => ({
      x: (point.x - centerX) / scale,
      y: -((point.y - centerY) / scale) // Flip Y-axis
    }));

    return {
      points: normalizedPoints,
      boundingBox: { minX, maxX, minY, maxY }
    };
  }

  /**
   * Generate default circular contour as fallback
   * @returns ContourData - Default circular contour
   */
  private getDefaultCircleContour(): ContourData {
    console.log('🔵 Using default circular contour as fallback');

    const points: Vector2[] = [];
    const numPoints = this.targetPointCount;

    // Generate circle points in normalized [-1, 1] space
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      points.push({
        x: Math.cos(angle) * 0.8, // Slightly smaller circle
        y: Math.sin(angle) * 0.8
      });
    }

    return {
      points,
      boundingBox: {
        minX: -0.8,
        maxX: 0.8,
        minY: -0.8,
        maxY: 0.8
      }
    };
  }
}

export default new ContourExtractionService();
