import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

class StorageService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'creatures');
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  }

  /**
   * Initialize storage directory
   */
  async initialize(): Promise<void> {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
      console.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  /**
   * Save image from base64 data
   */
  async saveImage(imageData: string, userId: string): Promise<string> {
    try {
      // Ensure upload directory exists
      await this.initialize();

      // Extract base64 data and format
      const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid image data format');
      }

      const imageFormat = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const filename = `${userId}_${timestamp}_${randomString}.${imageFormat}`;
      const filepath = path.join(this.uploadDir, filename);

      // Save file
      await writeFile(filepath, buffer);

      // Return public URL
      const publicUrl = `${this.baseUrl}/uploads/creatures/${filename}`;
      return publicUrl;
    } catch (error) {
      console.error('Error saving image:', error);
      throw new Error('Failed to save image');
    }
  }

  /**
   * Validate image data
   */
  validateImageData(imageData: string): { valid: boolean; error?: string } {
    // Check if it's a valid base64 image
    const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return { valid: false, error: 'Invalid image data format' };
    }

    const imageFormat = matches[1];
    const base64Data = matches[2];

    // Check supported formats
    const supportedFormats = ['png', 'jpeg', 'jpg', 'webp'];
    if (!supportedFormats.includes(imageFormat.toLowerCase())) {
      return { 
        valid: false, 
        error: `Unsupported image format: ${imageFormat}. Supported formats: ${supportedFormats.join(', ')}` 
      };
    }

    // Check size (approximate)
    const sizeInBytes = (base64Data.length * 3) / 4;
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (sizeInBytes > maxSizeInBytes) {
      return { 
        valid: false, 
        error: `Image size exceeds maximum allowed size of 5MB` 
      };
    }

    return { valid: true };
  }
}

export default new StorageService();
