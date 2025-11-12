import axios, { AxiosError } from 'axios';
import { AIAnalysisResult, VisualFeatures } from '../types/creature';

interface ColorAnalysis {
  hex: string;
  percentage: number;
}

class ImageAnalysisService {
  private readonly openaiApiKey: string;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    if (!this.openaiApiKey) {
      console.warn('OPENAI_API_KEY not configured. Image analysis will use fallback mode.');
    }
  }

  /**
   * Analyze image using OpenAI Vision API
   */
  async analyzeImage(imageData: string): Promise<AIAnalysisResult> {
    if (!this.openaiApiKey) {
      return this.getFallbackAnalysis();
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const visualFeatures = await this.extractVisualFeatures(imageData);
        const suggestedProfile = await this.generateProfileSuggestions(visualFeatures);

        return {
          visualFeatures,
          suggestedProfile,
        };
      } catch (error) {
        lastError = error as Error;
        console.error(`Image analysis attempt ${attempt} failed:`, error);

        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    console.error('All image analysis attempts failed, using fallback');
    return this.getFallbackAnalysis();
  }

  /**
   * Extract visual features from image using OpenAI Vision
   */
  private async extractVisualFeatures(imageData: string): Promise<VisualFeatures> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this creature image and provide:
1. Dominant colors (3-5 hex codes)
2. Visual style (e.g., "soft and dreamy", "bold and geometric", "organic and flowing")
3. Complexity score (0-10, where 0 is very simple and 10 is highly detailed)

Respond in JSON format:
{
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  "style": "description",
  "complexity": number
}`,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
          timeout: 30000,
        }
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          dominantColors: parsed.dominantColors || ['#808080'],
          style: parsed.style || 'mysterious',
          complexity: parsed.complexity || 5,
        };
      }

      throw new Error('Failed to parse visual features from AI response');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('OpenAI API error:', axiosError.response?.data || axiosError.message);
      }
      throw error;
    }
  }

  /**
   * Generate profile suggestions based on visual features
   */
  private async generateProfileSuggestions(
    visualFeatures: VisualFeatures
  ): Promise<AIAnalysisResult['suggestedProfile']> {
    const { dominantColors, style, complexity } = visualFeatures;

    // Simple heuristic-based suggestions
    const colorMood = this.analyzeColorMood(dominantColors);
    const personalityTraits = this.derivePersonalityFromStyle(style, complexity, colorMood);
    const species = this.generateSpeciesName(style, complexity);
    const habitat = this.generateHabitat(colorMood, style);

    return {
      species,
      personality: personalityTraits,
      habitat,
    };
  }

  /**
   * Analyze color mood from dominant colors
   */
  private analyzeColorMood(colors: string[]): string {
    // Simple color analysis based on brightness and saturation
    const brightColors = colors.filter((c) => {
      const hex = c.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r + g + b) / 3;
      return brightness > 150;
    });

    if (brightColors.length > colors.length / 2) {
      return 'bright';
    } else {
      return 'dark';
    }
  }

  /**
   * Derive personality traits from visual style
   */
  private derivePersonalityFromStyle(
    style: string,
    complexity: number,
    colorMood: string
  ): string[] {
    const traits: string[] = [];

    if (style.includes('soft') || style.includes('gentle')) {
      traits.push('温柔', '善良');
    }
    if (style.includes('bold') || style.includes('sharp')) {
      traits.push('勇敢', '直率');
    }
    if (style.includes('organic') || style.includes('flowing')) {
      traits.push('自由', '灵动');
    }
    if (complexity > 7) {
      traits.push('复杂', '深邃');
    } else if (complexity < 4) {
      traits.push('纯真', '简单');
    }
    if (colorMood === 'bright') {
      traits.push('乐观', '活泼');
    } else {
      traits.push('神秘', '内敛');
    }

    return traits.slice(0, 4);
  }

  /**
   * Generate species name based on visual characteristics
   */
  private generateSpeciesName(style: string, complexity: number): string {
    const prefixes = ['星', '月', '云', '光', '影', '梦', '幻', '灵'];
    const suffixes = ['灵', '兽', '精', '魂', '体', '影', '光', '者'];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${prefix}${suffix}`;
  }

  /**
   * Generate habitat description
   */
  private generateHabitat(colorMood: string, style: string): string {
    if (colorMood === 'bright') {
      return '栖息于星云深处的光明之地，那里充满了温暖的星光和柔和的能量波动';
    } else {
      return '游荡在宇宙边缘的暗影区域，那里时间流动缓慢，充满了未知的神秘';
    }
  }

  /**
   * Fallback analysis when AI service is unavailable
   */
  private getFallbackAnalysis(): AIAnalysisResult {
    return {
      visualFeatures: {
        dominantColors: ['#808080', '#A0A0A0', '#606060'],
        style: 'mysterious and ethereal',
        complexity: 5,
      },
      suggestedProfile: {
        species: '星际漂流者',
        personality: ['神秘', '温柔', '孤独', '智慧'],
        habitat: '在星际空间中自由漂流，寻找着能够理解它的存在',
      },
    };
  }

  /**
   * Delay helper for retry mechanism
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new ImageAnalysisService();
