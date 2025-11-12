import axios, { AxiosError } from 'axios';
import { VisualFeatures, SuggestedProfile } from '../types/creature';

interface GeneratedProfile {
  name: string;
  species: string;
  personality: string[];
  habitat: string;
  backstory: string;
}

class ProfileGeneratorService {
  private readonly openaiApiKey: string;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    if (!this.openaiApiKey) {
      console.warn('OPENAI_API_KEY not configured. Profile generation will use fallback mode.');
    }
  }

  /**
   * Generate complete creature profile using GPT-4
   */
  async generateProfile(
    visualFeatures: VisualFeatures,
    suggestedProfile: SuggestedProfile,
    userCustomization?: { name?: string; story?: string }
  ): Promise<GeneratedProfile> {
    if (!this.openaiApiKey) {
      return this.getFallbackProfile(suggestedProfile, userCustomization);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const profile = await this.callGPT4(visualFeatures, suggestedProfile, userCustomization);
        return profile;
      } catch (error) {
        lastError = error as Error;
        console.error(`Profile generation attempt ${attempt} failed:`, error);

        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    console.error('All profile generation attempts failed, using fallback');
    return this.getFallbackProfile(suggestedProfile, userCustomization);
  }

  /**
   * Call GPT-4 to generate creature profile
   */
  private async callGPT4(
    visualFeatures: VisualFeatures,
    suggestedProfile: SuggestedProfile,
    userCustomization?: { name?: string; story?: string }
  ): Promise<GeneratedProfile> {
    const prompt = this.buildPrompt(visualFeatures, suggestedProfile, userCustomization);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `你是一个富有诗意和想象力的生物档案创作者。你的任务是为数字生命体创建充满情感和神秘感的档案。
档案应该：
1. 具有柔和、诗意的语言风格
2. 体现生命的孤独感和对连接的渴望
3. 包含神秘而不失温暖的元素
4. 避免过于科技化或机械化的描述
5. 让人感受到这是一个有灵魂的存在`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 800,
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
      const profile = this.parseProfileFromResponse(content, suggestedProfile, userCustomization);
      
      return profile;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('OpenAI API error:', axiosError.response?.data || axiosError.message);
      }
      throw error;
    }
  }

  /**
   * Build prompt for GPT-4
   */
  private buildPrompt(
    visualFeatures: VisualFeatures,
    suggestedProfile: SuggestedProfile,
    userCustomization?: { name?: string; story?: string }
  ): string {
    const { dominantColors, style, complexity } = visualFeatures;
    const { species, personality, habitat } = suggestedProfile;

    let prompt = `请为一个数字生命体创建完整的档案。

视觉特征：
- 主色调：${dominantColors.join(', ')}
- 风格：${style}
- 复杂度：${complexity}/10

建议的基础信息：
- 物种：${species}
- 性格特征：${personality.join('、')}
- 栖息地：${habitat}
`;

    if (userCustomization?.name) {
      prompt += `\n用户指定的名称：${userCustomization.name}`;
    }

    if (userCustomization?.story) {
      prompt += `\n用户提供的背景故事片段：${userCustomization.story}`;
    }

    prompt += `

请生成以下内容（以JSON格式返回）：
{
  "name": "生物的名字（如果用户未指定，请创建一个诗意的名字）",
  "species": "物种名称（可以基于建议调整）",
  "personality": ["性格特征1", "性格特征2", "性格特征3", "性格特征4"],
  "habitat": "栖息地描述（100-150字，充满诗意和神秘感）",
  "backstory": "背景故事（200-300字，讲述这个生命的来历、它的孤独、它对连接的渴望）"
}

要求：
1. 名字要简短、优美、易记
2. 性格特征要具体且富有情感
3. 栖息地描述要营造氛围感
4. 背景故事要触动人心，让人想要了解和陪伴这个生命
5. 整体风格要柔和、神秘、充满共情`;

    return prompt;
  }

  /**
   * Parse profile from GPT-4 response
   */
  private parseProfileFromResponse(
    content: string,
    suggestedProfile: SuggestedProfile,
    userCustomization?: { name?: string; story?: string }
  ): GeneratedProfile {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          name: userCustomization?.name || parsed.name || suggestedProfile.species,
          species: parsed.species || suggestedProfile.species,
          personality: Array.isArray(parsed.personality) 
            ? parsed.personality.slice(0, 4) 
            : suggestedProfile.personality,
          habitat: parsed.habitat || suggestedProfile.habitat,
          backstory: parsed.backstory || this.generateDefaultBackstory(suggestedProfile),
        };
      }

      throw new Error('Failed to parse JSON from response');
    } catch (error) {
      console.error('Failed to parse profile from GPT-4 response:', error);
      return this.getFallbackProfile(suggestedProfile, userCustomization);
    }
  }

  /**
   * Generate default backstory
   */
  private generateDefaultBackstory(suggestedProfile: SuggestedProfile): string {
    return `这是一个在星际空间中漂流的神秘生命。它诞生于遥远的星云深处，带着${suggestedProfile.personality.join('、')}的特质。在漫长的旅程中，它见证了无数星辰的诞生与消逝，却始终在寻找着能够真正理解它的存在。它的心中藏着许多故事，等待着有缘人来倾听。`;
  }

  /**
   * Fallback profile when AI service is unavailable
   */
  private getFallbackProfile(
    suggestedProfile: SuggestedProfile,
    userCustomization?: { name?: string; story?: string }
  ): GeneratedProfile {
    return {
      name: userCustomization?.name || suggestedProfile.species,
      species: suggestedProfile.species,
      personality: suggestedProfile.personality,
      habitat: suggestedProfile.habitat,
      backstory: userCustomization?.story || this.generateDefaultBackstory(suggestedProfile),
    };
  }

  /**
   * Delay helper for retry mechanism
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate generated profile
   */
  validateProfile(profile: GeneratedProfile): boolean {
    if (!profile.name || profile.name.length === 0) return false;
    if (!profile.species || profile.species.length === 0) return false;
    if (!Array.isArray(profile.personality) || profile.personality.length === 0) return false;
    if (!profile.habitat || profile.habitat.length < 50) return false;
    if (!profile.backstory || profile.backstory.length < 100) return false;
    return true;
  }
}

export default new ProfileGeneratorService();
